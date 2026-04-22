export enum SourceType {
  RSS = 'rss',
  SOCIAL_API = 'social_api',
  MANUAL = 'manual',
}

export enum SourceStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export enum TopicStatus {
  CANDIDATE = 'candidate',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum DraftType {
  SUMMARY = 'summary',
  DEEP = 'deep',
}

export enum DraftStatus {
  DRAFT = 'draft',
  RENDERED = 'rendered',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export enum AssetType {
  COVER = 'cover',
  PAGE = 'page',
  THUMBNAIL = 'thumbnail',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REGENERATE_REQUESTED = 'regenerate_requested',
}

export enum PublishStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum PlatformType {
  XIAOHONGSHU = 'xiaohongshu',
  DOUYIN = 'douyin',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
}

export enum PublishMode {
  SEMI_AUTO = 'semi_auto',
  DIRECT_API = 'direct_api',
}
