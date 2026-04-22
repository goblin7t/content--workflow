CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reviewer', 'operator');
CREATE TYPE source_type AS ENUM ('rss', 'social_api', 'manual');
CREATE TYPE source_status AS ENUM ('active', 'disabled');
CREATE TYPE topic_status AS ENUM ('candidate', 'selected', 'rejected', 'archived');
CREATE TYPE draft_type AS ENUM ('summary', 'deep');
CREATE TYPE draft_status AS ENUM (
  'draft',
  'rendered',
  'in_review',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'failed'
);
CREATE TYPE asset_type AS ENUM ('cover', 'page', 'thumbnail');
CREATE TYPE platform_type AS ENUM ('xiaohongshu', 'douyin', 'tiktok', 'facebook');
CREATE TYPE publish_mode AS ENUM ('semi_auto', 'direct_api');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected', 'regenerate_requested');
CREATE TYPE publish_status AS ENUM ('queued', 'running', 'published', 'failed', 'cancelled');
CREATE TYPE publish_idempotency_scope AS ENUM ('create_task', 'run_task');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'editor',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  type source_type NOT NULL,
  platform VARCHAR(50) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status source_status NOT NULL DEFAULT 'active',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sources_platform ON sources(platform);
CREATE INDEX idx_sources_status ON sources(status);

CREATE TABLE raw_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  url TEXT NOT NULL,
  title TEXT,
  raw_text TEXT,
  raw_media JSONB NOT NULL DEFAULT '[]'::jsonb,
  author VARCHAR(255),
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  language_code VARCHAR(16),
  content_hash VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_raw_items_source_external_id UNIQUE (source_id, external_id),
  CONSTRAINT uq_raw_items_content_hash UNIQUE (content_hash)
);

CREATE INDEX idx_raw_items_source_id ON raw_items(source_id);
CREATE INDEX idx_raw_items_published_at ON raw_items(published_at);
CREATE INDEX idx_raw_items_fetched_at ON raw_items(fetched_at);

CREATE TABLE normalized_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_item_id UUID NOT NULL REFERENCES raw_items(id) ON DELETE CASCADE,
  clean_title TEXT,
  clean_text TEXT,
  summary TEXT,
  entities JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  dedupe_key VARCHAR(128) NOT NULL,
  quality_score DOUBLE PRECISION,
  topic_cluster_key VARCHAR(128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_normalized_items_raw_item_id UNIQUE (raw_item_id)
);

CREATE INDEX idx_normalized_items_dedupe_key ON normalized_items(dedupe_key);
CREATE INDEX idx_normalized_items_topic_cluster_key ON normalized_items(topic_cluster_key);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_date DATE NOT NULL,
  title TEXT NOT NULL,
  angle TEXT,
  summary TEXT,
  score DOUBLE PRECISION NOT NULL DEFAULT 0,
  status topic_status NOT NULL DEFAULT 'candidate',
  cluster_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_by_id UUID REFERENCES users(id),
  selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_topics_topic_date ON topics(topic_date);
CREATE INDEX idx_topics_status ON topics(status);
CREATE INDEX idx_topics_score ON topics(score);

CREATE TABLE topic_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  normalized_item_id UUID NOT NULL REFERENCES normalized_items(id) ON DELETE CASCADE,
  weight DOUBLE PRECISION NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_topic_items_topic_normalized UNIQUE (topic_id, normalized_item_id)
);

CREATE INDEX idx_topic_items_topic_id ON topic_items(topic_id);

CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  draft_type draft_type NOT NULL,
  language_code VARCHAR(16) NOT NULL DEFAULT 'zh-CN',
  tone VARCHAR(50) NOT NULL DEFAULT 'professional',
  title TEXT,
  outline JSONB NOT NULL DEFAULT '[]'::jsonb,
  body TEXT,
  facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  version INT NOT NULL DEFAULT 1,
  status draft_status NOT NULL DEFAULT 'draft',
  created_by_id UUID REFERENCES users(id),
  updated_by_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_drafts_topic_id ON drafts(topic_id);
CREATE INDEX idx_drafts_status ON drafts(status);
CREATE INDEX idx_drafts_draft_type ON drafts(draft_type);

CREATE TABLE draft_source_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
  normalized_item_id UUID NOT NULL REFERENCES normalized_items(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_draft_source_refs_draft_normalized UNIQUE (draft_id, normalized_item_id)
);

CREATE INDEX idx_draft_source_refs_draft_id ON draft_source_references(draft_id);

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  asset_type asset_type NOT NULL,
  page_no INT,
  storage_url TEXT NOT NULL,
  width INT,
  height INT,
  mime_type VARCHAR(100),
  template_name VARCHAR(120),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_draft_id ON assets(draft_id);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);

