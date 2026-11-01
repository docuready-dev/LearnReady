const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = 'C:\\Users\\Ashley\\.gemini\\antigravity\\scratch\\learnready-assessment';
const BASE_URL = 'http://localhost:5173';

const SAMPLE_ADMIN_RESULTS = [
  {
    id: 'RES-2024-001',
    candidateId: 'LR-CBSE-10492',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@example.com',
    age: '16',
    board: 'CBSE',
    region: 'West India',
    educationLevel: 'Class 10 (Current)',
    totalScore: 92,
    verbalScore: 95,
    numericalScore: 90,
    spatialScore: 91,
    profile: 'Analytical',
    percentile: 98.4,
    nationalRank: 41,
    dateTaken: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'RES-2024-002',
    candidateId: 'LR-ICSE-20914',
    name: 'Kabir Sen',
    email: 'kabir.sen@example.com',
    age: '17',
    board: 'ICSE',
    region: 'East India',
    educationLevel: 'Class 11',
    totalScore: 88,
    verbalScore: 88,
    numericalScore: 92,
    spatialScore: 84,
    profile: 'Analytical',
    percentile: 94.2,
    nationalRank: 145,
    dateTaken: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'RES-2024-003',
    candidateId: 'LR-MH-33819',
    name: 'Tanvi Joshi',
    email: 'tanvi.j@example.com',
    age: '16',
    board: 'STATE_MH',
    region: 'West India',
    educationLevel: 'Class 10 (Current)',
    totalScore: 84,
    verbalScore: 80,
    numericalScore: 86,
    spatialScore: 86,
    profile: 'Creative',
    percentile: 89.1,
    nationalRank: 272,
    dateTaken: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'RES-2024-004',
    candidateId: 'LR-DL-49201',
    name: 'Aryan Malhotra',
    email: 'aryan.m@example.com',
    age: '17',
    board: 'STATE_DL',
    region: 'North India',
    educationLevel: 'Class 12',
    totalScore: 78,
    verbalScore: 82,
    numericalScore: 74,
    spatialScore: 78,
    profile: 'Operational',
    percentile: 79.5,
    nationalRank: 512,
    dateTaken: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'RES-2024-005',
    candidateId: 'LR-TN-58291',
    name: 'Divya Sundaram',
    email: 'divya.s@example.com',
    age: '16',
    board: 'STATE_TN',
    region: 'South India',
    educationLevel: 'Class 10 (Current)',
    totalScore: 94,
    verbalScore: 92,
    numericalScore: 96,
    spatialScore: 94,
    profile: 'Analytical',
    percentile: 99.1,
    nationalRank: 22,
    dateTaken: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'RES-2024-006',
    candidateId: 'LR-IB-67104',
    name: 'Rohan Mehta',
    email: 'rohan.m@example.com',
    age: '18',
    board: 'IB',
    region: 'North India',
    educationLevel: 'Class 12',
    totalScore: 86,
    verbalScore: 90,
    numericalScore: 82,
    spatialScore: 86,
    profile: 'Creative',
    percentile: 91.8,
    nationalRank: 205,
    dateTaken: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'RES-2024-007',
    candidateId: 'LR-WB-71932',
    name: 'Priyanka Mukherjee',
    email: 'priyanka.m@example.com',
    age: '16',
    board: 'STATE_WB',
    region: 'East India',
    educationLevel: 'Class 10 (Current)',
    totalScore: 82,
    verbalScore: 85,
    numericalScore: 80,
    spatialScore: 81,
    profile: 'Operational',
    percentile: 85.3,
    nationalRank: 367,
    dateTaken: new Date(Date.now() - 3600000 * 60).toISOString(),
  }
];

const MOCK_EXAM_STATE = {
  candidateId: 'LR-CBSE-99412',
  email: 'rahul.sharma@example.com',
  name: 'Rahul Sharma',
  age: '16',
  region: 'North India',
  educationLevel: 'Class 10 (Current)',
  board: 'CBSE',
  testMode: 'full',
  startTime: Date.now() - 1800000,
  currentSection: 0,
  currentQuestion: 0,
  answers: {
    'v1': 'B',
    'v2': 'C'
  },
  submittedSections: [false, false, false, false],
  completed: false,
  questionIds: {
    verbal: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19', 'v20'],
    numerical: ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11', 'n12', 'n13', 'n14', 'n15'],
    spatial: ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15'],
    personality: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12', 'p13', 'p14', 'p15']
  }
};

