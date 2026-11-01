<div align="center">

# LearnReady Assessment Pro
### Enterprise Cognitive Diagnostic Battery & Academic Stream Orientation Engine

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Radix UI](https://img.shields.io/badge/Radix_UI-Primitive-161618?style=for-the-badge&logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22c55e?style=for-the-badge)](https://recharts.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<br/>

**A nationally benchmarked cognitive aptitude and career orientation platform engineered for Class 9–12 Indian students across CBSE, ICSE, State Boards, IB, and Cambridge curriculums.**

[Live Demo](#quick-start) • [Architecture](#-system-architecture) • [Psychometric Model](#-psychometric--scoring-methodology) • [Feature Showcase](#-feature-showcase) • [Deployment](#-deployment)

---

</div>

## Executive Overview

In secondary education across India, selecting an academic stream (Science PCM, Science PCB, Commerce, or Humanities) after Class 10 is one of the highest-stakes decisions a student faces. Traditional decisions are frequently swayed by peer pressure, societal expectations, or subjective intuition.

**LearnReady Assessment Pro** provides an objective, psychometrically rigorous, and standardized diagnostic assessment that maps:
1. **Cognitive Reasoning Capabilities**: Domain-specific proficiencies across Verbal, Numerical, and Spatial reasoning.
2. **Occupational Interest Vectors**: Holland RIASEC personality profiling (Realistic, Investigative, Artistic, Social, Enterprising, Conventional).
3. **National Normative Benchmarks**: Candidate placement against a national Gaussian distribution model ($\mu = 50, \sigma = 15$) calibrated with 2,500+ Indian board cohorts.
4. **Algorithmic Stream Compatibility**: Deterministic multi-factor recommendations pairing aptitude strength with genuine interest affinity.
5. **Authenticated Candidate Profiles**: Persistent user accounts tracking longitudinal assessments, previous reports, and school registrations.

---

## Key Capabilities

### 1. Four-Tier Cognitive Diagnostic Battery
- **Verbal Reasoning**: Reading comprehension, analogical logic, grammar nuances, and academic vocabulary.
- **Numerical Reasoning**: Arithmetic progressions, algebra, percentages, ratio-proportion, and data interpretation.
- **Spatial Reasoning**: 3D cube rotations, net pattern folding, geometrical sequences, and symmetry analysis.
- **Holland RIASEC Interest Profile**: 5-point Likert psychometric scale assessing occupational tendencies across 6 vocational typologies.

### 2. Adaptive Session Randomization
- Powered by a deterministic Fisher-Yates shuffle engine with question seed constraints.
- Every candidate receives a uniquely ordered subset selected from a 140+ item bank.
- Supports **Full Assessment Mode** (90 minutes / 65 questions) and **Quick Diagnostic Mode** (30 minutes / 30 questions).

### 3. Normative Gaussian Distribution & Percentiles
- Real-time Z-score mapping calculating exact national percentiles.
- Dynamic Bell Curve visualization pinpointing candidate standing against simulated All-India cohorts.
- Hexagonal Radar Charts juxtaposing cognitive balance against occupational orientation.

### 4. Stream & Career Recommendation Engine
- Synthesizes cognitive domain percentiles with RIASEC top traits.
- Provides Rank 1 (Primary Match), Rank 2 (Viable Alternative), and Rank 3 (Exploratory Path) academic streams.
- Breaks down specific Class 11–12 subject combinations (e.g., PCM with Computer Science vs Economics, Commerce with Applied Mathematics).

### 5. Candidate Authentication & Registration Portal
- Dedicated Sign In & Sign Up flows for students and educators.
- Auto-fills candidate credentials, grade, educational board, and school affiliation into diagnostic sessions.
- Role-aware authorization with Super Admin routing.

### 6. Super Admin Operations & Analytics Suite
- Role-based security gate protecting national performance datasets.
- Board-wise aggregate performance comparative charts (CBSE vs ICSE vs State Boards vs IB).
- Full candidate search, board filtering, record deletion with confirmation, and one-click bidirectional CSV export.

### 7. Publication-Quality PDF Report Generation
- Pure CSS `@media print` layout engine.
- Instant single-click download generating multi-page diagnostic reports with institutional branding, domain scorecards, and itemized solution reviews.

```

## Application Views & User Journey

| Screen / View | Primary Purpose & Functional Highlights |
|---|---|
| **Assessment Launchpad** | Candidate profile intake, Indian board selection (CBSE, ICSE, State Boards, IB), and test duration selection (Full 90-min vs Quick 30-min). |
| **Candidate Auth Portal** | Dual-tab Sign In & Registration system supporting student self-registration and Super Admin instant login. |
| **Verbal Reasoning Battery** | Reading comprehension passages, verbal analogies, grammatical precision, and vocabulary logic with real-time countdown timer. |
| **Numerical Reasoning Battery** | Arithmetic progressions, algebra, data interpretation, percentages, and scratchpad calculations. |
| **Spatial Reasoning Battery** | 2D/3D net folding, symmetrical pattern rotations, and spatial orientation challenges. |
| **Occupational RIASEC Battery** | 5-point Likert psychometric scale measuring vocational interest across 6 Holland dimensions. |
| **Diagnostic Results Hub** | All-India percentile rank, domain radar charts, Gaussian bell curve placement, and deterministic Class 11–12 stream matching. |
| **Printable Report Engine** | Pure CSS `@media print` formatted multi-page diagnostic dossier with detailed question-by-question solution breakdowns. |
| **Super Admin Operations Suite** | Protected management portal featuring aggregate board comparison charts, candidate search/filter table, and one-click CSV export. |

```

## System Architecture

```
mermaid
flowchart TD
    subgraph UI ["User Interface Layer (React 18 + Tailwind)"]
        LP[LandingPage]
        EP[ExamPage]
        RP[ResultsPage]
        LIP[LoginPage]
        AP[AdminPage]
    end

    subgraph State ["State & Context Management"]
        EC[ExamContext / useExamState]
        AC[AuthContext]
    end

    subgraph Core ["Psychometric & Domain Engines"]
        QBank[(Question Bank 140+ Items)]
        RandEngine[Randomizer & Fisher-Yates Engine]
        ScoreEngine[Scoring & RIASEC Matrix Engine]
        NormEngine[Normative Gaussian Benchmark Engine]
        StreamEngine[Stream Matching Heuristic Engine]
    end

    subgraph Storage ["Persistence Layer"]
        SS[StorageService / LocalStorage]
        CSV[CSV Export Engine]
    end

    LIP -->|Authenticate / Register| AC
    AC -->|Prefill Profile| LP
    LP -->|Configure Candidate| EC
    EC -->|Seed Mode & Duration| RandEngine
    RandEngine -->|Sample Subset| QBank
    RandEngine -->|Deliver Unique Test| EP
    EP -->|Store Responses| EC
    EC -->|Calculate Scores| ScoreEngine
    ScoreEngine --> NormEngine
    ScoreEngine --> StreamEngine
    NormEngine --> RP
    StreamEngine --> RP
    RP -->|Persist Result| SS
    AC -->|Gatekeeper Check| AP
    AP -->|Fetch Results| SS
    SS --> CSV
```
```
        StreamEngine[Stream Matching Heuristic Engine]
    end

    subgraph Storage ["Persistence Layer"]
        SS[StorageService / LocalStorage]
        CSV[CSV Export Engine]
    end

    LP -->|Configure Candidate| EC
    EC -->|Seed Mode & Duration| RandEngine
    RandEngine -->|Sample Subset| QBank
    RandEngine -->|Deliver Unique Test| EP
    EP -->|Store Responses| EC
    EC -->|Calculate Scores| ScoreEngine
    ScoreEngine --> NormEngine
    ScoreEngine --> StreamEngine
    NormEngine --> RP
    StreamEngine --> RP
    RP -->|Auto-Link Dossier| ENP
    ENP -->|Save Booking| SS
    RP -->|Persist Result| SS
    AC -->|Gatekeeper Check| AP
    AP -->|Fetch Results & Bookings| SS
    SS --> CSV
    
```

## Psychometric & Scoring Methodology

```
### 1. Domain Accuracy Percentage
For each cognitive domain $d \in \{\text{verbal}, \text{numerical}, \text{spatial}\}$:

$$S_d = \left( \frac{\sum_{i=1}^{N_d} \mathbb{I}(a_i = c_i)}{N_d} \right) \times 100$$

Where $N_d$ is the number of administered items in domain $d$, $a_i$ is the candidate's chosen option, and $c_i$ is the keyed correct option.

### 2. Composite Aptitude Score
Weighted normalized composite aggregating the three cognitive components:

$$S_{\text{composite}} = w_v S_{\text{verbal}} + w_n S_{\text{numerical}} + w_s S_{\text{spatial}}$$

*(Default equal weighting $w_v = w_n = w_s = \frac{1}{3}$)*

### 3. Normative Z-Score & Gaussian Percentile
Against the national calibration cohort ($\mu = 50, \sigma = 15$):

$$Z = \frac{S_{\text{composite}} - \mu}{\sigma}$$

Percentile rank $P$ is computed via standard normal cumulative distribution approximation:

$$P = \Phi(Z) = \frac{1}{2} \left[ 1 + \text{erf}\left(\frac{Z}{\sqrt{2}}\right) \right] \times 100$$

### 4. Holland RIASEC Orientation Index
For RIASEC traits $t \in \{R, I, A, S, E, C\}$, responses $r_j \in \{1, 2, 3, 4, 5\}$ on the 5-point Likert scale are normalized:

$$\text{RIASEC}_t = \left( \frac{\sum_{j=1}^{M_t} (r_j - 1)}{4 \cdot M_t} \right) \times 100$$

Candidates are classified into high-level archetypes:
- **Analytical**: Dominance in Investigative ($I$) and Realistic ($R$) traits with high Numerical reasoning.
- **Creative**: Dominance in Artistic ($A$) and Investigative ($I$) traits with high Spatial reasoning.
- **Operational / Enterprise**: Dominance in Enterprising ($E$), Conventional ($C$), and Social ($S$) traits with high Verbal reasoning.

```

## Repository Directory Layout

```
learnready-assessment/
├── public/
│   ├── favicon.svg             # Institutional SVG favicon
│   └── logo.svg                # Vector brand identity logo
├── src/
│   ├── App.tsx                 # Root application controller & route dispatcher
│   ├── index.css               # Global Tailwind CSS directives & @media print styles
│   ├── main.tsx                # React DOM root entry point
│   ├── types.ts                # Strict TypeScript domain interfaces & data types
│   ├── api/
│   │   └── results.ts          # Backend API bridge for storing/fetching results
│   ├── components/
│   │   ├── BellCurveChart.tsx  # Dynamic Gaussian normal distribution curve component
│   │   ├── Leaderboard.tsx     # All-India top rankers leaderboard component
│   │   ├── PrintReport.tsx     # Multi-page printable diagnostic dossier
│   │   ├── QuestionCard.tsx    # Accessible multiple-choice & Likert question card
│   │   ├── StreamSection.tsx   # Recommended academic stream card view
│   │   ├── Timer.tsx           # High-visibility countdown timer with audio-visual alerts
│   │   └── ui/                 # Radix UI + Tailwind design system components
│   ├── context/
│   │   ├── AuthContext.tsx     # Role-based authentication context (Super Admin gate)
│   │   └── ExamContext.tsx     # Global examination state provider
│   ├── data/
│   │   ├── benchmark.ts        # 2,500+ student national normative calibration data
│   │   ├── boards.ts           # Indian educational boards registry (CBSE, ICSE, etc.)
│   │   ├── questions.ts        # 140+ verified diagnostic items with solutions
│   │   └── randomizer.ts       # Fisher-Yates randomization algorithm
│   ├── hooks/
│   │   ├── useExamState.ts     # Examination session lifecycle hook with autosave
│   │   └── use-toast.ts        # Toast notifications dispatcher hook
│   ├── pages/
│   │   ├── AdminPage.tsx       # Super Admin portal: telemetry, board analytics & data export
│   │   ├── ExamPage.tsx        # Timed test interface with section switching
│   │   ├── LandingPage.tsx     # Candidate registration & mode selector
│   │   ├── LoginPage.tsx       # Student & Educator Sign In & Registration portal
│   │   └── ResultsPage.tsx     # Comprehensive diagnostic report & stream recommendations
│   ├── services/
│   │   └── storageService.ts   # Local persistence, schema versioning & CSV export
│   └── utils/
│       └── scoring.ts          # Scoring formulas, RIASEC profiling & stream matcher
├── scripts/
│   └── capture.cjs             # Puppeteer script generating UI screenshots
├── index.html                  # HTML5 shell with meta tags & Google Fonts
├── package.json                # Project dependencies and operational scripts
├── tailwind.config.ts          # Design token definitions, theme extensions & colors
├── tsconfig.json               # TypeScript compiler configuration
└── vite.config.ts              # Vite bundling pipeline configuration

```



## Technology Stack & Dependencies

```
| Layer | Technology | Purpose |
|---|---|---|
| **Runtime & Framework** | React 18.3.1 | Component architecture & concurrent rendering |
| **Language** | TypeScript 5.5 | End-to-end static type safety & maintainability |
| **Bundler & Tooling** | Vite 5.4 | Sub-second HMR and optimized production trees |
| **Styling & Theme** | Tailwind CSS 3.4 | Utility-first CSS with CSS custom property theming |
| **Component Primitives** | Radix UI Primitive Suite | Accessible dialogs, selects, alerts, progress bars |
| **Data Visualization** | Recharts 2.12 | Interactive Radar charts, Bell curves & Bar charts |
| **Iconography** | Lucide React | High-legibility modern vector iconography |
| **Toasts & Feedback** | Sonner | Smooth, non-blocking asynchronous user notifications |
| **Headless Testing** | Puppeteer Core | Headless browser automation for UI verification |

```

## Quick Start & Installation

```
### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or pnpm / yarn)
- **Google Chrome**: (Optional, only required if executing automated headless screenshot scripts)

### 1. Clone the Repository
```bash
git clone https://github.com/docuready-dev/LearnReady.git
cd LearnReady
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```
The application will be live at `http://localhost:5173/`.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🔑 Administrative Access

To access the **National Results & Mentorship Admin Dashboard**:
1. Navigate to the top navigation header and click **Admin** (or visit `/admin`).
2. Authenticate using the configured Super Admin master key:
   - **Default Admin Account**: `ashleyghose64@gmail.com`
   - *Quick Login*: Click **"Login as Super Admin"** for instant simulated token authorization.
3. Access real-time student submissions, board score charts, mentorship bookings, and one-click CSV report exports.

---

## Security & Data Privacy

- **Zero Cloud Leakage by Default**: Sensitive candidate assessment data and contact details reside strictly within sandboxed client storage (`StorageService`), requiring zero external backend database setup to operate out of the box.
- **Idempotent Session Resumption**: Examination progress is continuously synchronized to `localStorage` under `learnready_exam_v1`, preventing accidental loss from page refreshes, tab closures, or network drops.
- **Role-Based Protection**: Administrative controls (record deletion, national cohort analytics, CSV exports) are strictly gated behind email-verified admin credentials.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for detailed terms and conditions.

---

<div align="center">
  <sub>Engineered with precision for Indian Education. LearnReady Assessment Pro © 2025–2026. All rights reserved.</sub>
</div>
