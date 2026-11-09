/**
 * Source extraction status for the original 2027 思修 hat-question PDF.
 * This is deliberately a coverage ledger, not fabricated question content.
 * The local OCR draft has all 48 page slots, but every page still requires
 * manual comparison with the scanned PDF before OCR text can be treated as canonical.
 */
export const HAT_SOURCE_COVERAGE = {
  sourceFile: '27肖1000帽子题 思修_2027版.pdf',
  totalPages: 48,
  extractedPages: 48,
  verifiedPages: 0,
  pendingManualVerificationPages: Array.from({ length: 48 }, (_, index) => index + 1),
  status: 'ocr-draft-needs-verification',
  note: 'OCR is a retrieval aid only. Do not treat it as a verified answer key; preserve uncertain items in the supplementation queue.'
} as const;
