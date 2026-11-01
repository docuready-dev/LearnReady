export const INDIAN_BOARDS = [
  { value: 'CBSE', label: 'CBSE — Central Board of Secondary Education' },
  { value: 'ICSE', label: 'ICSE — Indian Certificate of Secondary Education' },
  { value: 'STATE_MH', label: 'State Board — Maharashtra (SSC)' },
  { value: 'STATE_WB', label: 'State Board — West Bengal (WBCHSE)' },
  { value: 'STATE_DL', label: 'State Board — Delhi' },
  { value: 'STATE_TN', label: 'State Board — Tamil Nadu' },
  { value: 'STATE_KA', label: 'State Board — Karnataka' },
  { value: 'STATE_OTHER', label: 'State Board — Other' },
  { value: 'IB', label: 'IB — International Baccalaureate (MYP)' },
  { value: 'IGCSE', label: 'IGCSE — Cambridge International' },
];

export function getBoardLabel(code: string): string {
  return INDIAN_BOARDS.find(b => b.value === code)?.label || code;
}
