import { ChapterQuestionBank } from '../data/questionBanks';

const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 70" width="220" height="55" fill="none">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e40af" />
      <stop offset="50%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect x="6" y="8" width="54" height="54" rx="14" fill="url(#brandGrad)" />
  <path d="M18 30 L33 22 L48 30 L33 38 Z" fill="#ffffff" />
  <path d="M24 34.5 L24 43 C24 45.5 42 45.5 42 43 L42 34.5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
  <path d="M48 30 L48 41" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <circle cx="48" cy="42" r="2" fill="#ffffff" />
  <text x="72" y="38" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#0f172a" letter-spacing="-0.03em">
    Learn<tspan fill="#2563eb">Ready</tspan>
  </text>
  <text x="73" y="54" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="700" font-size="10.5" fill="#64748b" letter-spacing="0.22em">
    ASSESSMENT PRO
  </text>
</svg>
`;

export function printQuestionBooklet(
  subject: string,
  chapterOrChapters: ChapterQuestionBank['chapters'][0] | ChapterQuestionBank['chapters'],
  classLevel: string
) {
  const printWindow = window.open('', '_blank', 'width=920,height=850');
  if (!printWindow) {
    alert('Please allow popups to open and print the Question Bank PDF booklet.');
    return;
  }

  const chapters = Array.isArray(chapterOrChapters) ? chapterOrChapters : [chapterOrChapters];
  const isMultiple = chapters.length > 1;
  const bookletTitle = isMultiple
    ? `${subject}: Complete Subject Question Bank (${chapters.length} Chapters)`
    : `${subject}: ${chapters[0].title}`;

  // Build Questions HTML across chapters
  let globalQIndex = 1;
  const questionsSectionsHtml = chapters
    .map(chap => {
      const qHtml = chap.sampleQuestions
        .map(sq => {
          let optionsHtml = '';
          if (sq.options && sq.options.length > 0) {
            optionsHtml = `
              <div class="q-options-row">
                ${sq.options.map(opt => `<div class="opt-cell">${opt}</div>`).join('')}
              </div>
            `;
          }
          const item = `
            <div class="q-card">
              <div class="q-num-text">
                <span class="q-badge">Q${globalQIndex}</span>
                <span class="q-text">${sq.q}</span>
              </div>
              ${optionsHtml}
            </div>
          `;
          globalQIndex++;
          return item;
        })
        .join('');

      return `
        <div class="chapter-block">
          ${isMultiple ? `<div class="chap-divider-title">${chap.title} (${chap.difficulty})</div>` : ''}
          ${qHtml}
        </div>
      `;
    })
    .join('');

  // Build Answer Key HTML across chapters
  let globalAnsIndex = 1;
  const answerKeySectionsHtml = chapters
    .map(chap => {
      const aHtml = chap.sampleQuestions
        .map(sq => {
          const item = `
            <div class="sol-card">
              <div class="sol-header">
                <span class="sol-qbadge">Question ${globalAnsIndex}</span>
                <span class="sol-keybadge">Key: ${sq.answerKey}</span>
              </div>
              <div class="sol-body">
                <strong>Methodological Solution:</strong> ${sq.solutionNote}
              </div>
            </div>
          `;
          globalAnsIndex++;
          return item;
        })
        .join('');

      return `
        <div class="chapter-block">
          ${isMultiple ? `<div class="chap-divider-title" style="color: #047857; border-color: #86efac;">${chap.title}</div>` : ''}
          ${aHtml}
        </div>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LearnReady — ${subject} (Question Bank & Key)</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 16mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: left;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      line-height: 1.5;
      font-size: 13.5px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #0f172a;
      color: white;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .toolbar-title {
      font-weight: 700;
      font-size: 14px;
    }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 9px 20px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-secondary {
      background: #334155;
    }
    .btn:hover {
      opacity: 0.9;
    }
    .page-sheet {
      width: 100%;
      max-width: 840px;
      margin: 20px auto;
      background: white;
      padding: 34px 38px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2.5px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .logo-container {
      display: flex;
      align-items: center;
    }
    .header-info {
      text-align: right;
    }
    .header-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #2563eb;
      text-transform: uppercase;
      text-align: right;
    }
    .header-sub {
      font-size: 11.5px;
      color: #64748b;
      margin-top: 2px;
      text-align: right;
    }
    .booklet-title-box {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-left: 5px solid #2563eb;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .booklet-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }
    .booklet-meta {
      font-size: 12px;
      color: #475569;
      margin-top: 5px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .instruction-callout {
      font-size: 11.5px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 22px;
      line-height: 1.5;
    }
    .section-banner {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }
    .chap-divider-title {
      font-size: 13px;
      font-weight: 700;
      color: #2563eb;
      background: #eff6ff;
      padding: 6px 10px;
      border-left: 3px solid #2563eb;
      border-radius: 4px;
      margin-bottom: 14px;
      margin-top: 8px;
    }
    .q-card {
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid #f1f5f9;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .q-num-text {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }
    .q-badge {
      background: #0f172a;
      color: white;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .q-text {
      font-size: 13.5px;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.5;
    }
    .q-options-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 20px;
      padding-left: 36px;
      margin-top: 6px;
      font-size: 13px;
      color: #334155;
    }
    .opt-cell {
      white-space: nowrap;
      font-weight: 500;
    }
    .rough-workspace {
      height: 720px;
      border: 2px dashed #94a3b8;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
      background-size: 24px 24px;
      position: relative;
    }
    .rough-watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 38px;
      font-weight: 900;
      color: rgba(148, 163, 184, 0.15);
      letter-spacing: 0.15em;
      white-space: nowrap;
      pointer-events: none;
      text-transform: uppercase;
    }
    .rough-top-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      text-align: center;
    }
    .rough-bottom-label {
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
    }
    .sol-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 14px 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .sol-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
    }
    .sol-qbadge {
      font-weight: 800;
      font-size: 13px;
      color: #0f172a;
    }
    .sol-keybadge {
      background: #dcfce7;
      color: #15803d;
      font-weight: 800;
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 4px;
      border: 1px solid #86efac;
    }
    .sol-body {
      font-size: 12.5px;
      color: #334155;
      line-height: 1.55;
    }
    .page-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 10.5px;
      color: #94a3b8;
    }
    @media print {
      body {
        background: white !important;
      }
      .toolbar {
        display: none !important;
      }
      .page-sheet {
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
      }
      .page-break {
        page-break-before: always !important;
        break-before: page !important;
        height: 0;
      }
      .rough-workspace {
        height: 820px !important;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">${bookletTitle} — Booklet & Key</div>
    <div style="display: flex; gap: 10px;">
      <button class="btn" onclick="window.print()">
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
        Save as PDF / Print Booklet
      </button>
      <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    </div>
  </div>

  <!-- SECTION 1: QUESTIONS BOOKLET (Prominent Logo on Page 1) -->
  <div class="page-sheet">
    <div class="page-header">
      <div class="logo-container">${LOGO_SVG}</div>
      <div class="header-info">
        <div class="header-tag">QUESTION REPOSITORY BOOKLET</div>
        <div class="header-sub">National Diagnostic & Aptitude Assessment Battery</div>
      </div>
    </div>

    <div class="booklet-title-box">
      <div class="booklet-title">${bookletTitle}</div>
      <div class="booklet-meta">
        <span><strong>Class Level:</strong> ${classLevel}</span>
        <span><strong>Total Chapters:</strong> ${chapters.length}</span>
        <span><strong>Target Exam Year:</strong> 2026-27</span>
      </div>
    </div>

    <div class="instruction-callout">
      <strong>INSTRUCTIONS FOR CANDIDATES:</strong><br>
      1. All questions are standard diagnostic multiple choice items with options lined up in a row.<br>
      2. <strong>Rough Work Workspace:</strong> 3 dedicated rough work pages are provided immediately following the questions for calculations and working notes.<br>
      3. <strong>Answer Key & Solutions:</strong> The complete verified answer key and detailed step-by-step solutions are appended immediately after the 3 rough work pages.
    </div>

    <div class="section-banner">PART I — PRACTICE & DIAGNOSTIC QUESTIONS</div>
    <div class="questions-container">
      ${questionsSectionsHtml}
    </div>

    <div class="page-footer">
      <span>LearnReady Candidate Practice Booklet · Page 1</span>
      <span>Turn over for 3 Rough Work Pages</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 2: ROUGH WORK PAGE 1 OF 3 (Prominent Logo on Page 2) -->
  <div class="page-sheet">
    <div class="page-header">
      <div class="logo-container">${LOGO_SVG}</div>
      <div class="header-info">
        <div class="header-tag">SPACE FOR ROUGH WORK (PAGE 1 OF 3)</div>
        <div class="header-sub">${subject} — Candidate Workspace</div>
      </div>
    </div>

    <div class="rough-workspace">
      <div class="rough-top-label">WORKSPACE FOR CALCULATIONS, EQUATIONS & SCRATCH NOTES</div>
      <div class="rough-watermark">ROUGH WORK 1 / 3</div>
      <div class="rough-bottom-label">Do not write final answers in this space. All marks are scored on the response sheet.</div>
    </div>

    <div class="page-footer">
      <span>LearnReady Rough Workspace · Page 1 of 3</span>
      <span>${subject} · Chapter Repository</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3: ROUGH WORK PAGE 2 OF 3 (Prominent Logo on Page 3) -->
  <div class="page-sheet">
    <div class="page-header">
      <div class="logo-container">${LOGO_SVG}</div>
      <div class="header-info">
        <div class="header-tag">SPACE FOR ROUGH WORK (PAGE 2 OF 3)</div>
        <div class="header-sub">${subject} — Candidate Workspace</div>
      </div>
    </div>

    <div class="rough-workspace">
      <div class="rough-top-label">WORKSPACE FOR CALCULATIONS, EQUATIONS & SCRATCH NOTES</div>
      <div class="rough-watermark">ROUGH WORK 2 / 3</div>
      <div class="rough-bottom-label">Do not write final answers in this space. All marks are scored on the response sheet.</div>
    </div>

    <div class="page-footer">
      <span>LearnReady Rough Workspace · Page 2 of 3</span>
      <span>${subject} · Chapter Repository</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 4: ROUGH WORK PAGE 3 OF 3 (Prominent Logo on Page 4) -->
  <div class="page-sheet">
    <div class="page-header">
      <div class="logo-container">${LOGO_SVG}</div>
      <div class="header-info">
        <div class="header-tag">SPACE FOR ROUGH WORK (PAGE 3 OF 3)</div>
        <div class="header-sub">${subject} — Candidate Workspace</div>
      </div>
    </div>

    <div class="rough-workspace">
      <div class="rough-top-label">WORKSPACE FOR CALCULATIONS, EQUATIONS & SCRATCH NOTES</div>
      <div class="rough-watermark">ROUGH WORK 3 / 3</div>
      <div class="rough-bottom-label">End of Rough Workspace. Official Answer Key follows on the next page.</div>
    </div>

    <div class="page-footer">
      <span>LearnReady Rough Workspace · Page 3 of 3</span>
      <span>Answer Key Begins on Next Page</span>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 5: VERIFIED ANSWER KEY & SOLUTIONS (Prominent Logo on Page 5) -->
  <div class="page-sheet">
    <div class="page-header">
      <div class="logo-container">${LOGO_SVG}</div>
      <div class="header-info">
        <div class="header-tag" style="color: #059669;">OFFICIAL ANSWER KEY & STEP-BY-STEP SOLUTIONS</div>
        <div class="header-sub">${subject} — Verified Answer Repository</div>
      </div>
    </div>

    <div class="section-banner" style="color: #047857;">PART II — VERIFIED SOLUTIONS & METHODOLOGY</div>
    <div class="solutions-container">
      ${answerKeySectionsHtml}
    </div>

    <div class="page-footer">
      <span>Official LearnReady Answer Key · Verified Educational Standards</span>
      <span>End of Booklet</span>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
