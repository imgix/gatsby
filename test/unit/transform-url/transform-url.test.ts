import readPkg from 'read-pkg';
import {
  buildFixedImageData,
  buildFluidImageData,
  getGatsbyImageData,
} from '../../../src/modules/gatsby-transform-url';
import {
  IGatsbyImageFixedData,
  IGatsbyImageFluidData,
} from '../../../src/modules/gatsby-transform-url/types';

const shouldHaveIxLib = async (
  fut: () => IGatsbyImageFluidData | IGatsbyImageFixedData,
) => {
  test('src and srcset should have ixlib set to gatsbyTransformUrl-VERSION', async () => {
    const actual = fut();

    const expectedIxLibRegex = RegExp(
      `ixlib=gatsbyTransformUrl-${(await readPkg()).version}`,
    );

    expect(actual.src).toMatch(expectedIxLibRegex);
    expect(actual.srcSet).toMatch(expectedIxLibRegex);
  });
};
const shouldBeAbleToDisableIxLib = (
  fut: (options: {
    includeLibraryParam?: boolean;
  }) => IGatsbyImageFixedData | IGatsbyImageFluidData,
) => {
  test('when ixlib is disabled, src and srcset should not have ixlib set', async () => {
    const actual = fut({ includeLibraryParam: false });

    const expectedIxLibRegex = RegExp(`ixlib=`);

    expect(actual.src).not.toMatch(expectedIxLibRegex);
    expect(actual.srcSet).not.toMatch(expectedIxLibRegex);
  });
};

