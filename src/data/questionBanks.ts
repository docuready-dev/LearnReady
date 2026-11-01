export interface ChapterQuestion {
  q: string;
  options?: string[];
  answerKey: string;
  solutionNote: string;
}

export interface ChapterQuestionBank {
  subject: string;
  classLevel: string;
  chapters: {
    id: string;
    title: string;
    questionCount: number;
    difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
    topics: string[];
    sampleQuestions: ChapterQuestion[];
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
            options: ['(A) 25ac = 6b²', '(B) 6ac = 25b²', '(C) 5ac = 6b²', '(D) 12ac = 5b²'],
            answerKey: '(A) 25ac = 6b²',
            solutionNote: 'Let roots be 2k and 3k. Sum = 5k = -b/a => k = -b/(5a). Product = 6k² = c/a => 6(-b/5a)² = c/a => 6b²/(25a²) = c/a => 25ac = 6b².'
          },
          {
            q: 'Find the modulus and principal argument of the complex number z = -1 + i√3.',
            options: ['(A) |z| = 2, arg(z) = 2π/3', '(B) |z| = 2, arg(z) = π/3', '(C) |z| = 4, arg(z) = 5π/6', '(D) |z| = 1, arg(z) = 3π/4'],
            answerKey: '(A) |z| = 2, arg(z) = 2π/3',
            solutionNote: '|z| = √((-1)² + (√3)²) = √(1 + 3) = 2. Since Re(z) < 0 and Im(z) > 0, z is in Quadrant II: θ = π - tan⁻¹(√3) = π - π/3 = 2π/3.'
          },
          {
            q: 'If one root of x² - 8x + k = 0 is three times the other root, determine the value of k.',
            options: ['(A) 8', '(B) 12', '(C) 16', '(D) 20'],
            answerKey: '(B) 12',
            solutionNote: 'Let the roots be r and 3r. Sum of roots: 4r = 8 => r = 2. Roots are 2 and 6. Product of roots: k = 2 × 6 = 12.'
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
            options: ['(A) 0', '(B) 1', '(C) 1/63', '(D) 63'],
            answerKey: '(B) 1',
            solutionNote: 'a + 6d = 1/9 and a + 8d = 1/7. Subtracting gives 2d = 2/63 => d = 1/63, a = 1/63. Hence T₆₃ = a + 62d = 63/63 = 1.'
          },
          {
            q: 'The sum of the first n terms of an AP is Sₙ = 3n² + 5n. Which term of this AP is equal to 164?',
            options: ['(A) 25th term', '(B) 27th term', '(C) 28th term', '(D) 30th term'],
            answerKey: '(B) 27th term',
            solutionNote: 'Tₙ = Sₙ - Sₙ₋₁ = (3n² + 5n) - [3(n-1)² + 5(n-1)] = 6n + 2. Setting 6n + 2 = 164 => 6n = 162 => n = 27.'
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
            q: 'Simplify: (sin A + cosec A)² + (cos A + sec A)² - (tan² A + cot² A).',
            options: ['(A) 5', '(B) 7', '(C) 9', '(D) 1'],
            answerKey: '(B) 7',
            solutionNote: 'Expanding: (sin²A + cosec²A + 2) + (cos²A + sec²A + 2) - tan²A - cot²A = (sin²A + cos²A) + 4 + (cosec²A - cot²A) + (sec²A - tan²A) = 1 + 4 + 1 + 1 = 7.'
          },
          {
            q: 'Find the ratio in which the y-axis divides the line segment joining (-3, 5) and (6, -2).',
            options: ['(A) 1:2', '(B) 2:1', '(C) 1:3', '(D) 3:2'],
            answerKey: '(A) 1:2',
            solutionNote: 'On the y-axis, x = 0. By section formula: x = (6m - 3n)/(m + n) = 0 => 6m = 3n => m/n = 1/2.'
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
            options: ['(A) 25 m/s', '(B) 30 m/s', '(C) 35 m/s', '(D) 20 m/s'],
            answerKey: '(B) 30 m/s',
            solutionNote: 'Using v² = u² + 2gh taking downward displacement: v² = 20² + 2(10)(25) = 400 + 500 = 900 => v = 30 m/s.'
          },
          {
            q: 'A 5 kg block rests on a rough horizontal floor with static friction coefficient μₛ = 0.4. What force is needed to start motion (g = 9.8 m/s²)?',
            options: ['(A) 14.6 N', '(B) 19.6 N', '(C) 24.5 N', '(D) 49.0 N'],
            answerKey: '(B) 19.6 N',
            solutionNote: 'Maximum static friction fₛ = μₛ × mg = 0.4 × 5 × 9.8 = 19.6 N.'
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
            options: ['(A) All three in parallel', '(B) Two in parallel, in series with the third', '(C) All three in series', '(D) Two in series, in parallel with the third'],
            answerKey: '(B) Two in parallel, in series with the third',
            solutionNote: 'Two 6Ω resistors in parallel give (6 × 6)/(6 + 6) = 3Ω. Adding third 6Ω in series gives 3 + 6 = 9Ω.'
          },
          {
            q: 'An electric heater rated 1000 W operates 2 hours daily. What is the electrical energy consumed in 30 days in kWh?',
            options: ['(A) 30 kWh', '(B) 60 kWh', '(C) 120 kWh', '(D) 600 kWh'],
            answerKey: '(B) 60 kWh',
            solutionNote: 'Energy = Power × Time = 1 kW × (2 h/day × 30 days) = 1 kW × 60 h = 60 kWh.'
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
            options: ['(A) 1 mole', '(B) 2 moles', '(C) 3 moles', '(D) 4 moles'],
            answerKey: '(C) 3 moles',
            solutionNote: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O. Molar mass of C₃H₈ = 44 g/mol (1 mole). Hence 1 mole of C₃H₈ produces exactly 3 moles of CO₂.'
          },
          {
            q: 'Which type of reaction occurs when zinc metal reacts with dilute sulphuric acid to produce hydrogen gas?',
            options: ['(A) Combination reaction', '(B) Single displacement reaction', '(C) Double decomposition', '(D) Neutralization'],
            answerKey: '(B) Single displacement reaction',
            solutionNote: 'Zn (s) + H₂SO₄ (aq) → ZnSO₄ (aq) + H₂ (g). Zinc displaces hydrogen from the acid as it is higher in the reactivity series.'
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
            q: 'What is the systematic IUPAC name for CH₃-CH(CH₃)-CH₂-CHO?',
            options: ['(A) 2-Methylbutanal', '(B) 3-Methylbutanal', '(C) Pentan-2-one', '(D) 2-Methylbutanone'],
            answerKey: '(B) 3-Methylbutanal',
            solutionNote: 'Aldehyde carbon is C-1. Longest continuous chain has 4 carbons (butanal). Methyl substituent is on C-3. Hence, 3-Methylbutanal.'
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
            q: 'State the exact location where glycolysis takes place and its primary net products.',
            options: ['(A) Mitochondria; 36 ATP & Acetyl-CoA', '(B) Cytoplasm; 2 Pyruvate, 2 net ATP, 2 NADH', '(C) Endoplasmic reticulum; Lactate & CO₂', '(D) Nucleus; Glucose-6-phosphate'],
            answerKey: '(B) Cytoplasm; 2 Pyruvate, 2 net ATP, 2 NADH',
            solutionNote: 'Glycolysis occurs in the cytoplasm independently of oxygen, converting 1 glucose into 2 pyruvates, yielding 2 net ATP and 2 NADH.'
          },
          {
            q: 'What is the primary function of the glomerulus in the human nephron?',
            options: ['(A) Ultrafiltration of blood under pressure', '(B) Selective reabsorption of glucose', '(C) Secretion of urea and uric acid', '(D) Concentration of urine in the loop of Henle'],
            answerKey: '(A) Ultrafiltration of blood under pressure',
            solutionNote: 'The glomerulus is a capillary tuft that filters water and soluble solutes from blood into Bowman capsule via hydrostatic pressure.'
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
            options: ['(A) -0.5 (Inelastic)', '(B) -1.0 (Unitary Elastic)', '(C) -1.5 (Elastic)', '(D) 0 (Perfect Inelastic)'],
            answerKey: '(B) -1.0 (Unitary Elastic)',
            solutionNote: '%ΔQ = -20/100 = -20%. %ΔP = +2/10 = +20%. Ed = -20% / 20% = -1.0 (Unitary elasticity of demand).'
          }
        ]
      }
    ]
  },
  {
    subject: 'English Language',
    classLevel: 'Class 10 & 11',
    chapters: [
      {
        id: 'eng-01',
        title: 'Reading Comprehension & Advanced Verbal Analogies',
        questionCount: 32,
        difficulty: 'Intermediate',
        topics: ['Antonyms & Synonyms', 'Verbal Analogies', 'Grammar & Syntax Rules', 'Context Clues'],
        sampleQuestions: [
          {
            q: 'Select the word that is most nearly OPPOSITE in meaning to the capitalized word: CANDID.',
            options: ['(A) Frank', '(B) Deceitful', '(C) Forthright', '(D) Impartial'],
            answerKey: '(B) Deceitful',
            solutionNote: 'Candid means truthful, outspoken, and straightforward. Its direct antonym is deceitful, evasive, or dishonest.'
          },
          {
            q: 'Identify the pair that expresses a relationship similar to TENACIOUS : RESOLVE.',
            options: ['(A) Callous : Compassion', '(B) Meticulous : Care', '(C) Nefarious : Virtue', '(D) Pensive : Anger'],
            answerKey: '(B) Meticulous : Care',
            solutionNote: 'A person who is tenacious demonstrates a high degree of resolve. Similarly, a person who is meticulous demonstrates a high degree of care.'
          }
        ]
      }
    ]
  }
];