const COMPLETED_EXAM_STATE = {
  ...MOCK_EXAM_STATE,
  completed: true,
  submittedSections: [true, true, true, true],
  answers: {
    'v1': 'B', 'v2': 'C', 'v3': 'C', 'v4': 'B', 'v5': 'B', 'v6': 'B', 'v7': 'C', 'v8': 'A', 'v9': 'B', 'v10': 'B',
    'v11': 'C', 'v12': 'C', 'v13': 'B', 'v14': 'A', 'v15': 'B', 'v16': 'C', 'v17': 'A', 'v18': 'B', 'v19': 'C', 'v20': 'A',
    'n1': 'B', 'n2': 'A', 'n3': 'B', 'n4': 'B', 'n5': 'A', 'n6': 'B', 'n7': 'A', 'n8': 'C', 'n9': 'B', 'n10': 'A',
    'n11': 'B', 'n12': 'C', 'n13': 'A', 'n14': 'B', 'n15': 'C',
    's1': 'C', 's2': 'B', 's3': 'A', 's4': 'C', 's5': 'B', 's6': 'B', 's7': 'A', 's8': 'B', 's9': 'C', 's10': 'B',
    's11': 'A', 's12': 'B', 's13': 'B', 's14': 'A', 's15': 'C',
    'p1': 5, 'p2': 5, 'p3': 4, 'p4': 5, 'p5': 4, 'p6': 5, 'p7': 3, 'p8': 2, 'p9': 2, 'p10': 3, 'p11': 4, 'p12': 2, 'p13': 3, 'p14': 2, 'p15': 3
  }
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2
    }
  });

  const page = await browser.newPage();

  async function takeScreenshot(filename, options = {}) {
    const fullPath = path.join(ROOT_DIR, filename);
    await sleep(600);
    await page.screenshot({ path: fullPath, ...options });
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // ==========================================
    // 1. LANDING PAGE - INITIAL
    // ==========================================
    console.log('Capturing Landing Page (Fresh)...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await takeScreenshot('screenshot-01-landing-page.png');

    // ==========================================
    // 2. LANDING PAGE - FILLED & QUICK MODE
    // ==========================================
    console.log('Capturing Landing Page (Filled Details)...');
    await page.evaluate(() => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify({
        candidateId: 'LR2024-9982',
        email: 'rahul.sharma@example.com',
        name: 'Rahul Sharma',
        age: '16',
        region: 'North India',
        educationLevel: 'Class 10 (Current)',
        board: 'CBSE',
        testMode: 'quick',
        startTime: 0,
        currentSection: 0,
        currentQuestion: 0,
        answers: {},
        submittedSections: [false, false, false, false],
        completed: false,
        questionIds: { verbal: [], numerical: [], spatial: [], personality: [] }
      }));
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(500);
    await takeScreenshot('screenshot-02-landing-page-filled.png');

    // ==========================================
    // 3. EXAM PAGE - SECTION 1 (VERBAL REASONING)
    // ==========================================
    console.log('Capturing Exam - Verbal Reasoning...');
    await page.evaluate((mockState) => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify({
        ...mockState,
        currentSection: 0,
        currentQuestion: 0,
        startTime: Date.now() - 300000
      }));
    }, MOCK_EXAM_STATE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(600);
    await takeScreenshot('screenshot-03-exam-verbal-reasoning.png');

    // ==========================================
    // 4. EXAM PAGE - SECTION 2 (NUMERICAL REASONING)
    // ==========================================
    console.log('Capturing Exam - Numerical Reasoning...');
    await page.evaluate((mockState) => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify({
        ...mockState,
        currentSection: 1,
        currentQuestion: 0,
        startTime: Date.now() - 900000
      }));
    }, MOCK_EXAM_STATE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(600);
    await takeScreenshot('screenshot-04-exam-numerical-reasoning.png');

    // ==========================================
    // 5. EXAM PAGE - SECTION 3 (SPATIAL REASONING)
    // ==========================================
    console.log('Capturing Exam - Spatial Reasoning...');
    await page.evaluate((mockState) => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify({
        ...mockState,
        currentSection: 2,
        currentQuestion: 0,
        startTime: Date.now() - 1500000
      }));
    }, MOCK_EXAM_STATE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(600);
    await takeScreenshot('screenshot-05-exam-spatial-reasoning.png');

    // ==========================================
    // 6. EXAM PAGE - SECTION 4 (OCCUPATIONAL INTERESTS RIASEC)
    // ==========================================
    console.log('Capturing Exam - RIASEC Interests...');
    await page.evaluate((mockState) => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify({
        ...mockState,
        currentSection: 3,
        currentQuestion: 0,
        startTime: Date.now() - 2100000
      }));
    }, MOCK_EXAM_STATE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(600);
    await takeScreenshot('screenshot-06-exam-occupational-interests.png');

    // ==========================================
    // 7. EXAM PAGE - SUBMIT CONFIRMATION MODAL
    // ==========================================
    console.log('Capturing Exam - Submit Modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && (b.textContent.includes('Submit Section') || b.textContent.includes('Complete Assessment')));
      if (btn) btn.click();
    });
    await sleep(600);
    await takeScreenshot('screenshot-07-exam-submit-dialog.png');

    // ==========================================
    // 8. RESULTS PAGE - TOP FOLD (COMPOSITE & STREAMS)
    // ==========================================
    console.log('Capturing Results - Top Fold (Rank & Streams)...');
    await page.evaluate((completedState) => {
      localStorage.setItem('learnready_exam_v1', JSON.stringify(completedState));
    }, COMPLETED_EXAM_STATE);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await sleep(1000);
    await takeScreenshot('screenshot-08-results-top-stream-recommendations.png');

    // ==========================================
    // 9. RESULTS PAGE - RADAR & DOMAINS
    // ==========================================
    console.log('Capturing Results - Radar & Domain Breakdown...');
    await page.evaluate(() => {
      window.scrollTo({ top: 480, behavior: 'instant' });
    });
    await sleep(800);
    await takeScreenshot('screenshot-09-results-radar-and-domains.png');

    // ==========================================
    // 10. RESULTS PAGE - BELL CURVE & LEADERBOARD
    // ==========================================
    console.log('Capturing Results - Bell Curve & Leaderboard...');
    await page.evaluate(() => {
      window.scrollTo({ top: 1100, behavior: 'instant' });
    });
    await sleep(800);
    await takeScreenshot('screenshot-10-results-bellcurve-and-leaderboard.png');

    // ==========================================
    // 11. RESULTS PAGE - FULL VERTICAL REPORT
    // ==========================================
    console.log('Capturing Results - Full Page Report...');
    await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await sleep(500);
    await takeScreenshot('screenshot-11-results-full-report.png', { fullPage: true });

    // ==========================================
    // 12. ADMIN PORTAL - LOGIN SCREEN
    // ==========================================
    console.log('Capturing Admin Portal - Login...');
    await page.evaluate(() => {
      localStorage.removeItem('learnready_auth_session');
      localStorage.removeItem('learnready_exam_v1');
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent && b.textContent.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await sleep(600);
    await takeScreenshot('screenshot-12-admin-login.png');

    // ==========================================
    // 13. ADMIN PORTAL - ACCESS DENIED
    // ==========================================
    console.log('Capturing Admin Portal - Access Denied...');
    await page.evaluate(() => {
      localStorage.setItem('learnready_auth_session', JSON.stringify({
        email: 'unauthorized_student@school.edu',
        name: 'unauthorized_student',
        role: 'candidate'
      }));
    });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent && b.textContent.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await sleep(600);
    await takeScreenshot('screenshot-13-admin-access-denied.png');

    // ==========================================
    // 14. ADMIN PORTAL - DASHBOARD
    // ==========================================
    console.log('Capturing Admin Portal - National Results Dashboard...');
    await page.evaluate((adminResults) => {
      localStorage.setItem('learnready_auth_session', JSON.stringify({
        email: 'ashleyghose64@gmail.com',
        name: 'Super Admin',
        role: 'admin'
      }));
      localStorage.setItem('learnready_exam_results_v1', JSON.stringify(adminResults));
    }, SAMPLE_ADMIN_RESULTS);
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent && b.textContent.includes('Admin'));
      if (adminBtn) adminBtn.click();
    });
    await sleep(1000);
    await takeScreenshot('screenshot-14-admin-dashboard.png');

    // ==========================================
    // 15. ADMIN PORTAL - SEARCH & FILTER APPLIED
    // ==========================================
    console.log('Capturing Admin Portal - Filtered Search View...');
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Ananya', { delay: 50 });
      await sleep(600);
    }
    await takeScreenshot('screenshot-15-admin-dashboard-filtered.png');

    console.log('\nAll 15 screenshots captured and saved successfully into the project root!');
  } catch (err) {
    console.error('Error during screenshot generation:', err);
  } finally {
    await browser.close();
  }
}

run();