describe('gatsby-transform-url', () => {
  describe('buildFixedImageData', () => {
    test('should return an imgix src', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.src).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return an imgix srcset', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.srcSet).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return a fixed srcset', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: 10,
      });

      expect(actual.srcSet).toMatch(/1x/);
    });
    test('height should match height passed as param', () => {
      const expectedHeight = 10;
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 10,
        h: expectedHeight,
      });

      expect(actual.height).toBe(expectedHeight);
      expect(actual.src).toMatch(`h=${expectedHeight}`);
      expect(actual.srcSet).toMatch(`h=${expectedHeight}`);
    });
    test('width should match width passed as param', () => {
      const expectedWidth = 10;
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        h: 10,
        w: expectedWidth,
      });

      expect(actual.width).toBe(expectedWidth);
      expect(actual.src).toMatch(`w=${expectedWidth}`);
      expect(actual.srcSet).toMatch(`w=${expectedWidth}`);
    });
    shouldHaveIxLib(() =>
      buildFixedImageData('https://test.imgix.net/image.jpg', { w: 1, h: 1 }),
    );
    shouldBeAbleToDisableIxLib((options: { includeLibraryParam?: boolean }) =>
      buildFixedImageData(
        'https://test.imgix.net/image.jpg',
        { w: 1, h: 1 },
        options,
      ),
    );

    test('should have fit=crop set by default', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
      });

      expect(actual.src).toMatch(`fit=crop`);
      expect(actual.srcSet).toMatch(`fit=crop`);
    });
    test('should be able to override fit', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
        fit: 'clip',
      });

      expect(actual.src).toMatch(`fit=clip`);
      expect(actual.srcSet).toMatch(`fit=clip`);
    });

    test('should have webp src and srcset with fm=webp', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
        fit: 'clip',
      });

      expect(actual.srcWebp).toMatch(`fm=webp`);
      expect(actual.srcSetWebp).toMatch(`fm=webp`);
    });
    test('should not have fm=webp set for main src and srcset', () => {
      const actual = buildFixedImageData('https://test.imgix.net/image.jpg', {
        w: 1,
        h: 1,
      });

      expect(actual.src).not.toMatch(`fm=webp`);
      expect(actual.srcSet).not.toMatch(`fm=webp`);
    });

    test('should not truncate URL after ?', () => {
      const actual = buildFixedImageData(
        'https://test.imgix.net/image.jpg?abc?foo',
        {
          w: 1,
          h: 1,
        },
      );

      expect(actual.src).toMatch(`/image.jpg%3Fabc%3Ffoo`);
      expect(actual.srcSet).toMatch(`/image.jpg%3Fabc%3Ffoo`);
    });
  });
  describe('buildFluidImageData', () => {
    test('should return an imgix src', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 1,
      });

      expect(actual.src).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return an imgix srcset', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 1,
      });

      expect(actual.srcSet).toMatch(/^https:\/\/test.imgix.net\/image.jpg\?/);
    });
    test('should return a fluid srcset', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 1,
      });

      expect(actual.srcSet).toMatch(/\dw,/);
    });
    shouldHaveIxLib(() =>
      buildFluidImageData('https://test.imgix.net/image.jpg', { ar: 1 }),
    );
    shouldBeAbleToDisableIxLib((options: { includeLibraryParam?: boolean }) =>
      buildFluidImageData(
        'https://test.imgix.net/image.jpg',
        { ar: 1 },
        options,
      ),
    );
    test('should have fit=crop set by default', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2,
      });

      expect(actual.src).toMatch(`fit=crop`);
      expect(actual.srcSet).toMatch(`fit=crop`);
    });
    test('should be able to override fit', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 2,
        fit: 'clip',
      });

      expect(actual.src).toMatch(`fit=clip`);
      expect(actual.srcSet).toMatch(`fit=clip`);
    });

    describe('aspect ratio', () => {
      test('should pass aspect ratio to src and srcset', () => {
        const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
          ar: 2.1,
        });

        expect(actual.src).toMatch(`ar=2.1%3A1`);
        expect(actual.srcSet).toMatch(`ar=2.1%3A1`);
      });
      test('should return aspect ratio in resulting data object', () => {
        const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
          ar: 2.1,
        });

        expect(actual).toMatchObject({
          aspectRatio: 2.1,
        });
      });
      describe('valid AR', () => {
        const testValidAR = ({
          ar,
          arFloat,
        }: {
          ar: string;
          arFloat: number;
        }) => {
          it(`should set aspectRatio and ar= correctly with an ar parameter of "${ar}"`, () => {
            const parseParam = (
              url: string,
              param: string,
            ): string | undefined => {
              const matched = url.match('[?&]' + param + '=([^&]+)');
              if (!matched) return undefined;
              return matched[1];
            };
            const removeFallbackSrcSet = <T>(srcSets: T[]) =>
              srcSets.slice(0, -1);

            const actual = buildFluidImageData(
              'https://test.imgix.net/image.jpg',
              {
                ar,
              },
            );

            const testSrcset = (srcset: string) => {
              const srcSets = srcset.split(',').map((v) => v.trim());
              const srcSetUrls = srcSets.map((srcset) => srcset.split(' ')[0]);
              removeFallbackSrcSet(srcSetUrls).forEach((srcSetUrl) => {
                const ar = parseParam(srcSetUrl, 'ar');
                expect(ar).toBeTruthy();
              });
            };

            testSrcset(actual.srcSet);
            testSrcset(actual.srcSetWebp);
            expect(actual.aspectRatio).toBe(arFloat);
          });
        };
        ([
          ['1:1', 1],
          ['1.1:1', 1.1],
          ['1.12:1', 1.12],
          ['1.123:1', 1.123],
          ['1:1.1', 0.909],
          ['1:1.12', 0.893],
          ['1.1:1.1', 1],
          ['1.123:1.123', 1],
          ['11.123:11.123', 1],
        ] as const).forEach(([validAR, validArFloat]) =>
          testValidAR({
            ar: validAR,
            arFloat: validArFloat,
          }),
        );
      });

      describe('invalid AR', () => {
        // Using any to simulate JS
        const testInvalidAR = (ar: any) => {
          it(`should throw an error given an invalid string ar prop "${ar}"`, () => {
            const actualLazy = () =>
              buildFluidImageData('https://test.imgix.net/image.jpg', {
                ar,
              });

            expect(actualLazy).toThrowError(/invalid string ar parameter/);
          });
        };

        [
          '4x3',
          '4:',
          ,
          'blah:1:1',
          'blah1:1',
          '1x1',
          '1:1blah',
          '1:blah1',
          true,
          NaN,
        ].forEach((invalidAR) => testInvalidAR(invalidAR));
      });
    });
    test('should pass sizes to resulting data object', () => {
      const actual = buildFluidImageData(
        'https://test.imgix.net/image.jpg',
        { ar: 1 },
        { sizes: '50vw' },
      );

      expect(actual).toMatchObject({
        sizes: '50vw',
      });
    });
    test('should have webp src and srcset with fm=webp', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 1,
      });

      expect(actual.srcWebp).toMatch(`fm=webp`);
      expect(actual.srcSetWebp).toMatch(`fm=webp`);
    });
    test('should not have fm=webp set for main src and srcset', () => {
      const actual = buildFluidImageData('https://test.imgix.net/image.jpg', {
        ar: 1,
      });

      expect(actual.src).not.toMatch(`fm=webp`);
      expect(actual.srcSet).not.toMatch(`fm=webp`);
    });

    test('should not truncate URL after ?', () => {
      const actual = buildFluidImageData(
        'https://test.imgix.net/image.jpg?abc?foo',
        {
          ar: 1,
        },
      );

      expect(actual.src).toMatch(`/image.jpg%3Fabc%3Ffoo`);
      expect(actual.srcSet).toMatch(`/image.jpg%3Fabc%3Ffoo`);
    });
  });
  describe('getGatsbyImageData', () => {
    it('should return a valid URL', () => {
      const actual = getGatsbyImageData({
        src: 'https://foo.imgix.com/image.jpg',
        layout: 'fullWidth',
        aspectRatio: 1,
      });
      expect(actual.images.fallback?.src).toMatch(
        'https://foo.imgix.com/image.jpg',
      );
    });
  });
});
