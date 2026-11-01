export interface BoardOption {
  value: string;
  label: string;
  type: 'school' | 'higher_ed';
}

export const SCHOOL_BOARDS: BoardOption[] = [
  { value: 'CBSE', label: 'CBSE — Central Board of Secondary Education', type: 'school' },
  { value: 'ICSE', label: 'CISCE — ICSE / ISC (Council for the Indian School Certificate Examinations)', type: 'school' },
  { value: 'STATE_MH', label: 'State Board — Maharashtra (MSBSHSE / SSC / HSC)', type: 'school' },
  { value: 'STATE_UP', label: 'State Board — Uttar Pradesh (UPMSP High School / Intermediate)', type: 'school' },
  { value: 'STATE_WB', label: 'State Board — West Bengal (WBBSE / WBCHSE)', type: 'school' },
  { value: 'STATE_DL', label: 'State Board — Delhi Directorate of Education', type: 'school' },
  { value: 'STATE_TN', label: 'State Board — Tamil Nadu (SSLC / HSC)', type: 'school' },
  { value: 'STATE_KA', label: 'State Board — Karnataka (KSEAB)', type: 'school' },
  { value: 'STATE_OTHER', label: 'State Examination Board — Other State', type: 'school' },
  { value: 'IB', label: 'IB — International Baccalaureate (MYP / DP)', type: 'school' },
  { value: 'IGCSE', label: 'Cambridge Assessment International Education (IGCSE / A-Levels)', type: 'school' },
  { value: 'NIOS', label: 'NIOS — National Institute of Open Schooling', type: 'school' },
];

export const HIGHER_ED_BOARDS: BoardOption[] = [
  { value: 'UGC_CENTRAL', label: 'UGC Recognized Central University (e.g. DU, BHU, JNU, Jamia, Hyderabad)', type: 'higher_ed' },
  { value: 'UGC_STATE', label: 'UGC State Public University (e.g. Mumbai, Calcutta, Anna, Pune, VTU)', type: 'higher_ed' },
  { value: 'INI_CENTRAL', label: 'Institute of National Importance (IIT / NIT / IIIT / AIIMS / IIM / IISc)', type: 'higher_ed' },
  { value: 'UGC_DEEMED', label: 'UGC Deemed-to-be University (e.g. BITS Pilani, Manipal, VIT, Amrita)', type: 'higher_ed' },
  { value: 'UGC_PRIVATE', label: 'State Private University (UGC Approved — e.g. Ashoka, OP Jindal, Shiv Nadar, SRM)', type: 'higher_ed' },
  { value: 'AICTE_AUTONOMOUS', label: 'AICTE Autonomous Technical / Management Institute', type: 'higher_ed' },
  { value: 'NMC_MEDICAL', label: 'NMC / DCI / Pharmacy Council Approved Medical / Healthcare College', type: 'higher_ed' },
  { value: 'BCI_LAW', label: 'Bar Council of India (BCI / National Law University NLU System)', type: 'higher_ed' },
  { value: 'AUTONOMOUS_COLLEGE', label: 'Autonomous College (NAAC A++ / Affiliated to State University)', type: 'higher_ed' },
  { value: 'OVERSEAS_UNI', label: 'Overseas / International University Campus', type: 'higher_ed' },
];

export const INDIAN_BOARDS: BoardOption[] = [...SCHOOL_BOARDS, ...HIGHER_ED_BOARDS];

export function isHigherEducationLevel(level?: string): boolean {
  if (!level) return false;
  const l = level.toLowerCase();
  return l.includes('undergraduate') || l.includes('graduate') || l.includes('dropper') || l.includes('college') || l.includes('degree');
}

export function getBoardsForLevel(level?: string): BoardOption[] {
  if (isHigherEducationLevel(level)) {
    return HIGHER_ED_BOARDS;
  }
  return SCHOOL_BOARDS;
}

export function getDefaultBoardForLevel(level?: string): string {
  return isHigherEducationLevel(level) ? 'UGC_CENTRAL' : 'CBSE';
}

export function getBoardCategoryLabel(level?: string): string {
  return isHigherEducationLevel(level) ? 'University / Affiliation Board' : 'Educational Board';
}

export function getBoardLabel(code: string): string {
  const match = INDIAN_BOARDS.find(b => b.value === code);
  return match?.label || code;
}
