export function renderDashboardPage(): string {
  return String.raw`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>内容工作流</title>
  <style>
    :root {
      --ink: #0d4950;
      --muted: #6a888d;
      --paper: #f5fffe;
      --card: rgba(255, 255, 255, 0.92);
      --line: rgba(13, 73, 80, 0.1);
      --mint: #81d8d0;
      --clay: #2ab7c0;
      --gold: #d9f8f4;
      --sky: #6dd8e1;
      --shadow: 0 24px 64px rgba(20, 86, 92, 0.12);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--ink);
      font-family: "Avenir Next", "Trebuchet MS", Verdana, sans-serif;
      background:
        radial-gradient(circle at 10% 10%, rgba(129, 216, 208, 0.34), transparent 30rem),
        radial-gradient(circle at 84% 4%, rgba(109, 216, 225, 0.18), transparent 24rem),
        linear-gradient(135deg, #fbffff 0%, #f0fcfb 48%, #f8fffe 100%);
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
    .field select,
    .field textarea {
      width: 100%;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 12px 14px;
      color: var(--ink);
      background: rgba(255, 255, 255, 0.6);
      font: inherit;
    }

    .field textarea {
      min-height: 132px;
      resize: vertical;
      line-height: 1.5;
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
      border-color: rgba(129, 216, 208, 0.34);
      background: rgba(129, 216, 208, 0.15);
    }

    .feedback.error {
      border-color: rgba(42, 183, 192, 0.28);
      background: rgba(42, 183, 192, 0.1);
    }

    .feedback.busy {
      border-color: rgba(109, 216, 225, 0.28);
      background: rgba(109, 216, 225, 0.12);
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
      color: #f8fffe;
      background: linear-gradient(135deg, #0d4950, #2ab7c0);
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
      overflow: visible;
      border: 1px solid var(--line);
      border-radius: 28px;
      background: var(--card);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
      animation: rise 560ms ease-out both;
    }

    .metric {
      position: relative;
      overflow: hidden;
      border-radius: inherit;
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
      background: rgba(129, 216, 208, 0.24);
    }

    .metric:nth-child(2)::after { background: rgba(217, 248, 244, 0.42); }
    .metric:nth-child(3)::after { background: rgba(42, 183, 192, 0.18); }
    .metric:nth-child(4)::after { background: rgba(109, 216, 225, 0.18); }

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
      grid-template-columns: 1fr;
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

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;
    }

    .panel-header h2 {
      margin: 0;
    }

    .panel-tools {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .panel-tools select {
      min-width: 148px;
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 10px 14px;
      color: var(--ink);
      background: rgba(255, 255, 255, 0.72);
      font: inherit;
    }

    .inline-summary {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
      margin: 0 0 16px;
    }

    .keyword-chip {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.72);
      color: var(--ink);
      font: inherit;
      cursor: pointer;
    }

    .keyword-chip.active {
      color: #f8fffe;
      background: linear-gradient(135deg, #0d4950, #2ab7c0);
    }

    .candidate-list {
      display: grid;
      gap: 10px;
    }

    .candidate-card {
      padding: 12px 14px;
      border-radius: 16px;
      border: 1px solid rgba(13, 73, 80, 0.08);
      background: rgba(255, 255, 255, 0.62);
      display: grid;
      gap: 6px;
      text-align: left;
    }

    .candidate-card.active {
      border-color: rgba(13, 73, 80, 0.22);
      box-shadow: 0 12px 24px rgba(20, 86, 92, 0.08);
      background: rgba(255, 255, 255, 0.82);
    }

    .candidate-card.primary {
      border-color: rgba(42, 183, 192, 0.28);
      background: linear-gradient(180deg, rgba(240, 253, 251, 0.96), rgba(255, 255, 255, 0.82));
    }

    .candidate-card.primary .title {
      color: #0d4950;
    }

    .candidate-fulltext {
      margin-top: 10px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(13, 73, 80, 0.08);
      white-space: pre-wrap;
      line-height: 1.65;
      color: rgba(13, 73, 80, 0.88);
    }

    .pipeline {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }

    .step {
      min-height: 128px;
      border: 1px dashed rgba(15, 78, 85, 0.16);
      border-radius: 22px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.46);
    }

    .step strong {
      display: block;
      margin: 10px 0 6px;
      font-size: 22px;
    }

    .bar {
      height: 10px;
      border-radius: 999px;
      background: rgba(15, 78, 85, 0.08);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      width: 0;
      border-radius: inherit;
      background: linear-gradient(90deg, var(--mint), var(--sky), var(--clay));
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
      background: rgba(255, 255, 255, 0.6);
      border: 1px solid var(--line);
    }

    .platform:hover,
    .platform:focus-visible,
    .interactive-row:hover,
    .interactive-row:focus-visible {
      outline: none;
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(20, 86, 92, 0.12);
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
      background: rgba(129, 216, 208, 0.1);
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
      background: rgba(15, 78, 85, 0.08);
      color: var(--ink);
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .pill.ok { background: rgba(129, 216, 208, 0.28); }
    .pill.warn { background: rgba(217, 248, 244, 0.78); }
    .pill.hot { background: rgba(109, 216, 225, 0.2); }

    .empty, .status {
      color: var(--muted);
      padding: 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.62);
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
      background: rgba(255, 255, 255, 0.62);
    }

    .stage-nav-btn.active {
      border-color: rgba(13, 73, 80, 0.22);
      background: linear-gradient(135deg, rgba(13, 73, 80, 0.95), rgba(42, 183, 192, 0.82));
      color: #f7fffe;
      box-shadow: 0 18px 34px rgba(20, 86, 92, 0.2);
    }

    .stage-nav-btn.active .meta {
      color: rgba(247, 255, 254, 0.74);
    }

    .stage-count {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 900;
      background: rgba(15, 78, 85, 0.08);
      color: inherit;
      white-space: nowrap;
    }

    .stage-nav-btn.active .stage-count {
      background: rgba(247, 255, 254, 0.18);
    }

    .stage-hint {
      position: relative;
      overflow: visible;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.62);
      border: 1px dashed rgba(15, 78, 85, 0.14);
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

    .workbench.review-workbench {
      grid-template-columns: 1fr;
    }

    .review-stage-bar {
      display: grid;
      gap: 10px;
      margin-bottom: 16px;
    }

    .review-stage-label {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .review-strip {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .review-strip .review-row {
      min-width: 280px;
      margin: 0;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.58);
    }

    .review-strip .row {
      border-top: 0;
    }

    .topic-row.active {
      background: rgba(129, 216, 208, 0.18);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .draft-row.active {
      background: rgba(217, 248, 244, 0.42);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .review-row.active {
      background: rgba(109, 216, 225, 0.16);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .publish-row.active {
      background: rgba(42, 183, 192, 0.14);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .job-row.active {
      background: rgba(13, 73, 80, 0.12);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .source-row.active {
      background: rgba(129, 216, 208, 0.14);
      box-shadow: 0 14px 28px rgba(26, 72, 78, 0.12);
    }

    .detail-stack {
      display: grid;
      gap: 12px;
    }

    .detail-card {
      position: relative;
      overflow: visible;
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

    .detail-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .mini-stat {
      padding: 12px 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.56);
      border: 1px solid rgba(15, 78, 85, 0.08);
    }

    .mini-stat strong {
      display: block;
      margin-top: 4px;
      font-size: 14px;
      line-height: 1.35;
    }

    .editor-switch {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .editor-switch button.active {
      color: #f8fffe;
      background: linear-gradient(135deg, #0d4950, #2ab7c0);
    }

    .editor-form {
      display: grid;
      gap: 12px;
    }

    .editor-form.compact {
      gap: 10px;
    }

    .editor-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .variant-editor-list {
      display: grid;
      gap: 12px;
    }

    .variant-editor-card {
      padding: 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.56);
      border: 1px solid rgba(15, 78, 85, 0.08);
      display: grid;
      gap: 10px;
    }

    .variant-editor-card.active {
      border-color: rgba(13, 73, 80, 0.2);
      box-shadow: 0 14px 28px rgba(20, 86, 92, 0.08);
      background: rgba(255, 255, 255, 0.72);
    }

    .variant-editor-card.just-saved {
      outline: 2px solid rgba(42, 183, 192, 0.22);
      outline-offset: 2px;
    }

    .variant-editor-summary {
      display: grid;
      gap: 8px;
    }

    .preview-shell {
      display: grid;
      gap: 10px;
      padding: 14px;
      border-radius: 18px;
      background: linear-gradient(180deg, rgba(248, 255, 254, 0.96), rgba(235, 250, 248, 0.82));
      border: 1px solid rgba(15, 78, 85, 0.08);
    }

    .preview-shell[data-platform="xiaohongshu"] {
      background: linear-gradient(180deg, rgba(255, 252, 252, 0.98), rgba(255, 244, 246, 0.9));
      border-color: rgba(210, 78, 110, 0.12);
    }

    .preview-shell[data-platform="douyin"] {
      background: linear-gradient(180deg, rgba(248, 255, 255, 0.98), rgba(235, 248, 255, 0.9));
      border-color: rgba(59, 155, 196, 0.14);
    }

    .preview-shell[data-platform="tiktok"] {
      background: linear-gradient(180deg, rgba(247, 255, 254, 0.98), rgba(230, 248, 246, 0.9));
      border-color: rgba(42, 183, 192, 0.14);
    }

    .preview-shell[data-platform="facebook"] {
      background: linear-gradient(180deg, rgba(248, 252, 255, 0.98), rgba(236, 245, 255, 0.9));
      border-color: rgba(73, 120, 221, 0.14);
    }

    .preview-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .preview-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .preview-avatar {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 900;
      color: #f8fffe;
      background: linear-gradient(135deg, #0d4950, #2ab7c0);
      flex: 0 0 auto;
    }

    .preview-shell[data-platform="xiaohongshu"] .preview-avatar {
      background: linear-gradient(135deg, #d24e6e, #f38ea0);
    }

    .preview-shell[data-platform="facebook"] .preview-avatar {
      background: linear-gradient(135deg, #4978dd, #6ea2ff);
    }

    .preview-meta {
      min-width: 0;
    }

    .preview-name {
      font-size: 13px;
      font-weight: 900;
      line-height: 1.2;
    }

    .preview-sub {
      color: var(--muted);
      font-size: 12px;
      margin-top: 2px;
    }

    .preview-title {
      font-size: 16px;
      font-weight: 900;
      line-height: 1.35;
      letter-spacing: -0.02em;
    }

    .preview-body {
      font-size: 13px;
      line-height: 1.65;
      color: rgba(13, 73, 80, 0.88);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .preview-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .preview-tag {
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 800;
      background: rgba(15, 78, 85, 0.08);
      color: var(--ink);
    }

    .preview-shell[data-platform="xiaohongshu"] .preview-tag {
      background: rgba(210, 78, 110, 0.12);
      color: #b63f5e;
    }

    .preview-shell[data-platform="facebook"] .preview-tag {
      background: rgba(73, 120, 221, 0.12);
      color: #3b61b7;
    }

    .preview-footer {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      color: var(--muted);
      font-size: 12px;
      border-top: 1px dashed rgba(15, 78, 85, 0.12);
      padding-top: 10px;
    }

    .config-preview {
      margin: 0;
      padding: 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.56);
      border: 1px solid rgba(15, 78, 85, 0.08);
      color: var(--ink);
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-x: auto;
    }

    .hint-corner {
      position: absolute;
      top: 14px;
      right: 14px;
      display: block;
      z-index: 30;
    }

    .hint-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 999px;
      border: 1px solid rgba(42, 183, 192, 0.18);
      background: rgba(255, 255, 255, 0.84);
      color: rgba(13, 73, 80, 0.72);
      font-size: 13px;
      font-weight: 800;
      line-height: 1;
      cursor: help;
      box-shadow: 0 6px 18px rgba(20, 86, 92, 0.06);
      backdrop-filter: blur(10px);
      transition: border-color 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 140ms ease;
    }

    .hint-trigger:hover,
    .hint-trigger:focus-visible,
    .hint-trigger[data-open="true"] {
      color: var(--ink);
      border-color: rgba(42, 183, 192, 0.28);
      box-shadow: 0 10px 22px rgba(20, 86, 92, 0.1);
      transform: translateY(-1px);
    }

    .floating-hint {
      position: fixed;
      left: 0;
      top: 0;
      width: min(320px, calc(100vw - 32px));
      padding: 12px 14px;
      border-radius: 18px;
      border: 1px solid rgba(42, 183, 192, 0.14);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 255, 253, 0.96));
      color: var(--ink);
      font-size: 12px;
      line-height: 1.6;
      box-shadow: 0 18px 38px rgba(20, 86, 92, 0.1);
      backdrop-filter: blur(14px);
      opacity: 0;
      pointer-events: none;
      transform: translateY(-6px) scale(0.98);
      transition: opacity 160ms ease, transform 160ms ease;
      z-index: 200;
      text-align: left;
    }

    .floating-hint::before {
      content: "";
      position: absolute;
      width: 14px;
      height: 14px;
      background: rgba(252, 255, 255, 0.98);
      transform: rotate(45deg);
      border-top: 1px solid rgba(42, 183, 192, 0.14);
      border-left: 1px solid rgba(42, 183, 192, 0.14);
    }

    .floating-hint[data-side="bottom"]::before {
      right: 14px;
      top: -7px;
      width: 14px;
      height: 14px;
    }

    .floating-hint[data-side="top"]::before {
      right: 14px;
      bottom: -7px;
      border-top: none;
      border-left: none;
      border-right: 1px solid rgba(42, 183, 192, 0.14);
      border-bottom: 1px solid rgba(42, 183, 192, 0.14);
    }

    .floating-hint.visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .command-hero {
      display: grid;
      gap: 14px;
    }

    .command-summary {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .command-grid {
      display: grid;
      gap: 12px;
    }

    .command-row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .command-row.single {
      grid-template-columns: 1fr;
    }

    .command-button {
      width: 100%;
      border-radius: 18px;
      padding: 14px 16px;
      text-align: left;
      display: grid;
      gap: 4px;
      background: rgba(255, 255, 255, 0.7);
    }

    .command-button strong {
      font-size: 14px;
      line-height: 1.2;
    }

    .command-button span {
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
      font-weight: 600;
    }

    .command-button.primary {
      background: linear-gradient(135deg, #0d4950, #2ab7c0);
    }

    .command-button.primary span {
      color: rgba(248, 255, 254, 0.78);
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
      .editor-grid, .detail-meta-grid { grid-template-columns: 1fr; }
      .actions { justify-content: flex-start; }
      .command-row { grid-template-columns: 1fr; }
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
      .panel-header {
        align-items: stretch;
        flex-direction: column;
      }
      .metric { min-height: 110px; }
      .stage-nav { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <div class="eyebrow">Content Workflow</div>
        <h1>内容工作流<br />管理面板</h1>
        <p class="subtitle">查看采集、选题、草稿、审核、发布和指标，直接处理日常操作。</p>
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
          <option value="rss">RSS</option>
          <option value="xiaohongshu">小红书</option>
          <option value="douyin">抖音</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
        </select>
      </div>
      <div class="field">
        <label for="draftStatusFilter">草稿状态</label>
        <select id="draftStatusFilter">
          <option value="">全部草稿</option>
          <option value="draft">草稿中</option>
          <option value="rendered">已渲染</option>
          <option value="in_review">审核中</option>
          <option value="approved">已通过</option>
          <option value="rejected">已驳回</option>
          <option value="scheduled">已排期</option>
          <option value="published">已发布</option>
          <option value="failed">失败</option>
        </select>
      </div>
      <div class="field">
        <label for="publishStatusFilter">发布状态</label>
        <select id="publishStatusFilter">
          <option value="">全部发布任务</option>
          <option value="queued">待执行</option>
          <option value="running">执行中</option>
          <option value="published">已发布</option>
          <option value="failed">失败</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>
      <div class="field">
        <label for="sourceStatusFilter">来源状态</label>
        <select id="sourceStatusFilter">
          <option value="">全部来源</option>
          <option value="active">启用中</option>
          <option value="disabled">已停用</option>
        </select>
      </div>
      <div class="field">
        <label for="topicStatusFilter">选题状态</label>
        <select id="topicStatusFilter">
          <option value="">全部选题</option>
          <option value="candidate">候选中</option>
          <option value="selected">已选中</option>
          <option value="rejected">已拒绝</option>
          <option value="archived">已归档</option>
        </select>
      </div>
      <div class="field">
        <label for="reviewStatusFilter">审核状态</label>
        <select id="reviewStatusFilter">
          <option value="">全部审核任务</option>
          <option value="pending">待审核</option>
          <option value="approved">已通过</option>
          <option value="rejected">已驳回</option>
          <option value="regenerate_requested">要求重生成</option>
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
          <strong>流程控制</strong>
          <span>左侧切换阶段，右侧专注当前内容。</span>
        </div>
        <div class="stage-nav" id="stageNav"></div>
        <div class="stage-hint" id="stageHint"></div>
      </aside>

      <div class="stage-content">
        <section class="grid main stage-panel" data-stage-panel="overview">
          <article class="card panel">
            <h2>总览</h2>
            <div class="detail-stack" id="overviewDetail"></div>
          </article>

          <article class="card panel">
            <h2>发布渠道</h2>
            <div class="platforms" id="platforms"></div>
          </article>

          <article class="card panel">
            <h2>业务管线</h2>
            <div class="pipeline" id="pipeline"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="topics">
          <article class="card panel">
            <div class="panel-header">
              <h2>选题</h2>
              <div class="panel-tools">
                <select id="topicSort" aria-label="选题排序">
                  <option value="recommended">按推荐</option>
                  <option value="newest">按最新</option>
                  <option value="score">按热度</option>
                  <option value="sources">按来源数</option>
                </select>
              </div>
            </div>
            <div class="inline-summary" id="topicKeywordSummary"></div>
            <div class="list" id="topics"></div>
          </article>

          <article class="card panel">
            <h2>内容</h2>
            <div class="detail-stack" id="topicDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="drafts">
          <article class="card panel">
            <h2>草稿</h2>
            <div class="list" id="drafts"></div>
          </article>

          <article class="card panel">
            <h2>内容</h2>
            <div class="detail-stack" id="draftDetail"></div>
          </article>
        </section>

        <section class="workbench review-workbench stage-panel" data-stage-panel="reviews">
          <article class="card panel">
            <h2>审核</h2>
            <div class="review-stage-bar">
              <div class="review-stage-label">切换</div>
              <div class="review-strip" id="reviews"></div>
            </div>
            <div class="detail-stack" id="reviewDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="publish">
          <article class="card panel">
            <h2>发布</h2>
            <div class="list" id="publishWorkbench"></div>
          </article>

          <article class="card panel">
            <h2>内容</h2>
            <div class="detail-stack" id="publishDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="jobs">
          <article class="card panel">
            <div class="panel-header">
              <h2>任务</h2>
              <div class="panel-tools">
                <select id="jobStatusStageFilter" aria-label="筛选任务状态">
                  <option value="">全部任务</option>
                  <option value="queued">已入队</option>
                  <option value="running">执行中</option>
                  <option value="succeeded">已完成</option>
                  <option value="failed">失败</option>
                  <option value="cancelled">已取消</option>
                </select>
              </div>
            </div>
            <div class="list" id="jobs"></div>
          </article>

          <article class="card panel">
            <h2>内容</h2>
            <div class="detail-stack" id="jobDetail"></div>
          </article>
        </section>

        <section class="workbench stage-panel" data-stage-panel="sources">
          <article class="card panel">
            <div class="panel-header">
              <h2>来源</h2>
              <button class="primary" id="createSourceBtn" type="button">新建来源</button>
            </div>
            <div class="list" id="sources"></div>
          </article>

          <article class="card panel">
            <h2>内容</h2>
            <div class="detail-stack" id="sourceDetail"></div>
            <div class="list" id="publishes"></div>
          </article>
        </section>
      </div>
    </section>

    <div class="floating-hint" id="floatingHint" aria-hidden="true"></div>
    <p class="status" id="status">正在读取工作流数据...</p>
  </main>

  <script>
    const apiRoot = location.pathname.startsWith('/api/v1') ? '/api/v1' : '';
    const $ = (id) => document.getElementById(id);
    const status = $('status');
    const filterSummary = $('filterSummary');
    const resultSummary = $('resultSummary');
    const feedback = $('feedback');
    const floatingHint = $('floatingHint');
    const stageNav = $('stageNav');
    const stageHint = $('stageHint');
    const overviewDetail = $('overviewDetail');
    const topicDetail = $('topicDetail');
    const draftDetail = $('draftDetail');
    const reviewDetail = $('reviewDetail');
    const publishDetail = $('publishDetail');
    const jobDetail = $('jobDetail');
    const sourceDetail = $('sourceDetail');
    const jobStatusStageFilter = $('jobStatusStageFilter');
    const topicSort = $('topicSort');
    const topicKeywordSummary = $('topicKeywordSummary');
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
    let selectedTopicCandidateId = '';
    let expandedTopicCandidateId = '';
    let selectedDraftId = '';
    let selectedReviewId = '';
    let selectedReviewVariantId = '';
    let recentlySavedReviewVariantId = '';
    let selectedPublishKey = '';
    let selectedJobId = '';
    let selectedSourceId = '';
    let selectedJobStatus = '';
    let selectedTopicSort = 'recommended';
    let selectedTopicKeyword = '';
    let sourceEditorMode = 'edit';
    let activeStage = 'overview';
    let isBusy = false;
    let busyActionKey = '';
    let lastLoadedAt = '';
    let activeHintTrigger = null;
    let jobAutoRefreshTimer = null;
    const stageConfig = [
      { key: 'overview', label: '总览', note: '先看整体状态。' },
      { key: 'topics', label: '选题', note: '决定今天做什么。' },
      { key: 'drafts', label: '草稿', note: '处理草稿、素材和提审。' },
      { key: 'reviews', label: '审核', note: '审核并修改发布内容。' },
      { key: 'publish', label: '发布', note: '创建和执行发布。' },
      { key: 'jobs', label: '任务', note: '查看后台任务。' },
      { key: 'sources', label: '来源', note: '管理来源。' }
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

    function optionLabel(element) {
      if (!element) return '';
      const option = element.selectedOptions && element.selectedOptions[0];
      return option ? option.textContent.trim() : (element.value || '').trim();
    }

    function platformLabel(value) {
      const labels = {
        rss: 'RSS',
        xiaohongshu: '小红书',
        douyin: '抖音',
        tiktok: 'TikTok',
        facebook: 'Facebook'
      };
      return labels[value] || value || '未知平台';
    }

    function sourceTypeLabel(value) {
      const labels = {
        rss: 'RSS',
        social_api: '社媒接口',
        manual: '手动录入'
      };
      return labels[value] || value || '未知来源类型';
    }

    function topicStatusLabel(value) {
      const labels = {
        candidate: '候选中',
        selected: '已选中',
        rejected: '已拒绝',
        archived: '已归档'
      };
      return labels[value] || value || '未知状态';
    }

    function draftTypeLabel(value) {
      const labels = {
        summary: '摘要稿',
        deep: '深度稿'
      };
      return labels[value] || value || '未知草稿类型';
    }

    function draftStatusLabel(value) {
      const labels = {
        draft: '草稿中',
        rendered: '已渲染',
        in_review: '审核中',
        approved: '已通过',
        rejected: '已驳回',
        scheduled: '已排期',
        published: '已发布',
        failed: '失败'
      };
      return labels[value] || value || '未知状态';
    }

    function reviewStatusLabel(value) {
      const labels = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已驳回',
        regenerate_requested: '要求重生成'
      };
      return labels[value] || value || '未知状态';
    }

    function publishStatusLabel(value) {
      const labels = {
        queued: '待执行',
        running: '执行中',
        published: '已发布',
        failed: '失败',
        cancelled: '已取消'
      };
      return labels[value] || value || '未知状态';
    }

    function jobStatusLabel(value) {
      const labels = {
        queued: '已入队',
        running: '执行中',
        succeeded: '已完成',
        failed: '失败',
        cancelled: '已取消'
      };
      return labels[value] || value || '未知状态';
    }

    function jobTypeLabel(value) {
      const labels = {
        'ingestion.run_all_sources': '全量采集',
        'metrics.sync_all': '同步指标',
      };
      return labels[value] || value || '未知任务';
    }

    function sourceStatusLabel(value) {
      const labels = {
        active: '启用中',
        disabled: '已停用'
      };
      return labels[value] || value || '未知状态';
    }

    function sourceTypeOptions(selected) {
      return [
        ['rss', 'RSS'],
        ['social_api', '社媒接口'],
        ['manual', '人工录入']
      ].map(([value, label]) =>
        '<option value="' + esc(value) + '"' + (selected === value ? ' selected' : '') + '>' + esc(label) + '</option>'
      ).join('');
    }

    function sourceStatusOptions(selected) {
      return [
        ['active', '启用中'],
        ['disabled', '已停用']
      ].map(([value, label]) =>
        '<option value="' + esc(value) + '"' + (selected === value ? ' selected' : '') + '>' + esc(label) + '</option>'
      ).join('');
    }

    function platformOptions(selected) {
      return [
        ['xiaohongshu', '小红书'],
        ['douyin', '抖音'],
        ['tiktok', 'TikTok'],
        ['facebook', 'Facebook']
      ].map(([value, label]) =>
        '<option value="' + esc(value) + '"' + (selected === value ? ' selected' : '') + '>' + esc(label) + '</option>'
      ).join('');
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

    function hintMarker(text, label = '查看说明') {
      return '<span class="hint-corner">' +
        '<span class="hint-trigger" tabindex="0" role="button" aria-label="' + esc(label) + '" data-hint-text="' + esc(text) + '">?</span>' +
      '</span>';
    }

    function positionHint(trigger) {
      if (!trigger) return;
      const margin = 16;
      const gap = 12;
      const rect = trigger.getBoundingClientRect();
      const width = floatingHint.offsetWidth || 300;
      const height = floatingHint.offsetHeight || 80;
      const left = Math.min(window.innerWidth - width - margin, Math.max(margin, rect.right - width));
      let top = rect.bottom + gap;
      let side = 'bottom';

      if (top + height > window.innerHeight - margin) {
        top = rect.top - height - gap;
        side = 'top';
      }

      top = Math.max(margin, Math.min(window.innerHeight - height - margin, top));
      floatingHint.dataset.side = side;
      floatingHint.style.left = left + 'px';
      floatingHint.style.top = top + 'px';
    }

    function hideHint() {
      if (activeHintTrigger) {
        activeHintTrigger.removeAttribute('data-open');
      }
      activeHintTrigger = null;
      floatingHint.classList.remove('visible');
      floatingHint.setAttribute('aria-hidden', 'true');
    }

    function showHint(trigger) {
      const text = trigger && trigger.getAttribute('data-hint-text');
      if (!text) return;

      if (activeHintTrigger && activeHintTrigger !== trigger) {
        activeHintTrigger.removeAttribute('data-open');
      }

      activeHintTrigger = trigger;
      activeHintTrigger.setAttribute('data-open', 'true');
      floatingHint.textContent = text;
      floatingHint.setAttribute('aria-hidden', 'false');
      floatingHint.classList.add('visible');
      positionHint(trigger);
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
      if (jobStatusStageFilter) {
        jobStatusStageFilter.disabled = isBusy;
      }
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
        jobs: data.jobs.length,
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
      stageHint.innerHTML = '<strong>当前</strong> ' + esc(current.label) + hintMarker(current.note);
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
          return value ? filterChip(key, labels[key], optionLabel(element)) : '';
        })
        .filter(Boolean);

      filterSummary.innerHTML = active.length
        ? '<strong>当前筛选</strong>' + active.join('')
        : '<strong>当前筛选</strong>' + pill('未应用筛选', 'ok');
    }

    function syncSelectedTopic(data) {
      const sortedTopics = getSortedTopics(data);
      const stillExists = sortedTopics.some((topic) => topic.id === selectedTopicId);
      if (!stillExists) {
        selectedTopicId = sortedTopics[0] ? sortedTopics[0].id : '';
      }
    }

    function getSelectedTopic(data) {
      return data.topics.find((topic) => topic.id === selectedTopicId) || null;
    }

    function syncSelectedTopicCandidate(data) {
      const topic = getSelectedTopic(data);
      const candidates = topic?.candidateItems || [];
      const stillExists = candidates.some((item) => item.id === selectedTopicCandidateId);
      if (!stillExists) {
        selectedTopicCandidateId = candidates[0] ? candidates[0].id : '';
      }
      const expandedStillExists = candidates.some((item) => item.id === expandedTopicCandidateId);
      if (!expandedStillExists) {
        expandedTopicCandidateId = '';
      }
    }

    function getSelectedTopicCandidate(data) {
      const topic = getSelectedTopic(data);
      return topic?.candidateItems.find((item) => item.id === selectedTopicCandidateId) || null;
    }

    function getSortedTopics(data) {
      const topics = getFilteredTopics(data);
      switch (selectedTopicSort) {
        case 'newest':
          return topics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.score - a.score);
        case 'score':
          return topics.sort((a, b) => b.score - a.score || b.sourceCount - a.sourceCount || b.normalizedItemCount - a.normalizedItemCount);
        case 'sources':
          return topics.sort((a, b) => b.sourceCount - a.sourceCount || b.score - a.score || b.normalizedItemCount - a.normalizedItemCount);
        case 'recommended':
        default:
          return topics.sort((a, b) =>
            recommendationRank(b.recommendation) - recommendationRank(a.recommendation) ||
            b.score - a.score ||
            b.sourceCount - a.sourceCount ||
            b.normalizedItemCount - a.normalizedItemCount
          );
      }
    }

    function getFilteredTopics(data) {
      const keyword = normalizeTopicKeyword(selectedTopicKeyword);
      if (!keyword) {
        return [...data.topics];
      }

      return data.topics.filter((topic) =>
        Array.isArray(topic.hotKeywords) &&
        topic.hotKeywords.some((item) => normalizeTopicKeyword(item) === keyword),
      );
    }

    function normalizeTopicKeyword(value) {
      return String(value || '').trim().toLowerCase();
    }

    function recommendationRank(value) {
      const ranks = {
        '热度高，建议优先看': 4,
        '跨平台都有动静，值得跟进': 3,
        '来源较多，信息更完整': 2,
        '素材集中，适合快速出稿': 1,
        '信息明确，可以继续判断': 0
      };
      return ranks[value] ?? 0;
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

    function syncSelectedReviewVariant(data) {
      const review = getSelectedReview(data);
      const variants = review ? review.variants : [];
      const stillExists = variants.some((variant) => variant.id === selectedReviewVariantId);
      if (!stillExists) {
        const preferredPlatform = filterFields.platform && filterFields.platform.value
          ? filterFields.platform.value
          : '';
        const preferred = preferredPlatform
          ? variants.find((variant) => variant.platform === preferredPlatform)
          : null;
        selectedReviewVariantId = preferred
          ? preferred.id
          : (variants[0] ? variants[0].id : '');
      }
      if (recentlySavedReviewVariantId && !variants.some((variant) => variant.id === recentlySavedReviewVariantId)) {
        recentlySavedReviewVariantId = '';
      }
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

    function listVisibleJobs(data) {
      return selectedJobStatus
        ? data.jobs.filter((job) => job.status === selectedJobStatus)
        : data.jobs;
    }

    function syncSelectedJob(data) {
      const visibleJobs = listVisibleJobs(data);
      const stillExists = visibleJobs.some((job) => job.id === selectedJobId);
      if (!stillExists) {
        selectedJobId = visibleJobs[0] ? visibleJobs[0].id : '';
      }
    }

    function getSelectedJob(data) {
      return listVisibleJobs(data).find((job) => job.id === selectedJobId) || null;
    }

    function clearJobAutoRefresh() {
      if (jobAutoRefreshTimer) {
        clearTimeout(jobAutoRefreshTimer);
        jobAutoRefreshTimer = null;
      }
    }

    function shouldAutoRefreshJobs(data) {
      return activeStage === 'jobs' && data.jobs.some((job) => job.status === 'queued' || job.status === 'running');
    }

    function syncSelectedSource(data) {
      const stillExists = data.sources.some((source) => source.id === selectedSourceId);
      if (!stillExists) {
        selectedSourceId = data.sources[0] ? data.sources[0].id : '';
      }
    }

    function getSelectedSource(data) {
      return data.sources.find((source) => source.id === selectedSourceId) || null;
    }

    function prettyJson(value) {
      try {
        return JSON.stringify(value ?? {}, null, 2);
      } catch (error) {
        return '{}';
      }
    }

    function defaultSourceConfig() {
      return {
        endpoint: '',
        notes: '',
      };
    }

    function hashtagsText(value) {
      return Array.isArray(value) ? value.join(', ') : '';
    }

    function readReviewVariantForm(form) {
      const formData = new FormData(form);
      return {
        title: String(formData.get('title') || '').trim(),
        caption: String(formData.get('caption') || '').trim(),
        hashtags: String(formData.get('hashtags') || '')
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      };
    }

    function previewAudienceLabel(platform) {
      const labels = {
        xiaohongshu: '图文种草视角',
        douyin: '短视频挂钩视角',
        tiktok: 'Global short-form angle',
        facebook: '社区分享视角',
      };
      return labels[platform] || '平台内容视角';
    }

    function renderVariantPreviewFromValues(platform, title, caption, hashtags) {
      const safeTitle = title || '这里显示标题';
      const safeCaption = caption || '这里显示正文预览';
      const safeHashtags = Array.isArray(hashtags) && hashtags.length ? hashtags : ['#待补充'];
      const initials = platformLabel(platform).slice(0, 2).toUpperCase();
      return '<div class="preview-shell" data-platform="' + esc(platform) + '">' +
        '<div class="preview-head">' +
          '<div class="preview-brand">' +
            '<div class="preview-avatar">' + esc(initials) + '</div>' +
            '<div class="preview-meta">' +
              '<div class="preview-name">' + esc(platformLabel(platform)) + ' 预览</div>' +
              '<div class="preview-sub">' + esc(previewAudienceLabel(platform)) + '</div>' +
            '</div>' +
          '</div>' +
          pill('预览', 'ok') +
        '</div>' +
        '<div class="preview-title">' + esc(safeTitle) + '</div>' +
        '<div class="preview-body">' + esc(safeCaption) + '</div>' +
        '<div class="preview-tags">' + safeHashtags.map((tag) =>
          '<span class="preview-tag">' + esc(tag) + '</span>'
        ).join('') + '</div>' +
        '<div class="preview-footer">' +
          '<span>预览</span>' +
          '<span>' + esc(platformLabel(platform)) + '</span>' +
        '</div>' +
      '</div>';
    }

    function renderVariantPreview(variant) {
      return renderVariantPreviewFromValues(variant.platform, variant.title, variant.caption, variant.hashtags);
    }

    function renderOverviewDetail(data) {
      const filtersApplied = Object.values(filterFields).filter((element) => element && element.value).length;
      overviewDetail.innerHTML =
        '<article class="detail-card">' +
          hintMarker('这里放常用操作。') +
          '<div class="command-hero">' +
            '<div>' +
              '<div class="detail-kicker">总览</div>' +
              '<div class="detail-title">概况</div>' +
              '<div class="meta">先看整体。</div>' +
            '</div>' +
            '<div class="command-summary">' +
              pill('筛选 ' + filtersApplied, filtersApplied ? 'warn' : 'ok') +
              pill('来源 ' + data.sources.length, 'ok') +
              pill('发布候选 ' + data.publishCandidates.length, data.publishCandidates.length ? 'warn' : 'ok') +
            '</div>' +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('先重跑 Demo，或直接运行采集。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="command-grid">' +
            '<button class="primary command-button" type="button" data-overview-action="run-demo"' + (isBusy ? ' disabled' : '') + '>' +
              '<strong>' + actionLabel('demo:run', '重跑 Demo') + '</strong>' +
              '<span>恢复演示数据。</span>' +
            '</button>' +
            '<div class="command-row">' +
              '<button class="command-button" type="button" data-overview-action="run-ingestion"' + (isBusy ? ' disabled' : '') + '>' +
                '<strong>' + actionLabel('overview:run-ingestion', '运行采集') + '</strong>' +
                '<span>对启用来源补一轮内容。</span>' +
              '</button>' +
              '<button class="command-button" type="button" data-overview-action="run-metrics"' + (isBusy ? ' disabled' : '') + '>' +
                '<strong>' + actionLabel('overview:run-metrics', '同步指标') + '</strong>' +
                '<span>刷新发布后的表现数据。</span>' +
              '</button>' +
            '</div>' +
            '<div class="command-row single">' +
              '<button class="command-button" type="button" data-overview-action="go-publish"' + (isBusy ? ' disabled' : '') + '>' +
                '<strong>查看发布</strong>' +
                '<span>跳到发布。</span>' +
              '</button>' +
            '</div>' +
            '<div class="command-row single">' +
              '<button class="command-button" type="button" data-overview-action="go-reviews"' + (isBusy ? ' disabled' : '') + '>' +
                '<strong>查看审核</strong>' +
                '<span>跳到审核。</span>' +
              '</button>' +
            '</div>' +
            '<div class="command-row single">' +
              '<button class="command-button" type="button" data-overview-action="go-jobs"' + (isBusy ? ' disabled' : '') + '>' +
                '<strong>查看任务</strong>' +
                '<span>查看后台任务。</span>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }

    function renderTopicDetail(data) {
      const topic = getSelectedTopic(data);
      if (!topic) {
        topicDetail.innerHTML = empty('当前筛选下没有选题可操作。');
        return;
      }

      const canSelect = topic.status !== 'selected';
      const canReject = topic.status !== 'rejected';
      const selectedCandidate = getSelectedTopicCandidate(data);
      const orderedCandidateItems = [...topic.candidateItems].sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary));
      topicDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">选题</div>' +
          '<div class="detail-title">' + esc(topic.title) + '</div>' +
          '<div class="meta">' + esc(topic.angle || '暂无选题角度') + '</div>' +
          '<div class="meta">' + esc(topic.summary || '暂无选题摘要') + '</div>' +
          '<div class="meta">推荐：' + esc(topic.recommendation) + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + topicStatusLabel(topic.status), topic.status === 'selected' ? 'ok' : topic.status === 'rejected' ? 'hot' : 'warn') +
            pill('热度 ' + topic.score, 'warn') +
            pill('来源 ' + topic.sourceCount, 'ok') +
            pill('候选素材 ' + topic.normalizedItemCount, topic.normalizedItemCount >= 3 && topic.normalizedItemCount <= 10 ? 'ok' : 'warn') +
          '</div>' +
          '<div class="meta">热词</div>' +
          '<div class="detail-actions">' + (
            topic.hotKeywords.length
              ? topic.hotKeywords.map((keyword) =>
                  '<button class="keyword-chip' + (normalizeTopicKeyword(keyword) === normalizeTopicKeyword(selectedTopicKeyword) ? ' active' : '') + '" type="button" data-topic-keyword="' + esc(keyword) + '">' + esc(keyword) + '</button>'
                ).join('')
              : '<span class="meta">暂无</span>'
          ) + '</div>' +
          '<div class="meta">来源：' + esc(topic.sourceNames.length ? topic.sourceNames.join('、') : '暂无') + '</div>' +
          '<div class="meta">平台：' + esc(topic.platforms.length ? topic.platforms.map(platformLabel).join('、') : '未识别') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('先决定题目去留。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-topic-action="select" data-topic-id="' + esc(topic.id) + '"' + (canSelect && !isBusy ? '' : ' disabled') + '>' + actionLabel('topic:select', '选中') + '</button>' +
            '<button type="button" data-topic-action="reject" data-topic-id="' + esc(topic.id) + '"' + (canReject && !isBusy ? '' : ' disabled') + '>' + actionLabel('topic:reject', '拒绝') + '</button>' +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">候选素材</div>' +
          '<div class="candidate-list">' + orderedCandidateItems.map((item) =>
            '<button class="candidate-card' + (item.id === selectedTopicCandidateId ? ' active' : '') + (item.isPrimary ? ' primary' : '') + '" type="button" data-topic-candidate-id="' + esc(item.id) + '">' +
              '<div class="detail-actions">' +
                pill(item.isPrimary ? '主素材' : '补充素材', item.isPrimary ? 'ok' : '') +
              '</div>' +
              '<div class="title">' + esc(item.title) + '</div>' +
              '<div class="meta">来源 ' + esc(item.sourceName) + ' · 平台 ' + esc(platformLabel(item.platform)) + '</div>' +
              '<div class="meta">' + esc(item.summary || '暂无摘要') + '</div>' +
              '<div class="meta">关键词 ' + esc(item.keywords.length ? item.keywords.join('、') : '暂无') + '</div>' +
            '</button>'
          ).join('') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">素材详情</div>' +
          (selectedCandidate
            ? '<div class="detail-actions">' + pill(selectedCandidate.isPrimary ? '主素材' : '补充素材', selectedCandidate.isPrimary ? 'ok' : '') + '</div>' +
              '<div class="detail-title">' + esc(selectedCandidate.title) + '</div>' +
              '<div class="meta">来源 ' + esc(selectedCandidate.sourceName) + ' · 平台 ' + esc(platformLabel(selectedCandidate.platform)) + '</div>' +
              '<div class="meta">' + esc(selectedCandidate.summary || '暂无摘要') + '</div>' +
              '<div class="detail-actions">' +
                '<button type="button" class="' + (expandedTopicCandidateId === selectedCandidate.id ? 'primary ' : '') + '" data-topic-candidate-toggle="' + esc(selectedCandidate.id) + '">' +
                  esc(expandedTopicCandidateId === selectedCandidate.id ? '收起原文' : '展开原文') +
                '</button>' +
              '</div>' +
              (expandedTopicCandidateId === selectedCandidate.id && selectedCandidate.fullText
                ? '<div class="candidate-fulltext">' + esc(selectedCandidate.fullText) + '</div>'
                : '') +
              '<div class="detail-actions">' + (
                selectedCandidate.keywords.length
                  ? selectedCandidate.keywords.map((keyword) =>
                      '<button class="keyword-chip' + (normalizeTopicKeyword(keyword) === normalizeTopicKeyword(selectedTopicKeyword) ? ' active' : '') + '" type="button" data-topic-keyword="' + esc(keyword) + '">' + esc(keyword) + '</button>'
                    ).join('')
                  : '<span class="meta">暂无关键词</span>'
              ) + '</div>'
            : '<div class="meta">先选择一条素材查看。</div>') +
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
          '<div class="detail-kicker">草稿</div>' +
          '<div class="detail-title">' + esc(draft.title) + '</div>' +
          '<div class="meta">' + esc(draftTypeLabel(draft.draftType)) + ' · 状态 ' + esc(draftStatusLabel(draft.status)) + '</div>' +
          '<div class="meta">引用 ' + esc(draft.sourceRefCount) + ' · 素材 ' + esc(draft.assetCount) + ' · 平台版本 ' + esc(draft.variantCount) + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('草稿 ' + draftStatusLabel(draft.status), draft.status === 'approved' ? 'ok' : 'warn') +
            pill('审核 ' + (draft.reviewStatus ? reviewStatusLabel(draft.reviewStatus) : '未提交'), draft.reviewStatus === 'approved' ? 'ok' : draft.reviewStatus ? 'warn' : '') +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('这里处理草稿。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-draft-action="render" data-draft-id="' + esc(draft.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('draft:render', '渲染素材') + '</button>' +
            '<button type="button" data-draft-action="submit-review" data-draft-id="' + esc(draft.id) + '"' + (canSubmitReview && !isBusy ? '' : ' disabled') + '>' + actionLabel('draft:submit-review', '提交审核') + '</button>' +
            '<button type="button" data-draft-action="regenerate" data-draft-id="' + esc(draft.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('draft:regenerate', '重新生成') + '</button>' +
          '</div>' +
        '</article>';
    }

    function renderReviewDetail(data) {
      const review = getSelectedReview(data);
      if (!review) {
        reviewDetail.innerHTML = empty('当前筛选下没有审核任务可操作。');
        return;
      }

      const canApprove = review.availablePlatforms.length > 0;
      const selectedVariantId = selectedReviewVariantId;
      reviewDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">审核</div>' +
          '<div class="detail-title">' + esc(review.draftTitle) + '</div>' +
          '<div class="meta">' + esc(draftTypeLabel(review.draftType)) + ' · 审核状态 ' + esc(reviewStatusLabel(review.status)) + '</div>' +
          '<div class="meta">可发布平台：' + esc((review.availablePlatforms.map(platformLabel)).join('、') || '暂无平台版本') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + reviewStatusLabel(review.status), review.status === 'approved' ? 'ok' : review.status === 'rejected' ? 'hot' : 'warn') +
            (review.scheduledAt ? pill('已排期', 'ok') : pill('未排期', 'warn')) +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('通过会带上已有平台版本。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-review-action="approve" data-review-id="' + esc(review.id) + '"' + (canApprove && !isBusy ? '' : ' disabled') + '>' + actionLabel('review:approve', '通过') + '</button>' +
            '<button type="button" data-review-action="reject" data-review-id="' + esc(review.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('review:reject', '驳回') + '</button>' +
            '<button type="button" data-review-action="request-regenerate" data-review-id="' + esc(review.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('review:request-regenerate', '重生成') + '</button>' +
          '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('这里直接修改各平台要发布的内容。') +
          '<div class="detail-kicker">修改内容</div>' +
          (
            review.variants.length
              ? '<div class="variant-editor-list">' + review.variants.map((variant) =>
                  '<div class="variant-editor-card' + (variant.id === selectedVariantId ? ' active' : '') + (variant.id === recentlySavedReviewVariantId ? ' just-saved' : '') + '">' +
                    '<div class="variant-editor-summary">' +
                    '<div class="detail-actions">' +
                      pill(platformLabel(variant.platform), 'ok') +
                      pill('状态 ' + esc(variant.status), variant.status === 'published' ? 'ok' : 'warn') +
                      (variant.id === recentlySavedReviewVariantId ? pill('刚保存', 'ok') : '') +
                    '</div>' +
                    '<div class="meta">' + esc(variant.title || '当前还没有单独标题') + '</div>' +
                    '<div class="detail-actions">' +
                      '<button type="button" data-review-variant-select="' + esc(variant.id) + '"' + (variant.id === selectedVariantId ? ' class="active"' : '') + (isBusy ? ' disabled' : '') + '>' + (variant.id === selectedVariantId ? '正在编辑' : '展开编辑') + '</button>' +
                    '</div>' +
                    '</div>' +
                    (variant.id === selectedVariantId
                      ? '<form class="editor-form compact" data-review-variant-form data-variant-id="' + esc(variant.id) + '">' +
                      '<div class="field"><label for="variantTitle-' + esc(variant.id) + '">发布标题</label><input id="variantTitle-' + esc(variant.id) + '" name="title" value="' + esc(variant.title || '') + '" placeholder="填写标题" ' + (isBusy ? 'disabled ' : '') + '/></div>' +
                      '<div class="field"><label for="variantCaption-' + esc(variant.id) + '">发布正文</label><textarea id="variantCaption-' + esc(variant.id) + '" name="caption" spellcheck="false" ' + (isBusy ? 'disabled ' : '') + '>' + esc(variant.caption || '') + '</textarea></div>' +
                      '<div class="field"><label for="variantHashtags-' + esc(variant.id) + '">Hashtags</label><input id="variantHashtags-' + esc(variant.id) + '" name="hashtags" value="' + esc(hashtagsText(variant.hashtags)) + '" placeholder="#趋势, #内容工作流" ' + (isBusy ? 'disabled ' : '') + '/></div>' +
                      '<div class="field"><label>内容预览</label><div data-review-variant-preview data-platform="' + esc(variant.platform) + '">' + renderVariantPreview(variant) + '</div></div>' +
                      (
                        review.variants.length > 1
                          ? '<div class="detail-note">可先复制，再分别微调。</div>' +
                            '<div class="detail-actions">' +
                              review.variants
                                .filter((target) => target.id !== variant.id)
                                .map((target) =>
                                  '<button type="button" data-review-variant-copy="' + esc(variant.id) + '" data-review-variant-copy-target="' + esc(target.id) + '"' + (isBusy ? ' disabled' : '') + '>复制到 ' + esc(platformLabel(target.platform)) + '</button>'
                                ).join('') +
                              '<button type="button" data-review-variant-copy="' + esc(variant.id) + '" data-review-variant-copy-target="all"' + (isBusy ? ' disabled' : '') + '>复制到全部其他平台</button>' +
                            '</div>'
                          : ''
                      ) +
                      '<div class="detail-actions">' +
                        '<button class="primary" type="submit"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('review:variant:update:' + variant.id, '保存发布内容') + '</button>' +
                      '</div>' +
                    '</form>'
                    : '') +
                  '</div>'
                ).join('') + '</div>'
              : '<div class="detail-note">当前还没有可编辑的平台版本。先补平台版本，再回来审核。</div>'
          ) +
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
            '<div class="detail-kicker">发布</div>' +
            '<div class="detail-title">' + esc(candidate.draftTitle) + '</div>' +
            '<div class="meta">' + esc(draftTypeLabel(candidate.draftType)) + ' · 平台 ' + esc(platformLabel(candidate.platform)) + '</div>' +
            '<div class="meta">当前还没有发布任务，这里可以直接补建。</div>' +
          '</article>' +
          '<article class="detail-card">' +
            '<div class="detail-actions">' +
              pill('待创建', 'warn') +
              pill('版本状态 ' + esc(candidate.variantStatus), 'ok') +
            '</div>' +
          '</article>' +
          '<article class="detail-card">' +
            hintMarker('这里先创建任务。') +
            '<div class="detail-kicker">操作</div>' +
            '<div class="detail-actions">' +
              '<button class="primary" type="button" data-publish-action="create" data-channel-variant-id="' + esc(candidate.channelVariantId) + '" data-platform="' + esc(candidate.platform) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('publish:create', '创建任务') + '</button>' +
            '</div>' +
          '</article>';
        return;
      }

      const task = selected.item;
      const canRun = task.status === 'queued';
      const canRetry = task.status === 'failed';
      const canCancel = task.status === 'queued';
      publishDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">发布</div>' +
          '<div class="detail-title">' + esc(task.draftTitle || task.id) + '</div>' +
          '<div class="meta">' + esc(draftTypeLabel(task.draftType)) + ' · 平台 ' + esc(platformLabel(task.platform)) + ' · 状态 ' + esc(publishStatusLabel(task.status)) + '</div>' +
          '<div class="meta">' + esc(task.remotePostId || '尚未生成远端发布 ID') + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + publishStatusLabel(task.status), task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') +
            pill('重试 ' + task.retryCount, task.retryCount ? 'warn' : 'ok') +
            (task.scheduledAt ? pill('已排期', 'ok') : pill('立即发布', 'warn')) +
          '</div>' +
          (task.errorMessage ? '<div class="meta">失败原因：' + esc(task.errorMessage) + '</div>' : '') +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('这里执行、重试或取消。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-publish-action="run" data-publish-task-id="' + esc(task.id) + '"' + (canRun && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:run', '发布') + '</button>' +
            '<button type="button" data-publish-action="retry" data-publish-task-id="' + esc(task.id) + '"' + (canRetry && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:retry', '重试') + '</button>' +
            '<button type="button" data-publish-action="cancel" data-publish-task-id="' + esc(task.id) + '"' + (canCancel && !isBusy ? '' : ' disabled') + '>' + actionLabel('publish:cancel', '取消') + '</button>' +
          '</div>' +
        '</article>';
    }

    function renderJobDetail(data) {
      const job = getSelectedJob(data);
      if (!job) {
        jobDetail.innerHTML = empty('当前还没有后台任务。先运行采集或后续入队动作，再回来查看。');
        return;
      }

      const canRun = job.status === 'queued';
      const canRetry = job.status === 'failed';
      jobDetail.innerHTML =
        '<article class="detail-card">' +
          '<div class="detail-kicker">任务</div>' +
          '<div class="detail-title">' + esc(jobTypeLabel(job.jobType)) + '</div>' +
          '<div class="meta">任务状态 ' + esc(jobStatusLabel(job.status)) + ' · 创建于 ' + esc(job.createdAt) + '</div>' +
          '<div class="meta">Job ID：' + esc(job.id) + '</div>' +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-actions">' +
            pill('状态 ' + jobStatusLabel(job.status), job.status === 'succeeded' ? 'ok' : job.status === 'failed' ? 'hot' : 'warn') +
            (job.startedAt ? pill('已开始', 'ok') : pill('未开始', 'warn')) +
            (job.finishedAt ? pill('已结束', 'ok') : pill('未结束', 'warn')) +
          '</div>' +
          (job.topicId ? '<div class="meta">关联选题：' + esc(job.topicId) + '</div>' : '') +
          (job.draftId ? '<div class="meta">关联草稿：' + esc(job.draftId) + '</div>' : '') +
          (job.startedAt ? '<div class="meta">开始时间：' + esc(job.startedAt) + '</div>' : '') +
          (job.finishedAt ? '<div class="meta">结束时间：' + esc(job.finishedAt) + '</div>' : '') +
          (job.errorMessage ? '<div class="meta">失败原因：' + esc(job.errorMessage) + '</div>' : '') +
        '</article>' +
        '<article class="detail-card">' +
          '<div class="detail-kicker">任务负载</div>' +
          '<pre class="config-preview">' + esc(prettyJson(job.payload)) + '</pre>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('这里处理后台任务。') +
          '<div class="detail-kicker">操作</div>' +
          '<div class="detail-actions">' +
            '<button class="primary" type="button" data-job-action="run" data-job-id="' + esc(job.id) + '"' + (canRun && !isBusy ? '' : ' disabled') + '>' + actionLabel('job:run', '执行任务') + '</button>' +
            '<button type="button" data-job-action="retry" data-job-id="' + esc(job.id) + '"' + (canRetry && !isBusy ? '' : ' disabled') + '>' + actionLabel('job:retry', '重新入队') + '</button>' +
          '</div>' +
        '</article>';
    }

    function renderSourceDetail(data) {
      const source = getSelectedSource(data);
      if (!source && sourceEditorMode !== 'create') {
        sourceDetail.innerHTML = empty('当前筛选下没有来源可操作。');
        return;
      }

      const editingExisting = sourceEditorMode !== 'create' && Boolean(source);
      const editorSource = editingExisting ? source : {
        id: '',
        name: '',
        type: 'rss',
        platform: 'xiaohongshu',
        status: 'active',
        config: defaultSourceConfig(),
        rawItemsCount: 0,
        createdAt: '',
        updatedAt: '',
        lastSyncedAt: '',
      };
      const nextStatus = source && source.status === 'active' ? 'disabled' : 'active';
      const toggleLabel = source && source.status === 'active' ? '停用来源' : '启用来源';
      sourceDetail.innerHTML =
        (source ? (
          '<article class="detail-card">' +
            '<div class="detail-kicker">来源</div>' +
            '<div class="detail-title">' + esc(source.name) + '</div>' +
            '<div class="meta">' + esc(sourceTypeLabel(source.type)) + ' · 平台 ' + esc(platformLabel(source.platform)) + ' · 状态 ' + esc(sourceStatusLabel(source.status)) + '</div>' +
            '<div class="meta">最近同步：' + esc(source.lastSyncedAt || '尚未同步') + '</div>' +
          '</article>' +
          '<article class="detail-card">' +
            '<div class="detail-meta-grid">' +
              '<div class="mini-stat"><div class="label">状态</div><strong>' + esc(sourceStatusLabel(source.status)) + '</strong></div>' +
              '<div class="mini-stat"><div class="label">原始内容</div><strong>' + esc(source.rawItemsCount) + ' 条</strong></div>' +
              '<div class="mini-stat"><div class="label">创建时间</div><strong>' + esc(source.createdAt || '未知') + '</strong></div>' +
              '<div class="mini-stat"><div class="label">更新时间</div><strong>' + esc(source.updatedAt || '未知') + '</strong></div>' +
            '</div>' +
          '</article>' +
          '<article class="detail-card">' +
            '<div class="detail-kicker">当前配置</div>' +
            '<pre class="config-preview">' + esc(prettyJson(source.config)) + '</pre>' +
          '</article>' +
          '<article class="detail-card">' +
            hintMarker('同步来源会刷新该来源的最近同步时间；启停状态会影响全局采集是否包含它。') +
            '<div class="detail-kicker">操作</div>' +
            '<div class="detail-actions">' +
              '<button class="primary" type="button" data-source-action="sync" data-source-id="' + esc(source.id) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('source:sync', '同步来源') + '</button>' +
              '<button type="button" data-source-action="toggle-status" data-source-id="' + esc(source.id) + '" data-next-status="' + esc(nextStatus) + '"' + (isBusy ? ' disabled' : '') + '>' + actionLabel('source:toggle-status', toggleLabel) + '</button>' +
            '</div>' +
          '</article>'
        ) : '') +
        '<article class="detail-card">' +
          hintMarker('这里可以直接维护来源名称、平台、类型和 JSON 配置，不用再跳到单独页面。') +
            '<div class="detail-kicker">编辑来源</div>' +
          '<div class="detail-actions editor-switch">' +
            '<button type="button" data-source-editor-mode="edit"' + (editingExisting ? ' class="active"' : '') + (source && !isBusy ? '' : ' disabled') + '>编辑当前来源</button>' +
            '<button type="button" data-source-editor-mode="create"' + (!editingExisting ? ' class="active"' : '') + (isBusy ? ' disabled' : '') + '>新建来源</button>' +
          '</div>' +
          '<form class="editor-form" data-source-editor-form data-mode="' + (editingExisting ? 'edit' : 'create') + '" data-source-id="' + esc(editorSource.id || '') + '">' +
            '<div class="editor-grid">' +
              '<div class="field"><label for="sourceEditorName">来源名称</label><input id="sourceEditorName" name="name" value="' + esc(editorSource.name || '') + '" placeholder="例如：TikTok 热榜监控" ' + (isBusy ? 'disabled ' : '') + 'required /></div>' +
              '<div class="field"><label for="sourceEditorPlatform">所属平台</label><select id="sourceEditorPlatform" name="platform" ' + (isBusy ? 'disabled ' : '') + '>' + platformOptions(editorSource.platform || 'xiaohongshu') + '</select></div>' +
              '<div class="field"><label for="sourceEditorType">来源类型</label><select id="sourceEditorType" name="type" ' + (isBusy ? 'disabled ' : '') + '>' + sourceTypeOptions(editorSource.type || 'rss') + '</select></div>' +
              '<div class="field"><label for="sourceEditorStatus">来源状态</label><select id="sourceEditorStatus" name="status" ' + (isBusy ? 'disabled ' : '') + '>' + sourceStatusOptions(editorSource.status || 'active') + '</select></div>' +
            '</div>' +
            '<div class="field"><label for="sourceEditorConfig">配置 JSON</label><textarea id="sourceEditorConfig" name="config" spellcheck="false" ' + (isBusy ? 'disabled ' : '') + '>' + esc(prettyJson(editorSource.config || defaultSourceConfig())) + '</textarea></div>' +
            '<div class="detail-note">配置会按 JSON 原样保存。</div>' +
            '<div class="detail-actions">' +
              '<button class="primary" type="submit"' + (isBusy ? ' disabled' : '') + '>' + actionLabel(editingExisting ? 'source:update' : 'source:create', editingExisting ? '保存来源' : '创建来源') + '</button>' +
              '<button type="button" data-source-action="cancel-editor"' + (isBusy ? ' disabled' : '') + '>取消编辑</button>' +
            '</div>' +
          '</form>' +
        '</article>' +
        '<article class="detail-card">' +
          hintMarker('下面的发布列表仍然保留，用来从来源阶段顺手切到发布筛选视角。') +
          '<div class="detail-kicker">发布筛选</div>' +
          '<div class="meta">用来快速切到发布筛选视角。</div>' +
        '</article>';
    }

    function render(data) {
      hideHint();
      latestVisualization = data;
      syncSelectedTopic(data);
      syncSelectedTopicCandidate(data);
      syncSelectedDraft(data);
      syncSelectedReview(data);
      syncSelectedReviewVariant(data);
      syncSelectedPublish(data);
      syncSelectedJob(data);
      syncSelectedSource(data);
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
        pill('任务 ' + data.jobs.length, data.jobs.some((job) => job.status === 'failed') ? 'hot' : 'ok'),
        pill('指标 ' + totals.totalViews + ' 浏览', 'warn')
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
        '<button class="platform" type="button" data-platform-card="' + esc(item.platform) + '" aria-label="筛选平台 ' + esc(platformLabel(item.platform)) + '"><div class="platform-name"><span>' + esc(platformLabel(item.platform)) + '</span>' + pill(item.published + '/' + item.publishTasks, item.failed ? 'hot' : 'ok') + '</div><div class="meta">浏览 ' + esc(item.views) + ' · 点赞 ' + esc(item.likes) + ' · 评论 ' + esc(item.comments) + '</div><div class="bar"><div class="fill" style="width:' + (item.publishTasks ? Math.round((item.published / item.publishTasks) * 100) : 0) + '%"></div></div></button>'
      ).join('');
      renderOverviewDetail(data);

      const sortedTopics = getSortedTopics(data);
      topicKeywordSummary.innerHTML = selectedTopicKeyword
        ? '<strong>热词</strong>' + filterChip('topicKeyword', '热词', selectedTopicKeyword)
        : '<strong>热词</strong>' + pill('未筛选', 'ok');
      topicSort.value = selectedTopicSort;
      $('topics').innerHTML = renderRows(sortedTopics, (topic) =>
        '<button class="row interactive-row topic-row' + (topic.id === selectedTopicId ? ' active' : '') + '" type="button" data-topic-id="' + esc(topic.id) + '" aria-label="查看选题 ' + esc(topic.title) + '"><div><div class="title">' + esc(topic.title) + '</div><div class="meta">' + esc(topic.recommendation) + '</div><div class="meta">热词 ' + esc(topic.hotKeywords.length ? topic.hotKeywords.join(' / ') : '暂无') + '</div><div class="meta">来源 ' + esc(topic.sourceNames.length ? topic.sourceNames.join('、') : '暂无') + ' · 候选素材 ' + esc(topic.normalizedItemCount) + ' · 平台 ' + esc(topic.platforms.length ? topic.platforms.map(platformLabel).join('、') : '未识别') + '</div></div>' + pill(topicStatusLabel(topic.status), topic.status === 'selected' ? 'ok' : 'warn') + '</button>',
        selectedTopicKeyword ? '当前热词下没有选题。换个热词试试。' : '还没有选题数据。点击“运行 Demo”生成一组样例。'
      );
      renderTopicDetail(data);

      $('drafts').innerHTML = renderRows(data.drafts, (draft) =>
        '<button class="row interactive-row draft-row' + (draft.id === selectedDraftId ? ' active' : '') + '" type="button" data-draft-id="' + esc(draft.id) + '" aria-label="查看草稿 ' + esc(draft.title) + '"><div><div class="title">' + esc(draft.title) + '</div><div class="meta">' + esc(draftTypeLabel(draft.draftType)) + ' · 素材 ' + esc(draft.assetCount) + ' · 平台版本 ' + esc(draft.variantCount) + ' · 引用 ' + esc(draft.sourceRefCount) + '</div></div>' + pill(draft.reviewStatus ? reviewStatusLabel(draft.reviewStatus) : draftStatusLabel(draft.status), draft.reviewStatus === 'approved' ? 'ok' : 'warn') + '</button>',
        '还没有图文草稿。'
      );
      renderDraftDetail(data);

      $('reviews').innerHTML = renderRows(data.reviews, (review) =>
        '<button class="row interactive-row review-row' + (review.id === selectedReviewId ? ' active' : '') + '" type="button" data-review-id="' + esc(review.id) + '" aria-label="查看审核任务 ' + esc(review.draftTitle) + '"><div><div class="title">' + esc(review.draftTitle) + '</div><div class="meta">' + esc(draftTypeLabel(review.draftType)) + ' · 平台 ' + esc((review.availablePlatforms.map(platformLabel)).join('、') || '无') + '</div></div>' + pill(reviewStatusLabel(review.status), review.status === 'approved' ? 'ok' : review.status === 'rejected' ? 'hot' : 'warn') + '</button>',
        '还没有审核任务。'
      );
      renderReviewDetail(data);

      $('publishWorkbench').innerHTML = renderRows(listPublishEntries(data), (entry) => {
        if (entry.kind === 'candidate') {
          const candidate = entry.item;
          return '<button class="row interactive-row publish-row' + (entry.key === selectedPublishKey ? ' active' : '') + '" type="button" data-publish-key="' + esc(entry.key) + '" aria-label="查看待创建发布 ' + esc(candidate.draftTitle) + '"><div><div class="title">' + esc(candidate.draftTitle) + '</div><div class="meta">' + esc(draftTypeLabel(candidate.draftType)) + ' · ' + esc(platformLabel(candidate.platform)) + ' · 还未建任务</div></div>' + pill('待创建', 'warn') + '</button>';
        }

        const task = entry.item;
        return '<button class="row interactive-row publish-row' + (entry.key === selectedPublishKey ? ' active' : '') + '" type="button" data-publish-key="' + esc(entry.key) + '" aria-label="查看发布任务 ' + esc(task.draftTitle || task.id) + '"><div><div class="title">' + esc(task.draftTitle || task.id) + '</div><div class="meta">' + esc(platformLabel(task.platform)) + ' · ' + esc(task.remotePostId || '未产生远端 ID') + '</div></div>' + pill(publishStatusLabel(task.status), task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') + '</button>';
      }, filterFields.publishStatus.value
        ? '当前发布状态筛选下没有发布任务。清空发布状态后，也会重新看到待创建候选。'
        : '还没有发布任务，也没有待创建候选。');
      renderPublishDetail(data);

      const visibleJobs = listVisibleJobs(data);
      if (jobStatusStageFilter) {
        jobStatusStageFilter.value = selectedJobStatus;
        jobStatusStageFilter.disabled = isBusy;
      }
      $('jobs').innerHTML = renderRows(visibleJobs, (job) =>
        '<button class="row interactive-row job-row' + (job.id === selectedJobId ? ' active' : '') + '" type="button" data-job-id="' + esc(job.id) + '" aria-label="查看任务 ' + esc(job.id) + '"><div><div class="title">' + esc(jobTypeLabel(job.jobType)) + '</div><div class="meta">' + esc(jobStatusLabel(job.status)) + ' · 创建于 ' + esc(job.createdAt) + '</div></div>' + pill(jobStatusLabel(job.status), job.status === 'succeeded' ? 'ok' : job.status === 'failed' ? 'hot' : 'warn') + '</button>',
        selectedJobStatus ? '当前状态筛选下没有任务。' : '当前还没有后台任务。'
      );
      renderJobDetail(data);

      $('sources').innerHTML = renderRows(data.sources, (source) =>
        '<button class="row interactive-row source-row' + (source.id === selectedSourceId ? ' active' : '') + '" type="button" data-source-id="' + esc(source.id) + '" aria-label="查看来源 ' + esc(source.name) + '"><div><div class="title">' + esc(source.name) + '</div><div class="meta">' + esc(sourceTypeLabel(source.type)) + ' · ' + esc(platformLabel(source.platform)) + ' · 原始内容 ' + esc(source.rawItemsCount) + ' 条 · 最近同步 ' + esc(source.lastSyncedAt || '从未同步') + '</div></div>' + pill(sourceStatusLabel(source.status), source.status === 'active' ? 'ok' : '') + '</button>',
        '还没有信息源。'
      );
      renderSourceDetail(data);

      $('publishes').innerHTML = renderRows(data.publishes.slice(0, 10), (task) =>
        '<button class="row interactive-row" type="button" data-publish-platform="' + esc(task.platform) + '" data-publish-status="' + esc(task.status) + '" aria-label="筛选发布 ' + esc(platformLabel(task.platform) + ' ' + publishStatusLabel(task.status)) + '"><div><div class="title">' + esc(task.draftTitle || task.id) + '</div><div class="meta">' + esc(platformLabel(task.platform)) + ' · ' + esc(task.remotePostId || '未产生远端 ID') + '</div></div>' + pill(publishStatusLabel(task.status), task.status === 'published' ? 'ok' : task.status === 'failed' ? 'hot' : 'warn') + '</button>',
        '还没有发布记录。'
      );

      clearJobAutoRefresh();
      if (shouldAutoRefreshJobs(data) && !isBusy) {
        jobAutoRefreshTimer = setTimeout(() => {
          load({ silent: true }).catch((error) => {
            setStatus(error.message);
          });
        }, 2500);
      }
    }

    async function load(options = {}) {
      const silent = Boolean(options.silent);
      if (!silent) {
        setStatus('正在读取工作流数据...');
      }
      const query = applyFilters(false);
      renderFilterSummary();
      const response = await fetch(apiRoot + '/dashboard/visualization' + (query ? '?' + query : ''));
      if (!response.ok) throw new Error(await describeError(response, '读取工作流数据失败'));
      render(await response.json());
      lastLoadedAt = new Date().toLocaleString();
      syncControlState();
      if (!silent) {
        setStatus('工作流数据已刷新。');
      }
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
        showFeedback('ok', '操作完成', 'Demo 已运行完成，页面数据已刷新。');
      } finally {
        clearBusy();
      }
    }

    async function runIngestion() {
      setBusy('overview:run-ingestion', '正在对 active 来源运行 ingestion...');
      try {
        const response = await fetch(apiRoot + '/ingestion/run', {
          method: 'POST'
        });
        if (!response.ok) throw new Error(await describeError(response, '运行采集失败'));
        const result = await response.json();
        selectedJobId = result.jobId || selectedJobId;
        await load();
        showFeedback('ok', '操作完成', '采集任务已入队。等 worker 执行后，来源同步时间和总览指标会更新。');
      } finally {
        clearBusy();
      }
    }

    async function runMetricsSync() {
      setBusy('overview:run-metrics', '正在为已发布内容同步最新指标...');
      try {
        const response = await fetch(apiRoot + '/metrics/sync', {
          method: 'POST'
        });
        if (!response.ok) throw new Error(await describeError(response, '同步指标失败'));
        const result = await response.json();
        selectedJobId = result.jobId || selectedJobId;
        await load();
        showFeedback('ok', '操作完成', '指标同步任务已入队。等 worker 执行后，总览和平台数据会刷新。');
      } finally {
        clearBusy();
      }
    }

    async function mutateJob(jobId, action) {
      setBusy('job:' + action, '正在执行后台任务...');
      try {
        let response;
        if (action === 'run') {
          response = await fetch(apiRoot + '/jobs/' + encodeURIComponent(jobId) + '/run', {
            method: 'POST'
          });
        } else if (action === 'retry') {
          response = await fetch(apiRoot + '/jobs/' + encodeURIComponent(jobId) + '/retry', {
            method: 'POST'
          });
        } else {
          throw new Error('未知任务操作');
        }

        if (!response.ok) throw new Error(await describeError(response, '任务操作失败'));
        selectedJobId = jobId;
        await load();
        showFeedback('ok', '操作完成', action === 'retry' ? '任务已重新入队。' : '后台任务已执行完成。');
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
        showFeedback('ok', '操作完成', action === 'select' ? '选题已设为已选中。' : '选题已设为已拒绝。');
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

    async function mutateReviewVariant(variantId, payload, options = {}) {
      setBusy('review:variant:update:' + variantId, '正在保存审核阶段的发布内容...');
      try {
        const response = await fetch(apiRoot + '/channel-variants/' + encodeURIComponent(variantId), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(await describeError(response, '发布内容更新失败'));
        recentlySavedReviewVariantId = variantId;
        if (options.selectAfterSave) {
          selectedReviewVariantId = variantId;
        }
        await load();
        showFeedback('ok', '操作完成', options.successMessage || '发布内容已更新。');
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

    function setSourceEditorMode(mode) {
      sourceEditorMode = mode === 'create' ? 'create' : 'edit';
      if (latestVisualization) {
        render(latestVisualization);
      }
    }

    function readSourceEditorPayload(form) {
      const formData = new FormData(form);
      const name = String(formData.get('name') || '').trim();
      const type = String(formData.get('type') || '').trim();
      const platform = String(formData.get('platform') || '').trim();
      const status = String(formData.get('status') || '').trim();
      const configRaw = String(formData.get('config') || '').trim();

      if (!name) {
        throw new Error('请先填写来源名称。');
      }

      let config;
      try {
        config = configRaw ? JSON.parse(configRaw) : {};
      } catch (error) {
        throw new Error('配置 JSON 解析失败，请检查逗号、引号和括号。');
      }

      if (!config || Array.isArray(config) || typeof config !== 'object') {
        throw new Error('配置 JSON 需要是一个对象，例如 {"endpoint":""}。');
      }

      return { name, type, platform, status, config };
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

    async function mutateSource(sourceId, action, payload) {
      setBusy('source:' + action, '正在执行来源操作...');
      try {
        let response;
        if (action === 'sync') {
          response = await fetch(apiRoot + '/sources/' + encodeURIComponent(sourceId) + '/sync', {
            method: 'POST'
          });
        } else if (action === 'toggle-status') {
          response = await fetch(apiRoot + '/sources/' + encodeURIComponent(sourceId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: payload.nextStatus })
          });
        } else if (action === 'create') {
          response = await fetch(apiRoot + '/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else if (action === 'update') {
          response = await fetch(apiRoot + '/sources/' + encodeURIComponent(sourceId), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } else {
          throw new Error('未知来源操作');
        }

        if (!response.ok) throw new Error(await describeError(response, '来源操作失败'));
        const result = action === 'sync' ? null : await response.json();
        selectedSourceId = result?.id || sourceId;
        sourceEditorMode = 'edit';
        await load();
        if (action === 'sync') {
          showFeedback('ok', '操作完成', '来源已同步。');
        } else if (action === 'create') {
          showFeedback('ok', '操作完成', '新来源已创建。');
        } else if (action === 'update') {
          showFeedback('ok', '操作完成', '来源配置已更新。');
        } else {
          showFeedback('ok', '操作完成', payload.nextStatus === 'active' ? '来源已启用。' : '来源已停用。');
        }
      } finally {
        clearBusy();
      }
    }

    $('applyFiltersBtn').addEventListener('click', () => {
      hideHint();
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
      hideHint();
      setActiveStage(button.getAttribute('data-stage-key') || 'overview', true);
    });
    $('resetFiltersBtn').addEventListener('click', () => {
      hideHint();
      Object.values(filterFields).forEach((element) => {
        if (element) element.value = '';
      });
      selectedTopicKeyword = '';
      applyFilters(true);
      renderFilterSummary();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    $('refreshBtn').addEventListener('click', () => {
      hideHint();
      clearFeedback();
      load().catch((error) => {
        showFeedback('error', '读取失败', error.message);
        setStatus(error.message);
      });
    });
    document.addEventListener('mouseover', (event) => {
      const trigger = event.target.closest('[data-hint-text]');
      if (!trigger) return;
      showHint(trigger);
    });
    document.addEventListener('mouseout', (event) => {
      const trigger = event.target.closest('[data-hint-text]');
      if (!trigger || trigger !== activeHintTrigger) return;
      const next = event.relatedTarget;
      if (next && trigger.contains(next)) return;
      hideHint();
    });
    document.addEventListener('focusin', (event) => {
      const trigger = event.target.closest('[data-hint-text]');
      if (!trigger) return;
      showHint(trigger);
    });
    document.addEventListener('focusout', () => {
      const next = document.activeElement && document.activeElement.closest
        ? document.activeElement.closest('[data-hint-text]')
        : null;
      if (!next) {
        hideHint();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hideHint();
      }
    });
    window.addEventListener('resize', () => {
      if (activeHintTrigger) {
        positionHint(activeHintTrigger);
      }
    });
    window.addEventListener('scroll', () => {
      if (activeHintTrigger) {
        positionHint(activeHintTrigger);
      }
    }, true);
    $('demoBtn').addEventListener('click', () => runDemo().catch((error) => {
      showFeedback('error', '操作失败', error.message);
      setStatus(error.message);
      clearBusy();
    }));
    overviewDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-overview-action]');
      if (!button) return;
      const action = button.getAttribute('data-overview-action');
      if (!action) return;
      if (action === 'run-ingestion') {
        runIngestion().catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
          clearBusy();
        });
        return;
      }
      if (action === 'run-metrics') {
        runMetricsSync().catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
          clearBusy();
        });
        return;
      }
      if (action === 'run-demo') {
        runDemo().catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
          clearBusy();
        });
        return;
      }
      if (action === 'go-reviews') {
        setActiveStage('reviews', true);
        return;
      }
      if (action === 'go-publish') {
        setActiveStage('publish', true);
        return;
      }
      if (action === 'go-jobs') {
        setActiveStage('jobs', true);
      }
    });
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
    topicKeywordSummary.addEventListener('click', (event) => {
      const button = event.target.closest('[data-clear-filter]');
      if (button && button.getAttribute('data-clear-filter') === 'topicKeyword') {
        selectedTopicKeyword = '';
        if (latestVisualization) {
          render(latestVisualization);
        }
      }
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
    jobStatusStageFilter.addEventListener('change', () => {
      selectedJobStatus = jobStatusStageFilter.value || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    topicSort.addEventListener('change', () => {
      selectedTopicSort = topicSort.value || 'recommended';
      if (latestVisualization) {
        render(latestVisualization);
      }
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
    $('jobs').addEventListener('click', (event) => {
      const button = event.target.closest('[data-job-id]');
      if (!button) return;
      selectedJobId = button.getAttribute('data-job-id') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    $('sources').addEventListener('click', (event) => {
      const button = event.target.closest('[data-source-id]');
      if (!button) return;
      sourceEditorMode = 'edit';
      selectedSourceId = button.getAttribute('data-source-id') || '';
      if (latestVisualization) {
        render(latestVisualization);
      }
    });
    $('createSourceBtn').addEventListener('click', () => {
      if (isBusy) return;
      setSourceEditorMode('create');
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
      const candidateButton = event.target.closest('[data-topic-candidate-id]');
      if (candidateButton) {
        selectedTopicCandidateId = candidateButton.getAttribute('data-topic-candidate-id') || '';
        if (latestVisualization) {
          render(latestVisualization);
        }
        return;
      }
      const toggleButton = event.target.closest('[data-topic-candidate-toggle]');
      if (toggleButton) {
        const candidateId = toggleButton.getAttribute('data-topic-candidate-toggle') || '';
        expandedTopicCandidateId = expandedTopicCandidateId === candidateId ? '' : candidateId;
        if (latestVisualization) {
          render(latestVisualization);
        }
        return;
      }
      const keywordButton = event.target.closest('[data-topic-keyword]');
      if (keywordButton) {
        selectedTopicKeyword = keywordButton.getAttribute('data-topic-keyword') || '';
        if (latestVisualization) {
          render(latestVisualization);
        }
        return;
      }
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
      const variantButton = event.target.closest('[data-review-variant-select]');
      if (variantButton) {
        selectedReviewVariantId = variantButton.getAttribute('data-review-variant-select') || '';
        recentlySavedReviewVariantId = '';
        if (latestVisualization) {
          render(latestVisualization);
        }
        return;
      }
      const copyButton = event.target.closest('[data-review-variant-copy]');
      if (copyButton) {
        const sourceVariantId = copyButton.getAttribute('data-review-variant-copy');
        const targetVariantId = copyButton.getAttribute('data-review-variant-copy-target');
        if (!sourceVariantId || !targetVariantId) return;
        const sourceForm = reviewDetail.querySelector('[data-review-variant-form][data-variant-id="' + sourceVariantId + '"]');
        if (!sourceForm) return;
        const payload = readReviewVariantForm(sourceForm);
        const review = latestVisualization ? getSelectedReview(latestVisualization) : null;
        if (!review) return;

        if (targetVariantId === 'all') {
          const targets = review.variants.filter((variant) => variant.id !== sourceVariantId);
          if (!targets.length) return;
          (async () => {
            for (const target of targets) {
              await mutateReviewVariant(target.id, payload, {
                selectAfterSave: false,
                successMessage: '发布内容已复制到其他平台。',
              });
            }
          })().catch((error) => {
            showFeedback('error', '操作失败', error.message);
            setStatus(error.message);
          });
          return;
        }

        mutateReviewVariant(targetVariantId, payload, {
          selectAfterSave: true,
          successMessage: '发布内容已复制到目标平台，可继续微调。',
        }).catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
        });
        return;
      }
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
    reviewDetail.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-review-variant-form]');
      if (!form) return;
      event.preventDefault();
      const variantId = form.getAttribute('data-variant-id');
      if (!variantId) return;

      const formData = new FormData(form);
      const hashtags = String(formData.get('hashtags') || '')
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

      selectedReviewVariantId = variantId;
      mutateReviewVariant(variantId, {
        title: String(formData.get('title') || '').trim(),
        caption: String(formData.get('caption') || '').trim(),
        hashtags,
      }).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    reviewDetail.addEventListener('input', (event) => {
      const form = event.target.closest('[data-review-variant-form]');
      if (!form) return;
      const preview = form.querySelector('[data-review-variant-preview]');
      if (!preview) return;
      const platform = preview.getAttribute('data-platform') || '';
      const payload = readReviewVariantForm(form);
      preview.innerHTML = renderVariantPreviewFromValues(platform, payload.title, payload.caption, payload.hashtags);
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
    jobDetail.addEventListener('click', (event) => {
      const button = event.target.closest('[data-job-action]');
      if (!button) return;
      const action = button.getAttribute('data-job-action');
      const jobId = button.getAttribute('data-job-id');
      if (!action || !jobId) return;
      mutateJob(jobId, action).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    sourceDetail.addEventListener('click', (event) => {
      const modeButton = event.target.closest('[data-source-editor-mode]');
      if (modeButton) {
        setSourceEditorMode(modeButton.getAttribute('data-source-editor-mode') || 'edit');
        return;
      }

      const button = event.target.closest('[data-source-action]');
      if (!button) return;
      const sourceId = button.getAttribute('data-source-id');
      const action = button.getAttribute('data-source-action');
      if (!action) return;
      if (action === 'cancel-editor') {
        sourceEditorMode = 'edit';
        if (latestVisualization) {
          render(latestVisualization);
        }
        return;
      }
      if (!sourceId) return;
      mutateSource(sourceId, action, {
        nextStatus: button.getAttribute('data-next-status') || undefined,
      }).catch((error) => {
        showFeedback('error', '操作失败', error.message);
        setStatus(error.message);
      });
    });
    sourceDetail.addEventListener('submit', (event) => {
      const form = event.target.closest('[data-source-editor-form]');
      if (!form) return;
      event.preventDefault();
      try {
        const payload = readSourceEditorPayload(form);
        const mode = form.getAttribute('data-mode') || 'edit';
        const sourceId = form.getAttribute('data-source-id') || '';
        if (mode === 'create') {
          mutateSource('', 'create', payload).catch((error) => {
            showFeedback('error', '操作失败', error.message);
            setStatus(error.message);
          });
          return;
        }
        if (!sourceId) {
          throw new Error('当前没有可编辑的来源。');
        }
        mutateSource(sourceId, 'update', payload).catch((error) => {
          showFeedback('error', '操作失败', error.message);
          setStatus(error.message);
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '来源表单读取失败';
        showFeedback('error', '表单有误', message);
      }
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
