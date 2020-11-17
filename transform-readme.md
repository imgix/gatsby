<!-- ix-docs-ignore -->

![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`@imgix/gatsby-transform-url` is a library to transform [imgix](https://www.imgix.com/) urls to a format compatible with gatsby-image.

[![npm version](https://img.shields.io/npm/v/@imgix/gatsby-transform-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-transform-url)
[![Build Status](https://travis-ci.org/imgix/gatsby.svg?branch=main)](https://travis-ci.org/imgix/gatsby)
[![Downloads](https://img.shields.io/npm/dm/@imgix/gatsby-transform-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-transform-url)
[![License](https://img.shields.io/npm/l/@imgix/gatsby-transform-url)](https://github.com/imgix/gatsby/blob/main/packages/gatsby-transform-url/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Fgatsby.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Fgatsby?ref=badge_shield)
[![Dependencies Status](https://david-dm.org/imgix/@imgix/gatsby-transform-url.svg)](https://david-dm.org/imgix/@imgix/gatsby-transform-url)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

---

<!-- /ix-docs-ignore -->

<!-- NB: Run `npx markdown-toc README.md --maxdepth 4 | sed -e 's/[[:space:]]\{2\}/    /g' | pbcopy` to generate TOC and copy to clipboard :) -->

<!-- prettier-ignore-start -->

- [About This Library](#about-this-library)
- [Why use imgix instead of gatsby-transform-sharp?](#why-use-imgix-instead-of-gatsby-transform-sharp)
- [Get Started](#get-started)
    * [Usage](#usage)
        + [Basic Fluid Image](#basic-fluid-image)
        + [Basic Fixed Image](#basic-fixed-image)
- [API](#api)
        + [`buildFixedImageData`](#buildfixedimagedata)
        + [`buildFluidImageData`](#buildfluidimagedata)
    * [What is the `ixlib` Param on Every Request?](#what-is-the-ixlib-param-on-every-request)

<!-- prettier-ignore-end -->

# About This Library

This library allows imgix urls to be used with gatsby-image. This library transforms imgix urls into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this library you can either display images that already exist on imgix, or proxy other images through imgix.

Unfortunately, due to limitations of Gatsby, this library does not support the placeholder/blur-up feature yet. When Gatsby removes this limitation, we plan to implement this for this library. In the meantime, our other Gatsby plugins will support blur-up/placeholder images, so if this feature is critical to you, please consider using one of those.

# Why use imgix instead of gatsby-transform-sharp?

Integrating imgix with Gatsby provides a few key advantages over the core image experience in Gatsby:

1. Far-reduced build time and better developer experience. Since we offload the image rendering to our cloud, we free up your machine from doing complex image transformations, meaning your builds are as snappy as they can be.
2. Access to imgix's suite of transformations and optimizations. imgix has a larger variety of image transformations than are possible with the built in Gatsby system. Furthermore, we are continuously improving our image optimization to push the boundaries of image performance.
3. Better image responsiveness on the page. As we are able to create far more derivative images at different resolutions due to our cloud rendering stack, we can offer an image closer to the source resolution of your users' browsers, meaning faster load times and less bandwidth usage for your users (and you!).
4. Access to imgix's best-in-class CDN. imgix has invested significant time and effort into a world-leading CDN, which ensures images are delivered your website's customers as quick as possible.
5. Faster time-to-awesome. imgix offers a set of default optimizations which allow you to achieve outstanding image quality which still keeping image size small, and allows you to focus on other aspects of your website.

# Get Started

Firstly, this library requires an imgix account, so please follow this [quick start guide](https://docs.imgix.com/setup/quick-start) if you don't have an account.

Then, install this library with the following commands, depending on your package manager.

- **NPM**: `npm install @imgix/gatsby-transform-url`
- **Yarn**: `yarn add @imgix/gatsby-transform-url`

## Usage

### Basic Fluid Image

The following code will render a fluid image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFluidImageData } from '@imgix/gatsby-transform-url';

// Later, in a gatsby page/component.
<Img
  fluid={buildFluidImageData(
    'https://assets.imgix.net/examples/pione.jpg',
    {
      // imgix parameters
      ar: 1.61, // required
      auto: ['format', 'compress'], // recommended for all images
      // pass other imgix parameters here, as needed
    },
    {
      sizes: '50vw', // optional, but highly recommended
    },
  )}
/>;
```

`ar` is required, since gatsby-image requires this to generate placeholders. This `ar` will also crop the rendered photo from imgix to the same aspect ratio. If you don't know the aspect ratio of your image beforehand, it is virtually impossible to use gatsby-image in this format, so we either recommend using another of our plugins, or using an `img` directly.

Setting `auto: ['format', 'compress']` is highly recommended. This will re-format the image to the format that is best optimized for your browser, such as WebP. It will also reduce unnecessary wasted file size, such as transparency on a non-transparent image. More information about the auto parameter can be found [here](https://docs.imgix.com/apis/url/auto/auto).

A full list of imgix parameters can be found [here](https://docs.imgix.com/apis/url).

Although `sizes` is optional, it is highly recommended. It has a default of `100vw`, which means that it might be loading an image too large for your users. Some examples of what you can set sizes as are:

- `500px` - the image is a fixed width. In this case, you should use fixed mode, described in the next section.
- `(min-width: 1140px) 1140px, 100vw` - under 1140px, the image is as wide as the viewport. Above 1140px, it is fixed to 1140px.

A full example of a fluid image in a working Gatsby repo can be found on CodeSandbox.

[![Edit @imgix/gatsby-transform-url Fluid Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fluid-example-jxj0b?fontsize=14&hidenavigation=1&theme=dark)

### Basic Fixed Image

The following code will render a fixed image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFixedImageData } from '@imgix/gatsby-transform-url';

// Later, in a gatsby page/component.
<Img
  fluid={buildFixedImageData('https://assets.imgix.net/examples/pione.jpg', {
    // imgix parameters
    w: 960, // required
    h: 540, // required
    auto: ['format', 'compress'], // recommended for all images
    // pass other imgix parameters here, as needed
  })}
/>;
```

The imgix parameters `w` and `h` are required, since these are used by gatsby-image to display a placeholder while the image is loading. Other imgix parameters can be added below the width and height.

Setting `auto: ['format', 'compress']` is highly recommended. This will re-format the image to the format that is best optimized for your browser, such as WebP. It will also reduce unnecessary wasted file size, such as transparency on a non-transparent image. More information about the auto parameter can be found [here](https://docs.imgix.com/apis/url/auto/auto).

A full list of imgix parameters can be found [here](https://docs.imgix.com/apis/url).

An example of this mode in a full working Gatsby repo can be found on CodeSandbox.

[![Edit @imgix/gatsby-transform-url Fixed Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fixed-example-ce324?fontsize=14&hidenavigation=1&theme=dark)

# API

### `buildFixedImageData`

```ts
function buildFixedImageData(
  /**
   * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
   */
  url: string,
  /**
   * A set of imgix parameters to apply to the image.
   * Parameters ending in 64 will be base64 encoded.
   * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
   * Width (w) and height (h) are required.
   */
  imgixParams: { w: number; h: number } & IImgixParams,
  /**
   * Options that are not imgix parameters.
   * Optional.
   */
  options?: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
  },
): {
  width: number;
  height: number;
  src: string;
  srcSet: string;
  srcWebp: string;
  srcSetWebp: string;
};
```

### `buildFluidImageData`

```ts
export function buildFluidImageData(
  /**
   * An imgix url to transform, e.g. https://yourdomain.imgix.net/your-image.jpg
   */
  url: string,
  /**
   * A set of imgix parameters to apply to the image.
   * Parameters ending in 64 will be base64 encoded.
   * A full list of imgix parameters can be found here: https://docs.imgix.com/apis/url
   * The aspect ratio (ar) as a float is required.
   */
  imgixParams: {
    /**
     * The aspect ratio to set for the rendered image and the placeholder.
     * Format: float or string. For float, it can be calculated with ar = width/height. For a string, it should be in the format w:h.
     */
    ar: number | string;
  } & IImgixParams,
  /**
   * Options that are not imgix parameters.
   * Optional.
   */
  options?: {
    /**
     * Disable the ixlib diagnostic param that is added to every url.
     */
    includeLibraryParam?: boolean;
    /**
     * The sizes attribute to set on the underlying image.
     */
    sizes?: string;
  },
): {
  aspectRatio: number;
  src: string;
  srcSet: string;
  srcWebp: string;
  srcSetWebp: string;
  sizes: string;
};
```

## What is the `ixlib` Param on Every Request?

For security and diagnostic purposes, we tag all requests with the language and version of library used to generate the URL.

To disable this, set `includeLibraryParam` in the third parameter to `false` when calling one of the two functions this library exports. For example, for `buildFluidImageData`:

```jsx
<Img
  fluid={buildFixedImageData(
    'https://assets.imgix.net/examples/pione.jpg',
    {
      w: 960,
      h: 540,
    },
    {
      includeLibraryParam: false, // this disables the ixlib parameter
    },
  )}
/>
```
