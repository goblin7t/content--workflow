export function renderDashboardPage(): string {
  return String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>内容工作流 Dashboard</title>
  <style>
    :root {
      --ink: #17201b;
      --muted: #68736d;
      --paper: #f6f1e8;
      --card: rgba(255, 252, 244, 0.82);
      --line: rgba(30, 42, 35, 0.14);
      --mint: #73b89d;
      --clay: #c86f43;
      --gold: #e8b849;
      --sky: #668fc8;
      --shadow: 0 24px 70px rgba(39, 49, 43, 0.16);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--ink);
      font-family: "Avenir Next", "Trebuchet MS", Verdana, sans-serif;
      background:
        radial-gradient(circle at 12% 6%, rgba(115, 184, 157, 0.38), transparent 34rem),
        radial-gradient(circle at 88% 0%, rgba(232, 184, 73, 0.34), transparent 30rem),
        linear-gradient(135deg, #f5efe4 0%, #e8eee5 100%);
      min-height: 100vh;
    }

    .shell {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      padding: 34px 0 54px;
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 22px;
      align-items: end;
      margin-bottom: 22px;
      animation: rise 480ms ease-out both;
    }

    .eyebrow {
      color: var(--clay);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    h1 {
      margin: 8px 0 10px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(38px, 7vw, 84px);
      line-height: 0.9;
      letter-spacing: -0.06em;
    }

    .subtitle {
      color: var(--muted);
      max-width: 660px;
      font-size: 16px;
      line-height: 1.7;
    }

    .actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .filters {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      align-items: end;
      margin-bottom: 16px;
      padding: 18px;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    .field label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .field input,
    .field select {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 12px 14px;
      color: var(--ink);
      background: rgba(255, 255, 255, 0.6);
      font: inherit;
    }

    .filter-summary {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 16px;
      padding: 16px 18px;
    }

    .filter-summary strong {
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .summary-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 0;
      cursor: pointer;
      font: inherit;
    }

    .summary-chip .chip-close {
      font-size: 11px;
      line-height: 1;
      opacity: 0.72;
    }

    .result-summary {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 16px;
      padding: 16px 18px;
    }

    .result-summary strong {
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .feedback {
      display: grid;
      gap: 6px;
      margin-bottom: 16px;
      padding: 16px 18px;
    }

    .feedback[hidden] {
      display: none;
    }

    .feedback-title {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .feedback-message {
      line-height: 1.6;
    }

    .feedback.ok {
      border-color: rgba(115, 184, 157, 0.3);
      background: rgba(115, 184, 157, 0.12);
    }

    .feedback.error {
      border-color: rgba(200, 111, 67, 0.3);
      background: rgba(200, 111, 67, 0.12);
    }

    .feedback.busy {
      border-color: rgba(232, 184, 73, 0.3);
      background: rgba(232, 184, 73, 0.12);
    }

    button {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 12px 18px;
      cursor: pointer;
      color: var(--ink);
      background: rgba(255, 255, 255, 0.52);
      font-weight: 800;
      box-shadow: 0 10px 24px rgba(33, 43, 37, 0.08);
    }

    button.primary {
      color: #fffaf0;
      background: var(--ink);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.58;
      transform: none;
      box-shadow: none;
    }

    .grid {
      display: grid;
      gap: 16px;
    }

    .metrics {
      grid-template-columns: repeat(6, minmax(0, 1fr));
      margin-bottom: 16px;
    }

    .card {
      position: relative;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 28px;
      background: var(--card);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
      animation: rise 560ms ease-out both;
    }

    .metric {
      padding: 18px;
      min-height: 128px;
    }

    .metric::after {
      content: "";
      position: absolute;
      width: 92px;
      height: 92px;
      right: -28px;
      bottom: -28px;
      border-radius: 999px;
      background: rgba(115, 184, 157, 0.24);
    }

    .metric:nth-child(2)::after { background: rgba(232, 184, 73, 0.28); }
    .metric:nth-child(3)::after { background: rgba(200, 111, 67, 0.24); }
    .metric:nth-child(4)::after { background: rgba(102, 143, 200, 0.24); }

    .label {
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
    }

    .value {
      margin-top: 16px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 44px;
      line-height: 1;
      letter-spacing: -0.05em;
    }

    .main {
      grid-template-columns: 1.15fr 0.85fr;
      align-items: start;
    }

    .panel {
      padding: 22px;
    }

    .panel h2 {
      margin: 0 0 16px;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 28px;
      letter-spacing: -0.04em;
    }

    .pipeline {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }

    .step {
      min-height: 128px;
      border: 1px dashed rgba(23, 32, 27, 0.2);
      border-radius: 22px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.34);
    }

    .step strong {
      display: block;
      margin: 10px 0 6px;
      font-size: 22px;
    }

    .bar {
      height: 10px;
      border-radius: 999px;
      background: rgba(23, 32, 27, 0.08);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--mint), var(--gold), var(--clay));
      transition: width 500ms ease;
    }

    .platforms {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .platform {
      width: 100%;
      text-align: left;
      cursor: pointer;
      color: inherit;
      padding: 14px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.42);
      border: 1px solid var(--line);
    }

    .platform:hover,
    .platform:focus-visible,
    .interactive-row:hover,
    .interactive-row:focus-visible {
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(33, 43, 37, 0.12);
    }

    .platform-name {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-weight: 900;
      margin-bottom: 12px;
    }

    .list {
      display: grid;
      gap: 10px;
    }

    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      padding: 13px 0;
      border-top: 1px solid var(--line);
    }

    .interactive-row {
      width: 100%;
      text-align: left;
      cursor: pointer;
      color: inherit;
      border: 0;
      background: transparent;
      border-radius: 16px;
      padding-left: 12px;
      padding-right: 12px;
      margin-left: -12px;
      margin-right: -12px;
      transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
    }

    .interactive-row:hover,
    .interactive-row:focus-visible {
      background: rgba(255, 255, 255, 0.46);
    }

    .row:first-child { border-top: 0; }

    .title {
      font-weight: 900;
      line-height: 1.35;
    }

    .meta {
      color: var(--muted);
      font-size: 13px;
      margin-top: 4px;
      line-height: 1.45;
    }

    .pill {
      align-self: start;
      border-radius: 999px;
      padding: 6px 10px;
      background: rgba(23, 32, 27, 0.08);
      color: var(--ink);
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .pill.ok { background: rgba(115, 184, 157, 0.26); }
    .pill.warn { background: rgba(232, 184, 73, 0.28); }
    .pill.hot { background: rgba(200, 111, 67, 0.24); }

    .empty, .status {
      color: var(--muted);
      padding: 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.36);
    }

    .split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .control-room {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
      margin-top: 16px;
    }

    .stage-rail {
      position: sticky;
      top: 18px;
      padding: 20px;
      display: grid;
      gap: 16px;
    }

    .stage-nav-header {
      display: grid;
      gap: 6px;
    }

    .stage-nav-header strong {
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--clay);
    }

    .stage-nav-header span {
      color: var(--muted);
      font-size: 14px;
      line-height: 1.6;
    }

    .stage-nav {
      display: grid;
      gap: 10px;
    }

    .stage-nav-btn {
      width: 100%;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: center;
      text-align: left;
      border-radius: 20px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.42);
    }

    .stage-nav-btn.active {
      border-color: rgba(23, 32, 27, 0.24);
      background: rgba(23, 32, 27, 0.9);
      color: #fffaf0;
      box-shadow: 0 18px 34px rgba(23, 32, 27, 0.18);
    }

    .stage-nav-btn.active .meta {
      color: rgba(255, 250, 240, 0.72);
    }

    .stage-count {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 900;
      background: rgba(23, 32, 27, 0.08);
      color: inherit;
      white-space: nowrap;
    }

    .stage-nav-btn.active .stage-count {
      background: rgba(255, 250, 240, 0.18);
    }

    .stage-hint {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.34);
      border: 1px dashed rgba(23, 32, 27, 0.14);
    }

    .stage-content {
      display: grid;
      gap: 16px;
      min-width: 0;
    }

    .stage-panel[hidden] {
      display: none;
    }

    .workbench {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 16px;
      align-items: start;
    }

    .topic-row.active {
      background: rgba(115, 184, 157, 0.18);
      box-shadow: 0 14px 28px rgba(33, 43, 37, 0.12);
    }

    .draft-row.active {
      background: rgba(232, 184, 73, 0.18);
      box-shadow: 0 14px 28px rgba(33, 43, 37, 0.12);
    }

    .review-row.active {
      background: rgba(102, 143, 200, 0.18);
      box-shadow: 0 14px 28px rgba(33, 43, 37, 0.12);
    }

    .publish-row.active {
      background: rgba(196, 116, 88, 0.18);
      box-shadow: 0 14px 28px rgba(33, 43, 37, 0.12);
    }

    .detail-stack {
      display: grid;
      gap: 12px;
    }

    .detail-card {
      padding: 16px;
      border-radius: 22px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.42);
    }

    .detail-kicker {
      color: var(--clay);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .detail-title {
      margin: 8px 0;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 30px;
      line-height: 1;
      letter-spacing: -0.04em;
    }

    .detail-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .detail-note {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 980px) {
      .hero, .main, .split, .workbench, .control-room { grid-template-columns: 1fr; }
      .filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pipeline, .platforms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .actions { justify-content: flex-start; }
      .stage-rail {
        position: static;
      }
      .stage-nav {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .shell { width: min(100% - 20px, 1180px); padding-top: 22px; }
      .filters,
      .metrics, .pipeline, .platforms { grid-template-columns: 1fr; }
      .metric { min-height: 110px; }
      .stage-nav { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <div class="eyebrow">Content Workflow Observatory</div>
        <h1>内容工作流<br />可视化看板</h1>
        <p class="subtitle">把每日采集、选题、图文草稿、人工审核和多平台发布串成一张图。第一版不依赖外部图表库，方便稳定接入真实业务数据。</p>
      </div>
      <div class="actions">
        <button id="refreshBtn">刷新数据</button>
        <button class="primary" id="demoBtn">运行 Demo</button>
      </div>
    </section>

    <section class="card filters">
      <div class="field">
        <label for="dateFilter">日期</label>
        <input id="dateFilter" type="date" />
      </div>
      <div class="field">
        <label for="platformFilter">平台</label>
        <select id="platformFilter">
          <option value="">全部平台</option>
          <option value="rss">rss</option>
          <option value="xiaohongshu">xiaohongshu</option>
          <option value="douyin">douyin</option>
          <option value="tiktok">tiktok</option>
          <option value="facebook">facebook</option>
        </select>
      </div>
      <div class="field">
        <label for="draftStatusFilter">草稿状态</label>
        <select id="draftStatusFilter">
          <option value="">全部草稿</option>
          <option value="draft">draft</option>
          <option value="rendered">rendered</option>
          <option value="in_review">in_review</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="scheduled">scheduled</option>
          <option value="published">published</option>
          <option value="failed">failed</option>
        </select>
      </div>
      <div class="field">
        <label for="publishStatusFilter">发布状态</label>
        <select id="publishStatusFilter">
          <option value="">全部发布任务</option>
          <option value="queued">queued</option>
          <option value="running">running</option>
          <option value="published">published</option>
          <option value="failed">failed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      <div class="field">
        <label for="sourceStatusFilter">来源状态</label>
        <select id="sourceStatusFilter">
          <option value="">全部来源</option>
          <option value="active">active</option>
          <option value="disabled">disabled</option>
        </select>
      </div>
      <div class="field">
        <label for="topicStatusFilter">选题状态</label>
        <select id="topicStatusFilter">
          <option value="">全部选题</option>
          <option value="candidate">candidate</option>
          <option value="selected">selected</option>
          <option value="rejected">rejected</option>
          <option value="archived">archived</option>
        </select>
      </div>
      <div class="field">
        <label for="reviewStatusFilter">审核状态</label>
        <select id="reviewStatusFilter">
          <option value="">全部审核任务</option>
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
          <option value="regenerate_requested">regenerate_requested</option>
        </select>
      </div>
      <div class="actions">
        <button class="primary" id="applyFiltersBtn">应用筛选</button>
        <button id="resetFiltersBtn">清空筛选</button>
      </div>
    </section>

    <section class="card filter-summary" id="filterSummary"></section>
    <section class="card result-summary" id="resultSummary"></section>
    <section class="card feedback" id="feedback" hidden></section>

    <section class="grid metrics" id="metrics"></section>

    <section class="control-room">
      <aside class="card stage-rail">
        <div class="stage-nav-header">
          <strong>Workflow Control</strong>
          <span>左侧选阶段，右侧只保留当前工作区，让推进动作和状态变化更聚焦。</span>
        </div>
        <div class="stage-nav" id="stageNav"></div>
        <div class="stage-hint" id="stageHint"></div>
      </aside>

      <div class="stage-content">
        <section class="grid main stage-panel" data-stage-panel="overview">
          <article class="card panel">
            <h2>业务管线</h2>
            <div class="pipeline" id="pipeline"></div>
          </article>

          <article class="card panel">
            <h2>发布渠道</h2>
            <div class="platforms" id="platforms"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="topics">
          <article class="card panel">
            <h2>选题工作区</h2>
            <div class="list" id="topics"></div>
          </article>

          <article class="card panel">
            <h2>选题详情</h2>
            <div class="detail-stack" id="topicDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="drafts">
          <article class="card panel">
            <h2>草稿工作区</h2>
            <div class="list" id="drafts"></div>
          </article>

          <article class="card panel">
            <h2>草稿详情</h2>
            <div class="detail-stack" id="draftDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="reviews">
          <article class="card panel">
            <h2>审核工作区</h2>
            <div class="list" id="reviews"></div>
          </article>

          <article class="card panel">
            <h2>审核详情</h2>
            <div class="detail-stack" id="reviewDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="publish">
          <article class="card panel">
            <h2>发布工作区</h2>
            <div class="list" id="publishWorkbench"></div>
          </article>

          <article class="card panel">
            <h2>发布详情</h2>
            <div class="detail-stack" id="publishDetail"></div>
          </article>
        </section>

        <section class="split stage-panel" data-stage-panel="sources">
          <article class="card panel">
            <h2>信息来源</h2>
            <div class="list" id="sources"></div>
          </article>

          <article class="card panel">
            <h2>最近发布筛选</h2>
            <div class="list" id="publishes"></div>
          </article>
        </section>
      </div>
    </section>

    <p class="status" id="status">正在读取工作流数据...</p>
  </main>

  <script>
    const apiRoot = location.pathname.startsWith('/api/v1') ? '/api/v1' : '';
    const $ = (id) => document.getElementById(id);
    const status = $('status');
    const filterSummary = $('filterSummary');
    const resultSummary = $('resultSummary');
    const feedback = $('feedback');
    const stageNav = $('stageNav');
    const stageHint = $('stageHint');
    const topicDetail = $('topicDetail');
    const draftDetail = $('draftDetail');
    const reviewDetail = $('reviewDetail');
    const publishDetail = $('publishDetail');
    const filterFields = {
      date: $('dateFilter'),
      platform: $('platformFilter'),
      draftStatus: $('draftStatusFilter'),
      publishStatus: $('publishStatusFilter'),
      sourceStatus: $('sourceStatusFilter'),
      topicStatus: $('topicStatusFilter'),
      reviewStatus: $('reviewStatusFilter')
    };
    let latestVisualization = null;
    let selectedTopicId = '';
    let selectedDraftId = '';
    let selectedReviewId = '';
    let selectedPublishKey = '';
    let activeStage = 'overview';
    let isBusy = false;
    let busyActionKey = '';
    let lastLoadedAt = '';
    const stageConfig = [
      { key: 'overview', label: '总览', note: '先看全局吞吐、平台分布和流程健康度。' },
      { key: 'topics', label: '选题', note: '从候选选题开始推进，决定今天要写什么。' },
      { key: 'drafts', label: '草稿', note: '围绕草稿补素材、提审或重生成。' },
      { key: 'reviews', label: '审核', note: '聚焦人工判断，把可发内容往前推进。' },
      { key: 'publish', label: '发布', note: '创建、执行、重试或取消发布任务。' },
      { key: 'sources', label: '来源', note: '检查输入来源和最近发布筛选结果。' }
    ];

    function esc(value) {
      return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char]));
    }

    function metric(label, value) {
      return '<article class="card metric"><div class="label">' + esc(label) + '</div><div class="value">' + esc(value) + '</div></article>';
    }

    function pill(value, tone = '') {
      return '<span class="pill ' + tone + '">' + esc(value) + '</span>';
    }

    function filterChip(key, label, value) {
      return '<button class="pill warn summary-chip" type="button" data-clear-filter="' + esc(key) + '" aria-label="清除筛选 ' + esc(label) + '">' +
        '<span>' + esc(label + '：' + value) + '</span><span class="chip-close">×</span></button>';
    }

    function empty(text) {
      return '<div class="empty">' + esc(text) + '</div>';
    }

    function showFeedback(tone, title, message) {
      feedback.hidden = false;
      feedback.className = 'card feedback ' + tone;
      feedback.innerHTML =
        '<div class="feedback-title">' + esc(title) + '</div>' +
        '<div class="feedback-message">' + esc(message) + '</div>';
    }

    function clearFeedback() {
      feedback.hidden = true;
      feedback.className = 'card feedback';
      feedback.innerHTML = '';
    }

    function setStatus(message) {
      status.textContent = message;
    }

    function getStatusText() {
      if (isBusy) {
        return '处理中：' + busyActionKey;
      }

      if (lastLoadedAt) {
        return '已更新：' + lastLoadedAt;
      }

      return '正在读取工作流数据...';
    }

    function syncControlState() {
      $('refreshBtn').disabled = isBusy;
      $('demoBtn').disabled = isBusy;
      $('applyFiltersBtn').disabled = isBusy;
      $('resetFiltersBtn').disabled = isBusy;
      Object.values(filterFields).forEach((element) => {
        if (element) {
          element.disabled = isBusy;
        }
      });
      setStatus(getStatusText());
    }

    function setBusy(actionKey, message) {
      isBusy = true;
      busyActionKey = actionKey;
      showFeedback('busy', '处理中', message);
      syncControlState();
      if (latestVisualization) {
        render(latestVisualization);
      }
    }

    function clearBusy() {
      isBusy = false;
      busyActionKey = '';
      syncControlState();
      if (latestVisualization) {
        render(latestVisualization);
      }
    }

    function isActionBusy(actionKey) {
      return isBusy && busyActionKey === actionKey;
    }

    function actionLabel(actionKey, label) {
      return isActionBusy(actionKey) ? label + '...' : label;
    }

    async function describeError(response, fallback) {
      let details = '';

      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          if (Array.isArray(data.message)) {
            details = data.message.join('；');
          } else if (typeof data.message === 'string') {
            details = data.message;
          } else if (typeof data.error === 'string') {
            details = data.error;
          }
        } else {
          details = (await response.text()).trim();
        }
      } catch {
        details = '';
      }

      return details ? fallback + '：' + details : fallback + '：HTTP ' + response.status;
    }

    function renderRows(items, formatter, emptyText) {
      return items.length ? items.map(formatter).join('') : empty(emptyText);
    }

    function syncFiltersFromLocation() {
      const search = new URLSearchParams(location.search);
      Object.entries(filterFields).forEach(([key, element]) => {
        if (!element) return;
        element.value = search.get(key) || '';
      });
    }

    function buildQueryString() {
      const search = new URLSearchParams();
      Object.entries(filterFields).forEach(([key, element]) => {
        const value = element && element.value ? element.value.trim() : '';
        if (value) {
          search.set(key, value);
        }
      });
      return search.toString();
    }

    function applyFilters(pushState = true) {
      const query = buildQueryString();
      const hash = '#' + activeStage;
      const nextUrl = (query ? location.pathname + '?' + query : location.pathname) + hash;
      if (pushState) {
        history.replaceState(null, '', nextUrl);
      }
      return query;
    }

    function resolveStage(rawStage) {
      return stageConfig.some((stage) => stage.key === rawStage) ? rawStage : 'overview';
    }

    function syncStageFromLocation() {
      activeStage = resolveStage((location.hash || '').replace(/^#/, ''));
    }

    function setActiveStage(stageKey, pushState = true) {
      activeStage = resolveStage(stageKey);
      if (pushState) {
        const query = buildQueryString();
        const nextUrl = (query ? location.pathname + '?' + query : location.pathname) + '#' + activeStage;
        history.replaceState(null, '', nextUrl);
      }
      if (latestVisualization) {
        render(latestVisualization);
      } else {
        renderStagePanels();
      }
    }

    function renderStagePanels() {
      document.querySelectorAll('[data-stage-panel]').forEach((panel) => {
        panel.hidden = panel.getAttribute('data-stage-panel') !== activeStage;
      });
    }

    function stageCounts(data) {
      return {
        overview: data.platformBreakdown.length,
        topics: data.topics.length,
        drafts: data.drafts.length,
        reviews: data.reviews.length,
        publish: data.publishes.length + data.publishCandidates.length,
        sources: data.sources.length,
      };
    }

    function renderStageNav(data) {
      const counts = stageCounts(data);
      stageNav.innerHTML = stageConfig.map((stage) =>
        '<button class="stage-nav-btn' + (stage.key === activeStage ? ' active' : '') + '" type="button" data-stage-key="' + esc(stage.key) + '" aria-label="切换到' + esc(stage.label) + '">' +
          '<div><div class="title">' + esc(stage.label) + '</div><div class="meta">' + esc(stage.note) + '</div></div>' +
          '<span class="stage-count">' + esc(counts[stage.key]) + '</span>' +
        '</button>'
      ).join('');

      const current = stageConfig.find((stage) => stage.key === activeStage) || stageConfig[0];
      stageHint.textContent = current.note;
      renderStagePanels();
    }

    function renderFilterSummary() {
      const labels = {
        date: '日期',
        platform: '平台',
        draftStatus: '草稿',
        publishStatus: '发布',
        sourceStatus: '来源',
        topicStatus: '选题',
        reviewStatus: '审核'
      };
      const active = Object.entries(filterFields)
        .map(([key, element]) => {
          const value = element && element.value ? element.value.trim() : '';
          return value ? filterChip(key, labels[key], value) : '';
        })
        .filter(Boolean);

      filterSummary.innerHTML = active.length
        ? '<strong>当前筛选</strong>' + active.join('')
        : '<strong>当前筛选</strong>' + pill('未应用筛选', 'ok');
    }

    function syncSelectedTopic(data) {
      const stillExists = data.topics.some((topic) => topic.id === selectedTopicId);
      if (!stillExists) {
        selectedTopicId = data.topics[0] ? data.topics[0].id : '';
      }
    }

    function getSelectedTopic(data) {
      return data.topics.find((topic) => topic.id === selectedTopicId) || null;
    }

    function syncSelectedDraft(data) {
      const stillExists = data.drafts.some((draft) => draft.id === selectedDraftId);
      if (!stillExists) {
        selectedDraftId = data.drafts[0] ? data.drafts[0].id : '';
      }
    }

    function getSelectedDraft(data) {
      return data.drafts.find((draft) => draft.id === selectedDraftId) || null;
    }

    function syncSelectedReview(data) {
      const stillExists = data.reviews.some((review) => review.id === selectedReviewId);
      if (!stillExists) {
        selectedReviewId = data.reviews[0] ? data.reviews[0].id : '';
      }
    }

    function getSelectedReview(data) {
      return data.reviews.find((review) => review.id === selectedReviewId) || null;
    }

    function listPublishEntries(data) {
      const tasks = data.publishes.map((task) => ({
        key: 'task:' + task.id,
        kind: 'task',
        item: task
      }));
      const candidates = data.publishCandidates.map((candidate) => ({
        key: 'candidate:' + candidate.channelVariantId,
        kind: 'candidate',
        item: candidate
      }));
      return tasks.concat(candidates);
    }

    function syncSelectedPublish(data) {
      const entries = listPublishEntries(data);
      const stillExists = entries.some((entry) => entry.key === selectedPublishKey);
      if (!stillExists) {
        selectedPublishKey = entries[0] ? entries[0].key : '';
      }
    }

    function getSelectedPublish(data) {
      return listPublishEntries(data).find((entry) => entry.key === selectedPublishKey) || null;
    }

    function renderTopicDetail(data) {
      const topic = getSelectedTopic(data);
      if (!topic) {
        topicDetail.innerHTML = empty('当前筛选下没有选题可操作。');
        return;
      }

      const canSelect = topic.status !== 'selected';
      const canReject = topic.status !== 'rejected';
      topicDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">Topic Workbench</div>' +
          '<div class="detail-title">' + esc(topic.title) + '</div>' +
          '<div class="meta">' + esc(topic.angle || '暂无选题角度') + '</div>' +
          '<div class="meta">' + esc(topic.summary || '暂无选题摘要') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + topic.status, topic.status === 'selected' ? 'ok' : topic.status === 'rejected' ? 'hot' : 'warn') +
            pill('热度 ' + topic.score, 'warn') +
            pill('候选素材 ' + topic.normalizedItemCount, 'ok') +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">Quick Actions</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-topic-action="select" data-topic-id="' + esc(topic.id) + '"' + (canSelect && !isBusy ? '' : ' disabled') + '>' + actionLabel('topic:select', '选择选题') + '</button>' +
            '<button type="button" data-topic-action="reject" data-topic-id="' + esc(topic.id) + '"' + (canReject && !isBusy ? '' : ' disabled') + '>' + actionLabel('topic:reject', '拒绝选题') + '</button>' +
          '</div>' +
          '<div class="meta">先在这里推进选题状态，后续再把草稿生成、审核与发布动作并入同一套工作台。</div>' +
        '</article>';
    }

    function renderDraftDetail(data) {
      const draft = getSelectedDraft(data);
      if (!draft) {
        draftDetail.innerHTML = empty('当前筛选下没有草稿可操作。');
        return;
      }

      const canSubmitReview = draft.reviewStatus !== 'approved' && draft.reviewStatus !== 'pending';
      draftDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">Draft Workbench</div>' +
          '<div class="detail-title">' + esc(draft.title) + '</div>' +
          '<div class="meta">' + esc(draft.draftType) + ' · 状态 ' + esc(draft.status) + '</div>' +
          '<div class="meta">引用 ' + esc(draft.sourceRefCount) + ' · 素材 ' + esc(draft.assetCount) + ' · 平台版本 ' + esc(draft.variantCount) + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('草稿 ' + draft.status, draft.status === 'approved' ? 'ok' : 'warn') +
            pill('审核 ' + (draft.reviewStatus || 'not_submitted'), draft.reviewStatus === 'approved' ? 'ok' : draft.reviewStatus ? 'warn' : '') +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">Quick Actions</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-draft-action="render" data-draft-id="' + esc(draft.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('draft:render', '渲染素材') + '</button>' +
            '<button type="button" data-draft-action="submit-review" data-draft-id="' + esc(draft.id) + '"' + (canSubmitReview && !isBusy ? '' : ' disabled') + '>' + actionLabel('draft:submit-review', '提交审核') + '</button>' +
            '<button type="button" data-draft-action="regenerate" data-draft-id="' + esc(draft.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('draft:regenerate', '重新生成') + '</button>' +
          '</div>' +
          '<div class="detail-note">当前先接入 3 个高频动作。渲染后会生成标准素材，提交审核后进入 review 阶段，重新生成会把版本推进一轮。</div>' +
        '</article>';
    }

    function renderReviewDetail(data) {
      const review = getSelectedReview(data);
      if (!review) {
        reviewDetail.innerHTML = empty('当前筛选下没有审核任务可操作。');
        return;
      }

      const canApprove = review.availablePlatforms.length > 0;
      reviewDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">Review Workbench</div>' +
          '<div class="detail-title">' + esc(review.draftTitle) + '</div>' +
          '<div class="meta">' + esc(review.draftType) + ' · 审核状态 ' + esc(review.status) + '</div>' +
          '<div class="meta">可发布平台：' + esc(review.availablePlatforms.join(', ') || '暂无平台版本') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + review.status, review.status === 'approved' ? 'ok' : review.status === 'rejected' ? 'hot' : 'warn') +
            (review.scheduledAt ? pill('已排期', 'ok') : pill('未排期', 'warn')) +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">Quick Actions</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-review-action="approve" data-review-id="' + esc(review.id) + '"' + (canApprove && !isBusy ? '' : ' disabled') + '>' + actionLabel('review:approve', '审核通过') + '</button>' +
            '<button type="button" data-review-action="reject" data-review-id="' + esc(review.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('review:reject', '驳回审核') + '</button>' +
            '<button type="button" data-review-action="request-regenerate" data-review-id="' + esc(review.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('review:request-regenerate', '要求重生成') + '</button>' +
          '</div>' +
          '<div class="detail-note">通过会默认带上该草稿已有的全部平台版本；驳回和要求重生成会要求输入一条简短备注。</div>' +
        '</article>';
    }

    function renderPublishDetail(data) {
      const selected = getSelectedPublish(data);
      if (!selected) {
        publishDetail.innerHTML = empty('当前筛选下没有发布任务，也没有待创建的发布候选。');
        return;
      }

      if (selected.kind === 'candidate') {
        const candidate = selected.item;
        publishDetail.innerHTML =
          '<article class="detail-card">' +
            '<div class="detail-kicker">Publish Workbench</div>' +
            '<div class="detail-title">' + esc(candidate.draftTitle) + '</div>' +
            '<div class="meta">' + esc(candidate.draftType) + ' · 平台 ' + esc(candidate.platform) + '</div>' +
            '<div class="meta">当前还没有发布任务，这里可以直接补建。</div>' +
          '</article>' +
          '<article class="detail-card">' +
            '<div class="detail-actions">' +
              pill('待创建', 'warn') +
              pill('版本状态 ' + candidate.variantStatus, 'ok') +
            '</div>' +
          '</article>' +
          '<article class="detail-card">' +
            '<div class="detail-kicker">Quick Actions</div>' +
            '<div class="detail-actions">' +
              '<button class="primary" type="button" data-publish-action="create" data-channel-variant-id="' + esc(candidate.channelVariantId) + '" data-platform="' + esc(candidate.platform) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('publish:create', '创建发布任务') + '</button>' +
            '</div>' +
            '<div class="detail-note">这里会按当前平台版本创建一条 queued publish task，随后就能继续执行发布、取消或重试。</div>' +
          '</article>';
        return;
      }

      const task = selected.item;
      const canRun = task.status === 'queued';
      const canRetry = task.status === 'failed';
      const canCancel = task.status === 'queued';
      publishDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">Publish Workbench</div>' +
          '<div class="detail-title">' + esc(task.draftTitle || task.id) + '</div>' +
          '<div class="meta">' + esc(task.draftType) + ' · 平台 ' + esc(task.platform) + ' · 状态 ' + esc(task.status) + '</div>' +
          '<div class="meta">' + esc(task.remotePostId || '尚未生成远端发布 ID') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + task.status, task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') +
            pill('重试 ' + task.retryCount, task.retryCount ? 'warn' : 'ok') +
            (task.scheduledAt ? pill('已排期', 'ok') : pill('立即发布', 'warn')) +
          '</div>' +
          (task.errorMessage ? '<div class="meta">失败原因：' + esc(task.errorMessage) + '</div>' : '') +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">Quick Actions</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-publish-action="run" data-publish-task-id="' + esc(task.id) + '"' + (canRun && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:run', '执行发布') + '</button>' +
            '<button type="button" data-publish-action="retry" data-publish-task-id="' + esc(task.id) + '"' + (canRetry && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:retry', '重试发布') + '</button>' +
            '<button type="button" data-publish-action="cancel" data-publish-task-id="' + esc(task.id) + '"' + (canCancel && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:cancel', '取消发布') + '</button>' +
          '</div>' +
          '<div class="detail-note">run 会带唯一的 Idempotency-Key，retry 只对 failed 生效，cancel 只对 queued 生效。</div>' +
        '</article>';
    }

    function render(data) {
      latestVisualization = data;
      syncSelectedTopic(data);
      syncSelectedDraft(data);
      syncSelectedReview(data);
      syncSelectedPublish(data);
      renderStageNav(data);
      const overview = data.overview;
      const totals = data.totals;
      resultSummary.innerHTML = [
        '<strong>筛选结果</strong>',
        pill('来源 ' + data.sources.length, 'ok'),
        pill('选题 ' + data.topics.length, 'ok'),
        pill('草稿 ' + data.drafts.length, 'ok'),
        pill('审核 ' + totals.reviewsCount, 'ok'),
        pill('发布 ' + data.publishes.length, 'ok'),
        pill('指标 ' + totals.totalViews + ' views', 'warn')
      ].join('');

      $('metrics').innerHTML = [
        metric('原始采集', overview.rawItemsCount),
        metric('去重归一', totals.normalizedItemsCount),
        metric('候选选题', overview.topicsCount),
        metric('图文草稿', overview.draftsGenerated),
        metric('发布任务', totals.publishTasksCount),
        metric('总浏览', totals.totalViews)
      ].join('');

      const steps = [
        ['采集', overview.rawItemsCount, '社媒 + RSS'],
        ['归一', totals.normalizedItemsCount, '清洗、去重、摘要'],
        ['选题', overview.topicsCount, '3 摘要 + 1 深度'],
        ['审核', totals.reviewsCount, '人工通过后发布'],
        ['发布', overview.publishedToday, '小红书/抖音/TikTok/Facebook']
      ];
      const max = Math.max(1, ...steps.map((item) => item[1]));
      $('pipeline').innerHTML = steps.map(([name, value, note]) =>
        '<div class="step"><div class="label">' + esc(name) + '</div><strong>' + esc(value) + '</strong><div class="meta">' + esc(note) + '</div><div class="bar"><div class="fill" style="width:' + Math.round((value / max) * 100) + '%"></div></div></div>'
      ).join('');

      $('platforms').innerHTML = data.platformBreakdown.map((item) =>
        '<button class="platform" type="button" data-platform-card="' + esc(item.platform) + '" aria-label="筛选平台 ' + esc(item.platform) + '"><div class="platform-name"><span>' + esc(item.platform) + '</span>' + pill(item.published + '/' + item.publishTasks, item.failed ? 'hot' : 'ok') + '</div><div class="meta">浏览 ' + esc(item.views) + ' · 点赞 ' + esc(item.likes) + ' · 评论 ' + esc(item.comments) + '</div><div class="bar"><div class="fill" style="width:' + (item.publishTasks ? Math.round((item.published / item.publishTasks) * 100) : 0) + '%"></div></div></button>'
      ).join('');

      $('topics').innerHTML = renderRows(data.topics, (topic) =>
        '<button class="row interactive-row topic-row' + (topic.id === selectedTopicId ? ' active' : '') + '" type="button" data-topic-id="' + esc(topic.id) + '" aria-label="查看选题 ' + esc(topic.title) + '"><div><div class="title">' + esc(topic.title) + '</div><div class="meta">' + esc(topic.angle || '暂无角度') + ' · 热度 ' + esc(topic.score) + ' · 候选素材 ' + esc(topic.normalizedItemCount) + '</div></div>' + pill(topic.status, topic.status === 'selected' ? 'ok' : 'warn') + '</button>',
        '还没有选题数据。点击“运行 Demo”生成一组样例。'
      );
      renderTopicDetail(data);

      $('drafts').innerHTML = renderRows(data.drafts, (draft) =>
        '<button class="row interactive-row draft-row' + (draft.id === selectedDraftId ? ' active' : '') + '" type="button" data-draft-id="' + esc(draft.id) + '" aria-label="查看草稿 ' + esc(draft.title) + '"><div><div class="title">' + esc(draft.title) + '</div><div class="meta">' + esc(draft.draftType) + ' · 素材 ' + esc(draft.assetCount) + ' · 平台版本 ' + esc(draft.variantCount) + ' · 引用 ' + esc(draft.sourceRefCount) + '</div></div>' + pill(draft.reviewStatus || draft.status, draft.reviewStatus === 'approved' ? 'ok' : 'warn') + '</button>',
        '还没有图文草稿。'
      );
      renderDraftDetail(data);

      $('reviews').innerHTML = renderRows(data.reviews, (review) =>
        '<button class="row interactive-row review-row' + (review.id === selectedReviewId ? ' active' : '') + '" type="button" data-review-id="' + esc(review.id) + '" aria-label="查看审核任务 ' + esc(review.draftTitle) + '"><div><div class="title">' + esc(review.draftTitle) + '</div><div class="meta">' + esc(review.draftType) + ' · 平台 ' + esc(review.availablePlatforms.join(', ') || 'none') + '</div></div>' + pill(review.status, review.status === 'approved' ? 'ok' : review.status === 'rejected' ? 'hot' : 'warn') + '</button>',
        '还没有审核任务。'
      );
      renderReviewDetail(data);

      $('publishWorkbench').innerHTML = renderRows(listPublishEntries(data), (entry) => {
        if (entry.kind === 'candidate') {
          const candidate = entry.item;
          return '<button class="row interactive-row publish-row' + (entry.key === selectedPublishKey ? ' active' : '') + '" type="button" data-publish-key="' + esc(entry.key) + '" aria-label="查看待创建发布 ' + esc(candidate.draftTitle) + '"><div><div class="title">' + esc(candidate.draftTitle) + '</div><div class="meta">' + esc(candidate.draftType) + ' · ' + esc(candidate.platform) + ' · 还未建任务</div></div>' + pill('待创建', 'warn') + '</button>';
        }

        const task = entry.item;
        return '<button class="row interactive-row publish-row' + (entry.key === selectedPublishKey ? ' active' : '') + '" type="button" data-publish-key="' + esc(entry.key) + '" aria-label="查看发布任务 ' + esc(task.draftTitle || task.id) + '"><div><div class="title">' + esc(task.draftTitle || task.id) + '</div><div class="meta">' + esc(task.platform) + ' · ' + esc(task.remotePostId || '未产生远端 ID') + '</div></div>' + pill(task.status, task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') + '</button>';
      }, filterFields.publishStatus.value
        ? '当前发布状态筛选下没有发布任务。清空发布状态后，也会重新看到待创建候选。'
        : '还没有发布任务，也没有待创建候选。');
      renderPublishDetail(data);

      $('sources').innerHTML = renderRows(data.sources, (source) =>
        '<div class="row"><div><div class="title">' + esc(source.name) + '</div><div class="meta">' + esc(source.type) + ' · ' + esc(source.platform) + '</div></div>' + pill(source.status, source.status === 'active' ? 'ok' : '') + '</div>',
        '还没有信息源。'
      );

      $('publishes').innerHTML = renderRows(data.publishes.slice(0, 10), (task) =>
        '<button class="row interactive-row" type="button" data-publish-platform="' + esc(task.platform) + '" data-publish-status="' + esc(task.status) + '" aria-label="筛选发布 ' + esc(task.platform + ' ' + task.status) + '"><div><div class="title">' + esc(task.draftTitle || task.id) + '</div><div class="meta">' + esc(task.platform) + ' · ' + esc(task.remotePostId || '未产生远端 ID') + '</div></div>' + pill(task.status, task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') + '</button>',
        '还没有发布记录。'
      );
    }

    async function load() {
      setStatus('正在读取工作流数据...');
      const query = applyFilters(false);
      renderFilterSummary();
      const response = await fetch(apiRoot + '/dashboard/visualization' + (query ? '?' + query : ''));
      if (!response.ok) throw new Error(await describeError(response, '读取工作流数据失败'));
      render(await response.json());
      lastLoadedAt = new Date().toLocaleString();
      syncControlState();
    }

    async function runDemo() {
      setBusy('demo:run', '正在运行 Demo 工作流，页面会在完成后自动刷新。');
      try {
        const response = await fetch(apiRoot + '/demo/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resetStore: true })
        });
        if (!response.ok) throw new Error(await describeError(response, 'Demo 运行失败'));
        await load();
        showFeedback('ok', '操作完成', 'Demo 工作流已跑完，工作台数据已经刷新。');
      } finally {
        clearBusy();
      }
    }

    async function mutateTopic(topicId, action) {
      setBusy('topic:' + action, '正在更新选题状态...');
      try {
        const response = await fetch(apiRoot + '/topics/' + encodeURIComponent(topicId) + '/' + action, {
          method: 'POST'
        });
        if (!response.ok) throw new Error(await describeError(response, '选题操作失败'));
        selectedTopicId = topicId;
        await load();
        showFeedback('ok', '操作完成', action === 'select' ? '选题已设为 selected。' : '选题已设为 rejected。');
      } finally {
        clearBusy();
      }
    }

    function getRenderPreset(draft) {
      return draft.draftType === 'deep'
        ? { template: 'deep-dive-carousel', pageCount: 8, size: '1080x1440' }
        : { template: 'daily-summary-card', pageCount: 6, size: '1080x1440' };
    }

    async function mutateDraft(draftId, action) {
      setBusy('draft:' + action, '正在执行草稿操作...');
      const draft = latestVisualization ? latestVisualization.drafts.find((item) => item.id === draftId) : null;
      let response;

      try {
        if (action === 'render') {
          const preset = getRenderPreset(draft || { draftType: 'summary' });
          response = await fetch(apiRoot + '/drafts/' + encodeURIComponent(draftId) + '/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(preset)
          });
        } else if (action === 'submit-review') {
          response = await fetch(apiRoot + '/drafts/' + encodeURIComponent(draftId) + '/submit-review', {
            method: 'POST'
          });
        } else if (action === 'regenerate') {
          response = await fetch(apiRoot + '/drafts/' + encodeURIComponent(draftId) + '/regenerate', {
            method: 'POST'
          });
        } else {
          throw new Error('未知草稿操作');
        }

        if (!response.ok) throw new Error(await describeError(response, '草稿操作失败'));
        selectedDraftId = draftId;
        await load();
        const messages = {
          render: '草稿素材已重新渲染。',
          'submit-review': '草稿已提交审核。',
          regenerate: '草稿已触发重生成。'
        };
        showFeedback('ok', '操作完成', messages[action] || '草稿操作已完成。');
      } finally {
        clearBusy();
      }
    }

    async function mutateReview(reviewId, action) {
      setBusy('review:' + action, '正在执行审核操作...');
      const review = latestVisualization ? latestVisualization.reviews.find((item) => item.id === reviewId) : null;
      let response;

      try {
        if (action === 'approve') {
          response = await fetch(apiRoot + '/review-tasks/' + encodeURIComponent(reviewId) + '/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectedPlatforms: review ? review.availablePlatforms : []
            })
          });
        } else if (action === 'reject') {
          const comments = window.prompt('请输入驳回原因：', '需要补充说明后再提交');
          if (comments === null) {
            clearBusy();
            return;
          }
          response = await fetch(apiRoot + '/review-tasks/' + encodeURIComponent(reviewId) + '/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments })
          });
        } else if (action === 'request-regenerate') {
          const comments = window.prompt('请输入重生成要求：', '请补充更清晰的结构与论据');
          if (comments === null) {
            clearBusy();
            return;
          }
          response = await fetch(apiRoot + '/review-tasks/' + encodeURIComponent(reviewId) + '/request-regenerate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comments })
          });
        } else {
          throw new Error('未知审核操作');
        }

        if (!response.ok) throw new Error(await describeError(response, '审核操作失败'));
        selectedReviewId = reviewId;
        await load();
        const messages = {
          approve: '审核已通过。',
          reject: '审核已驳回。',
          'request-regenerate': '已要求重生成。'
        };
        showFeedback('ok', '操作完成', messages[action] || '审核操作已完成。');
      } finally {
        clearBusy();
      }
    }

    function buildIdempotencyKey(prefix, id) {
      return prefix + '-' + id + '-' + Date.now();
    }

    async function mutatePublish(action, payload) {
      setBusy('publish:' + action, '正在执行发布操作...');
      let response;

      try {
        if (action === 'create') {
          response = await fetch(apiRoot + '/publish-tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': buildIdempotencyKey('dashboard-create', payload.channelVariantId)
            },
            body: JSON.stringify({
              channelVariantId: payload.channelVariantId,
              platform: payload.platform
            })
          });
        } else if (action === 'run') {
          response = await fetch(apiRoot + '/publish-tasks/' + encodeURIComponent(payload.publishTaskId) + '/run', {
            method: 'POST',
            headers: {
              'Idempotency-Key': buildIdempotencyKey('dashboard-run', payload.publishTaskId)
            }
          });
        } else if (action === 'retry') {
          response = await fetch(apiRoot + '/publish-tasks/' + encodeURIComponent(payload.publishTaskId) + '/retry', {
            method: 'POST'
          });
        } else if (action === 'cancel') {
          response = await fetch(apiRoot + '/publish-tasks/' + encodeURIComponent(payload.publishTaskId) + '/cancel', {
            method: 'POST'
          });
        } else {
          throw new Error('未知发布操作');
        }

        if (!response.ok) throw new Error(await describeError(response, '发布操作失败'));
        const result = await response.json();
        selectedPublishKey = 'task:' + result.id;
        await load();
        const messages = {
          create: '发布任务已创建。',
          run: '发布任务已执行。',
          retry: '发布任务已重新排队。',
          cancel: '发布任务已取消。'
        };
        showFeedback('ok', '操作完成', messages[action] || '发布操作已完成。');
      } finally {
        clearBusy();
      }
    }

    $('applyFiltersBtn').addEventListener('click', () => {
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    stageNav.addEventListener('click', (event) => {
      const button = event.target.closest('[data-stage-key]');
      if (!button || isBusy) return;
      setActiveStage(button.getAttribute('data-stage-key') || 'overview', true);
    });
    $('resetFiltersBtn').addEventListener('click', () => {
      Object.values(filterFields).forEach((element) => {
        if (element) element.value = '';
      });
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('refreshBtn').addEventListener('click', () => {
      clearFeedback();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('demoBtn').addEventListener('click', () => runDemo().catch((error) => {
      showFeedback('error', '操作失败', error.message);
      setStatus(error.message);
      clearBusy();
    }));
    filterSummary.addEventListener('click', (event) => {
      const button = event.target.closest('[data-clear-filter]');
      if (!button) return;
      const key = button.getAttribute('data-clear-filter');
      const field = filterFields[key];
      if (!field) return;
      field.value = '';
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('platforms').addEventListener('click', (event) => {
      const button = event.target.closest('[data-platform-card]');
      if (!button) return;
      filterFields.platform.value = button.getAttribute('data-platform-card') || '';
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('drafts').addEventListener('click', (event) => {
      const button = event.target.closest('[data-draft-id]');
      if (!button) return;
      selectedDraftId = button.getAttribute('data-draft-id') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    $('reviews').addEventListener('click', (event) => {
      const button = event.target.closest('[data-review-id]');
      if (!button) return;
      selectedReviewId = button.getAttribute('data-review-id') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    $('publishWorkbench').addEventListener('click', (event) => {
      const button = event.target.closest('[data-publish-key]');
      if (!button) return;
      selectedPublishKey = button.getAttribute('data-publish-key') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    $('publishes').addEventListener('click', (event) => {
      const button = event.target.closest('[data-publish-status]');
      if (!button) return;
      filterFields.platform.value = button.getAttribute('data-publish-platform') || '';
      filterFields.publishStatus.value = button.getAttribute('data-publish-status') || '';
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('topics').addEventListener('click', (event) => {
      const button = event.target.closest('[data-topic-id]');
      if (!button) return;
      selectedTopicId = button.getAttribute('data-topic-id') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    topicDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-topic-action]');
      if (!button) return;
      const topicId = button.getAttribute('data-topic-id');
      const action = button.getAttribute('data-topic-action');
      if (!topicId || !action) return;
      mutateTopic(topicId, action).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    draftDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-draft-action]');
      if (!button) return;
      const draftId = button.getAttribute('data-draft-id');
      const action = button.getAttribute('data-draft-action');
      if (!draftId || !action) return;
      mutateDraft(draftId, action).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    reviewDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-review-action]');
      if (!button) return;
      const reviewId = button.getAttribute('data-review-id');
      const action = button.getAttribute('data-review-action');
      if (!reviewId || !action) return;
      mutateReview(reviewId, action).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    publishDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-publish-action]');
      if (!button) return;
      const action = button.getAttribute('data-publish-action');
      if (!action) return;
      if (action === 'create') {
        const channelVariantId = button.getAttribute('data-channel-variant-id');
        const platform = button.getAttribute('data-platform');
        if (!channelVariantId || !platform) return;
        mutatePublish(action, { channelVariantId, platform }).catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
        });
        return;
      }

      const publishTaskId = button.getAttribute('data-publish-task-id');
      if (!publishTaskId) return;
      mutatePublish(action, { publishTaskId }).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    syncFiltersFromLocation();
    syncStageFromLocation();
    renderFilterSummary();
    syncControlState();
    renderStagePanels();
    window.addEventListener('hashchange', () => {
      syncStageFromLocation();
      renderStagePanels();
      if (latestVisualization) {
        renderStageNav(latestVisualization);
      }
    });
    load().catch((error) => {
      showFeedback('error', '读取失败', error.message);
      setStatus(error.message);
    });
  </script>
</body>
</html>`;
}
