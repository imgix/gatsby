<!-- ix-docs-ignore -->

![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`@imgix/gatsby-transform-url` is a library to transform [imgix](https://www.imgix.com/) urls to a format compatible with gatsby-image.

[![npm version](https://img.shields.io/npm/v/@imgix/gatsby-transform-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-transform-url)
[![Build Status](https://travis-ci.org/imgix/gatsby.svg?branch=main)](https://travis-ci.org/imgix/gatsby)
[![Downloads](https://img.shields.io/npm/dm/@imgix/gatsby-transform-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-transform-url)
[![License](https://img.shields.io/npm/l/@imgix/gatsby-transform-url)](https://github.com/imgix/@imgix/gatsby-transform-url/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Fgatsby.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Fgatsby?ref=badge_shield)
[![Dependencies Status](https://david-dm.org/imgix/@imgix/gatsby-transform-url.svg)](https://david-dm.org/imgix/@imgix/gatsby-transform-url)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

---

<!-- /ix-docs-ignore -->

<!-- NB: Run `npx markdown-toc README.md --maxdepth 4 | sed -e 's/[[:space:]]\{2\}/    /g' | pbcopy` to generate TOC and copy to clipboard :) -->

<!-- prettier-ignore-start -->

- [About this library](#about-this-library)
- [Get started](#get-started)
    * [Usage](#usage)
        + [Basic fluid image](#basic-fluid-image)
        + [Basic fixed image](#basic-fixed-image)

<!-- prettier-ignore-end -->

# About this library

This library allows imgix urls to be used with gatsby-image. This library transforms imgix urls into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this library you can either display images that already exist on imgix, or proxy other images through imgix.

Unfortunately, due to limitations of Gatsby, this library does not support placeholder/blur-up images yet. When Gatsby removes this limitation, we plan to implement this for this library. Our other libraries will support blur-up/placeholder images.

# Get started

Firstly, this library requires an imgix account, so please follow this [quick start guide](https://docs.imgix.com/setup/quick-start) if you don't have an account.

Then, install this library with the following commands, depending on your package manager.

- **NPM**: `npm install @imgix/gatsby-transform-url`
- **Yarn**: `yarn add @imgix/gatsby-transform-url`

## Usage

### Basic fluid image

The following code will render a fluid image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFluidImageData } from '@imgix/gatsby-transform-url';

// Later, in a gatsby page/component.
<Img
  fluid={buildFluidImageData(
    'https://assets.imgix.net/examples/pione.jpg',
    {
      ar: 1.61, // required
      // pass other imgix parameters here, as needed
    },
    {
      sizes: '50vw', // optional, but highly recommended
    },
  )}
/>;
```

`ar` is required, since gatsby-image requires this to generate placeholders. This `ar` will also crop the rendered photo from imgix to the same aspect ratio. If you don't know the aspect ratio of your image beforehand, it is virtually impossible to use gatsby-image in this format, so we either recommend using another of our plugins, or using an `img` directly.

Although `sizes` is optional, it is highly recommended. It has a default of `100vw`, which means that it might be loading an image too large for your users. Some examples of what you can set sizes as are:

- `500px` - the image is a fixed width. In this case, you should use fixed mode, described in the next section.
- `(min-width: 1140px) 1140px, 100vw` - under 1140px, the image is as wide as the viewport. Above 1140px, it is fixed to 1140px.

A playground for this example is attached below.

<img src="docs/playgrounds/fluid.svg" width="800" height="500">

### Basic fixed image

The following code will render a fixed image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFixedImageData } from '@imgix/gatsby-transform-url';

// Later, in a gatsby page/component.
<Img
  fluid={buildFixedImageData('https://assets.imgix.net/examples/pione.jpg', {
    w: 960, // required
    h: 540, // required
    // pass other imgix parameters here, as needed
  })}
/>;
```

The imgix parameters `w` and `h` are required, since these are used by gatsby-image to display a placeholder while the image is loading. Other imgix parameters can be added below the width and height.
