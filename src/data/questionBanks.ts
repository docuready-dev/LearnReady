export interface ChapterQuestionBank {
  subject: string;
  classLevel: string;
  chapters: {
    id: string;
    title: string;
    questionCount: number;
    difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
    topics: string[];
    sampleQuestions: {
      q: string;
      answerKey: string;
      solutionNote: string;
    }[];
  }[];
}

export const QUESTION_BANKS_CATALOG: ChapterQuestionBank[] = [
  {
    subject: 'Mathematics',
    classLevel: 'Class 10 & 11',
    chapters: [
      {
        id: 'math-01',
        title: 'Quadratic Equations & Complex Numbers',
        questionCount: 45,
        difficulty: 'Advanced',
        topics: ['Nature of roots', 'Discriminant analysis', 'Modulus & argument', 'Transformation of equations'],
        sampleQuestions: [
          {
            q: 'If the roots of ax² + bx + c = 0 are in the ratio 2:3, find the relation between b² and ac.',
            answerKey: '25ac = 6b²',
            solutionNote: 'Let roots be 2k and 3k. Sum = 5k = -b/a, Product = 6k² = c/a. Substituting k gives 25ac = 6b².'
          },
          {
            q: 'Find the modulus and principal argument of z = -1 + i√3.',
            answerKey: '|z| = 2, arg(z) = 2π/3',
            solutionNote: '|z| = √((-1)² + (√3)²) = 2. Since x < 0, y > 0, θ is in the second quadrant: π - π/3 = 2π/3.'
          }
        ]
      },
      {
        id: 'math-02',
        title: 'Arithmetic Progressions & Sequences',
        questionCount: 40,
        difficulty: 'Intermediate',
        topics: ['nth term calculation', 'Sum of first n terms', 'Arithmetic mean insertion'],
        sampleQuestions: [
          {
            q: 'If the 7th term of an AP is 1/9 and the 9th term is 1/7, find its 63rd term.',
            answerKey: 'T₆₃ = 1',
            solutionNote: 'a + 6d = 1/9 and a + 8d = 1/7. Solving yields d = 1/63 and a = 1/63. T₆₃ = a + 62d = 63/63 = 1.'
          }
        ]
      },
      {
        id: 'math-03',
        title: 'Trigonometry & Coordinate Geometry',
        questionCount: 50,
        difficulty: 'Advanced',
        topics: ['Trigonometric identities', 'Section formula', 'Area of polygons', 'Straight line equations'],
        sampleQuestions: [
          {
            q: 'Prove that (sin A + cosec A)² + (cos A + sec A)² = 7 + tan² A + cot² A.',
            answerKey: 'Proved (Value equals 7 + tan² A + cot² A)',
            solutionNote: 'Expand both binomials: sin²A + cosec²A + 2 + cos²A + sec²A + 2 = (sin²A + cos²A) + 4 + (1 + cot²A) + (1 + tan²A) = 7 + tan²A + cot²A.'
          }
        ]
      }
    ]
  },
  {
    subject: 'Physics',
    classLevel: 'Class 10 & 11',
    chapters: [
      {
        id: 'phy-01',
        title: 'Kinematics & Laws of Motion',
        questionCount: 42,
        difficulty: 'Advanced',
        topics: ['Uniform acceleration', 'Friction coefficients', 'Impulse & momentum conservation'],
        sampleQuestions: [
          {
            q: 'A ball is projected vertically upward with 20 m/s from a 25 m tall tower. Find its speed upon hitting the ground (g = 10 m/s²).',
            answerKey: 'v = 30 m/s',
            solutionNote: 'Using v² = u² + 2gh: v² = 20² + 2(10)(25) = 400 + 500 = 900 => v = 30 m/s.'
          }
        ]
      },
      {
        id: 'phy-02',
        title: 'Electricity & Magnetic Effects',
        questionCount: 38,
        difficulty: 'Intermediate',
        topics: ['Ohm law & resistivity', 'Parallel & series network equivalent resistance', 'Right-hand thumb rule'],
        sampleQuestions: [
          {
            q: 'Three resistors of 6Ω each are connected to give an equivalent resistance of 9Ω. Describe the combination.',
            answerKey: 'Two in parallel connected in series with the third.',
            solutionNote: 'Two 6Ω in parallel = (6 × 6)/(6 + 6) = 3Ω. Adding third 6Ω in series = 3 + 6 = 9Ω.'
          }
        ]
      }
    ]
  },
  {
    subject: 'Chemistry',
    classLevel: 'Class 10 & 11',
    chapters: [
      {
        id: 'chem-01',
        title: 'Chemical Reactions & Stoichiometry',
        questionCount: 35,
        difficulty: 'Intermediate',
        topics: ['Balancing redox reactions', 'Limiting reagent calculation', 'Precipitation reactions'],
        sampleQuestions: [
          {
            q: 'How many moles of CO₂ are produced when 44g of propane (C₃H₈) is completely combusted in oxygen?',
            answerKey: '3 moles of CO₂ (132 grams)',
            solutionNote: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O. 44g of C₃H₈ corresponds to exactly 1 mole. Hence 3 moles of CO₂ are produced.'
          }
        ]
      },
      {
        id: 'chem-02',
        title: 'Carbon Compounds & Periodic Classification',
        questionCount: 40,
        difficulty: 'Advanced',
        topics: ['IUPAC nomenclature', 'Electronegativity trends', 'Isomerism & functional groups'],
        sampleQuestions: [
          {
            q: 'Write the IUPAC name and structure for CH₃-CH(CH₃)-CH₂-CHO.',
            answerKey: '3-Methylbutanal',
            solutionNote: 'Longest carbon chain with aldehyde carbonyl carbon as C-1 has 4 carbons (butanal) with a methyl branch at C-3.'
          }
        ]
      }
    ]
  },
  {
    subject: 'Biology',
    classLevel: 'Class 10 & 11',
    chapters: [
      {
        id: 'bio-01',
        title: 'Life Processes & Cellular Respiration',
        questionCount: 36,
        difficulty: 'Intermediate',
        topics: ['Aerobic vs anaerobic pathways', 'Nephron filtration mechanics', 'Double circulation in humans'],
        sampleQuestions: [
          {
            q: 'State the exact location where glycolysis takes place and its end products.',
            answerKey: 'Cytoplasm; 2 molecules of Pyruvate, 2 ATP, and 2 NADH',
            solutionNote: 'Glycolysis occurs in the cytoplasm independently of oxygen, converting one 6-carbon glucose into two 3-carbon pyruvates.'
          }
        ]
      }
    ]
  },
  {
    subject: 'Commerce & Economics',
    classLevel: 'Class 11 & 12',
    chapters: [
      {
        id: 'comm-01',
        title: 'National Income Accounting & Demand Elasticity',
        questionCount: 30,
        difficulty: 'Intermediate',
        topics: ['GDP deflator', 'Price elasticity calculation', 'Double counting prevention'],
        sampleQuestions: [
          {
            q: 'When price rises from ₹10 to ₹12, quantity demanded falls from 100 to 80 units. Compute price elasticity of demand.',
            answerKey: 'Ed = -1.0 (Unitary Elastic)',
            solutionNote: '%ΔQ = -20/100 = -20%. %ΔP = +2/10 = +20%. Ed = -20% / 20% = -1.0.'
          }
        ]
      }
    ]
  }
];
