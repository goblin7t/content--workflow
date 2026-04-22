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
      padding: 14px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.42);
      border: 1px solid var(--line);
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

    @keyframes rise {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 980px) {
      .hero, .main, .split { grid-template-columns: 1fr; }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .pipeline, .platforms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .actions { justify-content: flex-start; }
    }

    @media (max-width: 560px) {
      .shell { width: min(100% - 20px, 1180px); padding-top: 22px; }
      .metrics, .pipeline, .platforms { grid-template-columns: 1fr; }
      .metric { min-height: 110px; }
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

    <section class="grid metrics" id="metrics"></section>

    <section class="grid main">
      <article class="card panel">
        <h2>业务管线</h2>
        <div class="pipeline" id="pipeline"></div>
      </article>

      <article class="card panel">
        <h2>发布渠道</h2>
        <div class="platforms" id="platforms"></div>
      </article>
    </section>

    <section class="split">
      <article class="card panel">
        <h2>今日选题</h2>
        <div class="list" id="topics"></div>
      </article>

      <article class="card panel">
        <h2>图文草稿</h2>
        <div class="list" id="drafts"></div>
      </article>
    </section>

    <section class="split">
      <article class="card panel">
        <h2>信息来源</h2>
        <div class="list" id="sources"></div>
      </article>

      <article class="card panel">
        <h2>最近发布</h2>
        <div class="list" id="publishes"></div>
      </article>
    </section>

    <p class="status" id="status">正在读取工作流数据...</p>
  </main>

  <script>
    const apiRoot = location.pathname.startsWith('/api/v1') ? '/api/v1' : '';
    const $ = (id) => document.getElementById(id);
    const status = $('status');

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

    function empty(text) {
      return '<div class="empty">' + esc(text) + '</div>';
    }

    function renderRows(items, formatter, emptyText) {
      return items.length ? items.map(formatter).join('') : empty(emptyText);
    }

    function render(data) {
      const overview = data.overview;
      const totals = data.totals;
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
        '<div class="platform"><div class="platform-name"><span>' + esc(item.platform) + '</span>' + pill(item.published + '/' + item.publishTasks, item.failed ? 'hot' : 'ok') + '</div><div class="meta">浏览 ' + esc(item.views) + ' · 点赞 ' + esc(item.likes) + ' · 评论 ' + esc(item.comments) + '</div><div class="bar"><div class="fill" style="width:' + (item.publishTasks ? Math.round((item.published / item.publishTasks) * 100) : 0) + '%"></div></div></div>'
      ).join('');

      $('topics').innerHTML = renderRows(data.topics, (topic) =>
        '<div class="row"><div><div class="title">' + esc(topic.title) + '</div><div class="meta">' + esc(topic.angle || '暂无角度') + ' · 热度 ' + esc(topic.score) + '</div></div>' + pill(topic.status, topic.status === 'selected' ? 'ok' : 'warn') + '</div>',
        '还没有选题数据。点击“运行 Demo”生成一组样例。'
      );

      $('drafts').innerHTML = renderRows(data.drafts, (draft) =>
        '<div class="row"><div><div class="title">' + esc(draft.title) + '</div><div class="meta">' + esc(draft.draftType) + ' · 素材 ' + esc(draft.assetCount) + ' · 平台版本 ' + esc(draft.variantCount) + ' · 引用 ' + esc(draft.sourceRefCount) + '</div></div>' + pill(draft.reviewStatus || draft.status, draft.reviewStatus === 'approved' ? 'ok' : 'warn') + '</div>',
        '还没有图文草稿。'
      );

      $('sources').innerHTML = renderRows(data.sources, (source) =>
        '<div class="row"><div><div class="title">' + esc(source.name) + '</div><div class="meta">' + esc(source.type) + ' · ' + esc(source.platform) + '</div></div>' + pill(source.status, source.status === 'active' ? 'ok' : '') + '</div>',
        '还没有信息源。'
      );

      $('publishes').innerHTML = renderRows(data.publishes.slice(0, 10), (task) =>
        '<div class="row"><div><div class="title">' + esc(task.draftTitle || task.id) + '</div><div class="meta">' + esc(task.platform) + ' · ' + esc(task.remotePostId || '未产生远端 ID') + '</div></div>' + pill(task.status, task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') + '</div>',
        '还没有发布记录。'
      );
    }

    async function load() {
      status.textContent = '正在读取工作流数据...';
      const response = await fetch(apiRoot + '/dashboard/visualization');
      if (!response.ok) throw new Error('读取失败：HTTP ' + response.status);
      render(await response.json());
      status.textContent = '已更新：' + new Date().toLocaleString();
    }

    async function runDemo() {
      status.textContent = '正在运行 Demo 工作流...';
      const response = await fetch(apiRoot + '/demo/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetStore: true })
      });
      if (!response.ok) throw new Error('Demo 运行失败：HTTP ' + response.status);
      await load();
    }

    $('refreshBtn').addEventListener('click', () => load().catch((error) => status.textContent = error.message));
    $('demoBtn').addEventListener('click', () => runDemo().catch((error) => status.textContent = error.message));
    load().catch((error) => status.textContent = error.message);
  </script>
</body>
</html>`;
}
