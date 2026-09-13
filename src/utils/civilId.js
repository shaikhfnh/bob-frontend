// Kuwait Civil ID: 12 digits. Digit 1 = century indicator, digits 2-7 = birth
// date (YYMMDD), digits 8-11 = serial, digit 12 = checksum.
// Checksum formula: weighted sum of digits 1-11 using weights below,
// mod 11, subtracted from 11 — result must equal digit 12.
const WEIGHTS = [2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

export function isValidCivilId(value) {
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 12) return false;

  const nums = digits.split('').map(Number);
  const sum = nums.slice(0, 11).reduce((acc, d, i) => acc + d * WEIGHTS[i], 0);
  const remainder = sum % 11;
  const expectedChecksum = 11 - remainder;

  // The formula can produce 10 or 11, which aren't valid single digits —
  // real Civil IDs never land there, so treat those as invalid too.
  if (expectedChecksum >= 10) return false;

  return expectedChecksum === nums[11];
}