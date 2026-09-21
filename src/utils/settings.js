export const DEFAULT_SETTINGS = {
  ppiRate: 0.002,
  processingFeeWithPpi: 0.02,
  processingFeeWithoutPpi: 0.05,
  maxLoanLimit: 22000,
  maxCardLimit: 10000,
  // Combined ceiling across every active loan principal + card limit a
  // single customer can hold at once, regardless of how much Financial
  // Power or per-product headroom they'd otherwise qualify for.
  masterCappedLimit: 35000,
}
