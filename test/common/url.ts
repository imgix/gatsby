const VALID_URL_REGEX = `https?:\\/\\/.+\\/.+\\?.+`;
const DPR_REGEX = new RegExp(
  '^' +
    [1, 2, 3, 4, 5]
      .map((dpr) => VALID_URL_REGEX + ' ' + dpr + 'x')
      .join(',\\s*') +
    '$',
);
const FLUID_REGEX = new RegExp(`^(${VALID_URL_REGEX} \\d+w,?\\s*)+$`);

export const isValidSrcSet = (srcset: string | undefined): boolean => {
  if (srcset == null || srcset.trim().length === 0) {
    return false;
  }
  const isFixedSrcSet = srcset.includes(' 1x,');
  if (isFixedSrcSet) {
    // TODO: test dprs
    return DPR_REGEX.test(srcset);
  }
  // TODO: test widths
  return FLUID_REGEX.test(srcset);
};