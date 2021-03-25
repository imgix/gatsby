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
    if (!DPR_REGEX.test(srcset)) return false;

    const [first, ...rest] = srcset.split(', ').map((v) => v.trim());
    const baseWidth = parseInt((first.match(/(?<=w=)\d+/) ?? [])[0]);
    if (Number.isNaN(baseWidth)) return false;
    return (
      rest.reduce((errors, srcset) => {
        const [url, dpr] = srcset.split(' ');
        const expectedWidth = parseInt(dpr) * baseWidth;
        if (!url.includes(`w=${expectedWidth}`)) return errors + 1;
        return errors;
      }, 0) === 0
    );
  }

  if (!FLUID_REGEX.test(srcset)) return false;

  const srcsets = srcset.split(', ').map((v) => v.trim());
  return (
    srcsets.reduce((errors, srcset) => {
      const [url, srcsetW] = srcset.split(' ');
      const expectedWidth = parseInt(srcsetW);
      if (!url.includes(`w=${expectedWidth}`)) return errors + 1;
      return errors;
    }, 0) === 0
  );
};

export const isFixedSrcSet = (srcset: string | undefined): boolean => {
  if (srcset == null || srcset.trim().length === 0) {
    return false;
  }
  return DPR_REGEX.test(srcset);
};

export const getAspectRatioFromUrl = (url: string | undefined): number => {
  if (url == null) {
    throw new Error('url not set');
  }
  const width = url.match(/(?<=w=)\d+/);
  const height = url.match(/(?<=h=)\d+/);

  if (width == null || height == null) {
    throw new Error('width or height not set');
  }

  return parseFloat(width[0]) / parseFloat(height[0]);
};