CREATE TABLE channel_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  title TEXT,
  caption TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  cover_asset_id UUID REFERENCES assets(id),
  publish_mode publish_mode NOT NULL DEFAULT 'semi_auto',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_channel_variants_draft_platform UNIQUE (draft_id, platform)
);

CREATE INDEX idx_channel_variants_platform ON channel_variants(platform);
CREATE INDEX idx_channel_variants_draft_id ON channel_variants(draft_id);

CREATE TABLE channel_variant_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_variant_id UUID NOT NULL REFERENCES channel_variants(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_channel_variant_assets_variant_asset UNIQUE (channel_variant_id, asset_id)
);

CREATE INDEX idx_channel_variant_assets_variant_sort
  ON channel_variant_assets(channel_variant_id, sort_order);

CREATE TABLE review_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES drafts(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  status review_status NOT NULL DEFAULT 'pending',
  comments TEXT,
  scheduled_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_review_tasks_draft_id UNIQUE (draft_id)
);

CREATE INDEX idx_review_tasks_status ON review_tasks(status);
CREATE INDEX idx_review_tasks_reviewer_id ON review_tasks(reviewer_id);

CREATE TABLE publish_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_variant_id UUID NOT NULL REFERENCES channel_variants(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  status publish_status NOT NULL DEFAULT 'queued',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  remote_post_id VARCHAR(255),
  retry_count INT NOT NULL DEFAULT 0,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_publish_tasks_status ON publish_tasks(status);
CREATE INDEX idx_publish_tasks_platform ON publish_tasks(platform);
CREATE INDEX idx_publish_tasks_scheduled_at ON publish_tasks(scheduled_at);

CREATE TABLE publish_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope publish_idempotency_scope NOT NULL,
  idempotency_key VARCHAR(255) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  publish_task_id UUID REFERENCES publish_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_publish_idempotency_scope_key UNIQUE (scope, idempotency_key)
);

CREATE INDEX idx_publish_idempotency_publish_task_id
  ON publish_idempotency_keys(publish_task_id);

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publish_task_id UUID NOT NULL REFERENCES publish_tasks(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  views INT NOT NULL DEFAULT 0,
  likes INT NOT NULL DEFAULT 0,
  comments INT NOT NULL DEFAULT 0,
  shares INT NOT NULL DEFAULT 0,
  saves INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_performance_metrics_publish_task_captured_at UNIQUE (publish_task_id, captured_at)
);

CREATE INDEX idx_performance_metrics_publish_task_id ON performance_metrics(publish_task_id);
CREATE INDEX idx_performance_metrics_platform ON performance_metrics(platform);
CREATE INDEX idx_performance_metrics_captured_at ON performance_metrics(captured_at);

CREATE TABLE content_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'queued',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_jobs_status ON content_jobs(status);
CREATE INDEX idx_content_jobs_job_type ON content_jobs(job_type);

CREATE OR REPLACE FUNCTION enforce_review_task_source_refs()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM draft_source_references dsr
    WHERE dsr.draft_id = NEW.draft_id
  ) THEN
    RAISE EXCEPTION 'review task requires at least one draft source reference';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_tasks_require_source_refs
BEFORE INSERT OR UPDATE OF draft_id ON review_tasks
FOR EACH ROW
EXECUTE FUNCTION enforce_review_task_source_refs();

CREATE OR REPLACE FUNCTION prevent_performance_metric_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'performance_metrics is append-only; updates and deletes are not allowed';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_performance_metrics_no_update
BEFORE UPDATE ON performance_metrics
FOR EACH ROW
EXECUTE FUNCTION prevent_performance_metric_mutation();

CREATE TRIGGER trg_performance_metrics_no_delete
BEFORE DELETE ON performance_metrics
FOR EACH ROW
EXECUTE FUNCTION prevent_performance_metric_mutation();

CREATE OR REPLACE FUNCTION enforce_publish_task_platform_match()
RETURNS TRIGGER AS $$
DECLARE
  variant_platform platform_type;
BEGIN
  SELECT platform INTO variant_platform
  FROM channel_variants
  WHERE id = NEW.channel_variant_id;

  IF variant_platform IS NULL THEN
    RAISE EXCEPTION 'channel variant not found for publish task';
  END IF;

  IF variant_platform <> NEW.platform THEN
    RAISE EXCEPTION 'publish task platform must match channel variant platform';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_publish_tasks_platform_match
BEFORE INSERT OR UPDATE OF channel_variant_id, platform ON publish_tasks
FOR EACH ROW
EXECUTE FUNCTION enforce_publish_task_platform_match();
