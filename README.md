![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`@imgix/gatsby` is a multi-faceted plugin to help the developer use [imgix](https://www.imgix.com) with Gatsby.

<!-- ix-docs-ignore -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![npm version](https://img.shields.io/npm/v/@imgix/gatsby.svg)](https://www.npmjs.com/package/@imgix/gatsby)
[![Build Status](https://travis-ci.com/imgix/gatsby.svg?branch=main)](https://travis-ci.com/imgix/gatsby)
[![Downloads](https://img.shields.io/npm/dm/@imgix/gatsby.svg)](https://www.npmjs.com/package/@imgix/gatsby)
[![License](https://img.shields.io/npm/l/@imgix/gatsby)](https://github.com/imgix/gatsby/blob/main/packages/gatsby/LICENSE)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
[![Dependencies Status](https://david-dm.org/imgix/@imgix/gatsby.svg)](https://david-dm.org/imgix/@imgix/gatsby)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Fgatsby.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Fgatsby?ref=badge_shield)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

---

<!-- /ix-docs-ignore -->

<!-- NB: Run `npx markdown-toc README.md --maxdepth 4 | sed -e 's/[[:space:]]\{2\}/    /g' | pbcopy` to generate TOC :) -->

<!-- prettier-ignore-start -->

- [Overview / Resources](#overview--resources)
- [Why use imgix instead of gatsby-transform-sharp?](#why-use-imgix-instead-of-gatsby-transform-sharp)
- [Get started](#get-started)
- [Usage](#usage)
    * [What section should I read?](#what-section-should-i-read)
    * [GraphQL `imgixImage` API](#graphql-imgiximage-api)
        + [Configuration](#configuration)
        + [Fluid Images](#fluid-images)
        + [Fixed Images](#fixed-images)
        + [Generating imgix URLs](#generating-imgix-urls)
        + [Using a Web Proxy Source](#using-a-web-proxy-source)
    * [URL Transform Function](#url-transform-function)
        + [Basic Fluid Image](#basic-fluid-image)
        + [Basic Fixed Image](#basic-fixed-image)
- [API](#api)
    * [GraphQL](#graphql)
        + [GraphQL Fragments](#graphql-fragments)
    * [Gatsby/Plugin Configuration](#gatsbyplugin-configuration)
    * [URL Transform Function](#url-transform-function-1)
        + [`buildFixedImageData`](#buildfixedimagedata)
        + [`buildFluidImageData`](#buildfluidimagedata)
- [What is the `ixlib` Param on Every Request?](#what-is-the-ixlib-param-on-every-request)
- [Roadmap](#roadmap)
- [Contributors](#contributors)
- [License](#license)

<!-- prettier-ignore-end -->

# Overview / Resources

**Before you get started with this library**, it's _highly recommended_ that you read Eric Portis' [seminal article on `srcset` and `sizes`](https://ericportis.com/posts/2014/srcset-sizes/). This article explains the history of responsive images in responsive design, why they're necessary, and how all these technologies work together to save bandwidth and provide a better experience for users. The primary goal of this library is to make these tools easier for developers to implement, so having an understanding of how they work will significantly improve your experience with this library.

Below are some other articles that help explain responsive imagery, and how it can work alongside imgix:

# Why use imgix instead of gatsby-transform-sharp?

Integrating imgix with Gatsby provides a few key advantages over the core image experience in Gatsby:

1. Far-reduced build time and better developer experience. Since we offload the image rendering to our cloud, we free up your machine from doing complex image transformations, meaning your builds are as snappy as they can be.
2. Access to imgix's suite of transformations and optimizations. imgix has a larger variety of image transformations than are possible with the built in Gatsby system. Furthermore, we are continuously improving our image optimization to push the boundaries of image performance.
3. Better image responsiveness on the page. As we are able to create far more derivative images at different resolutions due to our cloud rendering stack, we can offer an image closer to the source resolution of your users' browsers, meaning faster load times and less bandwidth usage for your users (and you!).
4. Access to imgix's best-in-class CDN. imgix has invested significant time and effort into a world-leading CDN, which ensures images are delivered your website's customers as quick as possible.
5. Faster time-to-awesome. imgix offers a set of default optimizations which allow you to achieve outstanding image quality which still keeping image size small, and allows you to focus on other aspects of your website.

# Get started

Firstly, this library requires an imgix account, so please follow this [quick start guide](https://docs.imgix.com/setup/quick-start) if you don't have an account.

Then, install this library with the following commands, depending on your package manager.

- **NPM**: `npm install @imgix/gatsby`
- **Yarn**: `yarn add @imgix/gatsby`

Finally, check out the section in the usage guide below that most suits your needs.

# Usage

## What section should I read?

To find what part of this usage guide you should read, select the use case below that best matches your use case:

- I load images on the server from an imgix source, and I want to use these images with gatsby-image or an `<img>` element, with blur-up support 👉 [graphql `imgixImage` api](#graphql-imgiximage-api)
- I load image URLs on the server **and client** and I want to transform these into a format that is compatible with gatsby-image, **without** blur-up support 👉[url tranform function](#url-transform-function)

## GraphQL `imgixImage` API

This feature can be best thought about as a part-replacement for gatsby-image-sharp, and allows imgix URLs to be used with gatsby-image through the Gatsby GraphQL API. This feature transforms imgix URLs into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this feature you can either display images that already exist on imgix, or proxy other images through imgix.

This feature supports many of the existing gatsby-image GraphQL that you know and love, and also supports most of the features of gatsby-image, such as blur-up and lazy loading. It also brings all of the great features of imgix, including the extensive image transformations and optimisations, as well as the excellent imgix CDN.

### Configuration

This source must be configured in your `gatsby-config` file as follows:

```js
module.exports = {
  //...
  plugins: [
    // your other plugins here
    {
      resolve: `@imgix/gatsby`,
      options: {
        domain: '<your imgix domain, e.g. acme.imgix.net>',
        defaultImgixParams: ['auto', 'format'],
      },
    },
  ],
};
```

Setting `auto: ['format', 'compress']` is highly recommended. This will re-format the image to the format that is best optimized for your browser, such as WebP. It will also reduce unnecessary wasted file size, such as transparency on a non-transparent image. More information about the auto parameter can be found [here](https://docs.imgix.com/apis/url/auto/auto).

### Fluid Images

The following code will render a fluid image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import gql from 'graphql-tag';
import Img from 'gatsby-image';

export default ({ data }) => {
  return <Img fluid={{ ...data.imgixImage.fluid, sizes: '100vw' }} />;
};

export const query = gql`
  {
    imgixImage(url: "/image.jpg") {
      fluid(imgixParams: {
        // pass any imgix parameters you want to here
      }) {
        ...GatsbySourceImgixFluid
      }
    }
  }
`;
```

A full list of imgix parameters can be found [here](https://docs.imgix.com/apis/url).

Although `sizes` is optional, it is highly recommended. It has a default of `(max-width: 8192px) 100vw, 8192px`, which means that it is most likely loading an image too large for your users. Some examples of what you can set sizes as are:

- `500px` - the image is a fixed width. In this case, you should use fixed mode, described in the next section.
- `(min-width: 1140px) 1140px, 100vw` - under 1140px, the image is as wide as the viewport. Above 1140px, it is fixed to 1140px.

<!-- A full example of a fluid image in a working Gatsby repo can be found on CodeSandbox.

[![Edit @imgix/gatsby-transform-url Fluid Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fluid-example-i49fo?fontsize=14&hidenavigation=1&theme=dark) -->

### Fixed Images

The following code will render a fixed image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import gql from 'graphql-tag';
import Img from 'gatsby-image';

export default ({ data }) => {
  return <Img fixed={data.imgixImage.fixed} />;
};

export const query = gql`
  {
    imgixImage(url: "/image.jpg") {
      fixed(
        width: 960 # Width (in px) is required
        imgixParams: {}
      ) {
        ...GatsbySourceImgixFixed
      }
    }
  }
`;
```

A full list of imgix parameters can be found [here](https://docs.imgix.com/apis/url).

<!-- An example of this mode in a full working Gatsby repo can be found on CodeSandbox.

[![Edit @imgix/gatsby-transform-url Fixed Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fixed-example-ce324?fontsize=14&hidenavigation=1&theme=dark) -->

### Generating imgix URLs

If you would rather not use gatsby-image and would instead prefer just a plain imgix URL, you can use the `url` field to generate one. For instance, you could generate a URL and use it for the background image of an element:

```jsx
import gql from 'graphql-tag';

export default ({ data }) => {
  return (
    <div
      style={{
        backgroundImage: `url(${data.imgixImage.url})`,
        backgroundSize: 'contain',
        width: '100vw',
        height: 'calc(100vh - 64px)',
      }}
    >
      <h1>Blog Title</h1>
    </div>
  );
};

export const query = gql`
  {
    imgixImage(url: "/image.jpg") {
      url(imgixParams: { w: 1200, h: 800 })
    }
  }
`;
```

### Using a Web Proxy Source

If you would like to proxy images from another domain, you should set up a [Web Proxy Source](https://docs.imgix.com/setup/creating-sources/web-proxy). After doing this, you can use this source with this plugin as follows:

1. Set the plugin config in `gatsby-config.js` to the following:

```js
module.exports = {
  //...
  plugins: [
    // your other plugins here
    {
      resolve: `@imgix/gatsby-source-url`,
      options: {
        domain: '<your proxy source domain, e.g. my-proxy-source.imgix.net>',
        secureURLToken: '...', // <-- now required, your "Token" from your source page
        defaultImgixParams: ['auto', 'format'],
      },
    },
  ],
};
```

2. Pass a **fully-qualified URL** to the `url` parameter in the GraphQL API. For example, to render a fixed image, a page would look like this:

```jsx
import gql from 'graphql-tag';
import Img from 'gatsby-image';

export default ({ data }) => {
  return <Img fixed={data.imgixImage.fixed} />;
};

export const query = gql`
  {
    imgixImage(url: "https://acme.com/my-image-to-proxy.jpg") {
      # Now this is a full URL
      fixed(
        width: 960 # Width (in px) is required
      ) {
        ...GatsbySourceImgixFixed
      }
    }
  }
`;
```

## URL Transform Function

This features allows imgix urls to be used with gatsby-image. This feature transforms imgix urls into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this feature you can either display images that already exist on imgix, or proxy other images through imgix.

Unfortunately, due to limitations of Gatsby, this feature does not support the placeholder/blur-up feature yet. When Gatsby removes this limitation, we plan to implement this for this feature. In the meantime, our other Gatsby plugins will support blur-up/placeholder images, so if this feature is critical to you, please consider using one of those.

### Basic Fluid Image

The following code will render a fluid image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFluidImageData } from '@imgix/gatsby';

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

[![Edit @imgix/gatsby Fluid Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fluid-example-jxj0b?fontsize=14&hidenavigation=1&theme=dark)

### Basic Fixed Image

The following code will render a fixed image with gatsby-image. This code should already be familiar to you if you've used gatsby-image in the past.

```jsx
import Img from 'gatsby-image';
import { buildFixedImageData } from '@imgix/gatsby';

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

[![Edit @imgix/gatsby Fixed Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/imgixgatsby-transform-url-fixed-example-ce324?fontsize=14&hidenavigation=1&theme=dark)

# API

## GraphQL

The majority of the API for this library can be found by using the GraphiQL inspector (usually at `https://localhost:8000/__graphql`).

### GraphQL Fragments

This library also provides some GraphQL fragments, such as `GatsbySourceImgixFluid`, and `GatsbySourceImgixFluid_noBase64`. The values of these fragments can be found at [fragments.js](./fragments.js)

## Gatsby/Plugin Configuration

The plugin options that can be specified in `gatsby-config.js` are:

| Name                 | Type      | Required | Description                                                                                                                                                     |
| :------------------- | :-------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain`             | `String`  | ✔️       | The imgix domain to use for the image URLs. Usually in the format `.imgix.net`                                                                                  |
| `defaultImgixParams` | `Object`  |          | Imgix parameters to use by default for every image. Recommended to set to `{ auto: ['compress', 'format'] }`.                                                   |
| `disableIxlibParam`  | `Boolean` |          | Set to `true` to remove the `ixlib` param from every request. See [this section](#what-is-the-ixlib-param-on-every-request) for more information.               |
| `secureURLToken`     | `String`  |          | When specified, this token will be used to sign images. Read more about securing images [on the imgix Docs site](https://docs.imgix.com/setup/securing-images). |

## URL Transform Function

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

# What is the `ixlib` Param on Every Request?

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

# Roadmap

**📣 Have your say on our roadmap below!**

Hey there! Thanks for checking out this repository. We are currently deciding on the roadmap for this library, and we'd love your help in showing us what to prioritize, and what you'd like us to build. If you're interested, read on!

Below is a list of issues that contain all the high-level use-cases that we thought apply to Gatbsy developers using imgix. Please check out any issues that are interesting, and **help us decide what to build first by voting on those issues that best fit your use case.**

- [I have an image stored in image manager that I want to render](https://github.com/imgix/gatsby/issues/6)
- [I have an image stored locally that I want to upload to image-manager and render](https://github.com/imgix/gatsby/issues/7)

Other features:

- [I want to have my imgix parameters in my Gatsby/GraphQL query be strongly-typed](https://github.com/imgix/gatsby/issues/5)

# Contributors

Contributions are a vital part of this library and imgix's commitment to open-source. We welcome all contributions which align with this project's goals. More information can be found in the [contributing documentation](CONTRIBUTING.md).

imgix would like to make a special announcement about the prior work of [Angelo Ashmore](https://github.com/angeloashmore) from [Wall-to-Wall Studios](https://www.walltowall.com/) on his gatsby plugin for imgix. The code and API from his plugin has made a significant contribution to the codebase and API for imgix's official plugins, and imgix is very grateful that he agreed to collaborate with us.

<img src="./assets/wall-to-wall-logo.svg" height="100" alt="Wall-to-Wall Studios Logo">
 
<!-- ix-docs-ignore -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/frederickfogerty"><img src="https://avatars0.githubusercontent.com/u/615334?v=4" width="100px;" alt=""/><br /><sub><b>Frederick Fogerty</b></sub></a><br /><a href="https://github.com/imgix/gatsby/commits?author=frederickfogerty" title="Code">💻</a> <a href="https://github.com/imgix/gatsby/commits?author=frederickfogerty" title="Documentation">📖</a> <a href="#maintenance-frederickfogerty" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://angeloashmore.github.io"><img src="https://avatars2.githubusercontent.com/u/8601064?v=4" width="100px;" alt=""/><br /><sub><b>Angelo Ashmore</b></sub></a><br /><a href="https://github.com/imgix/gatsby/commits?author=angeloashmore" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.

<!-- /ix-docs-ignore -->

# License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Fgatsby.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Fgatsby?ref=badge_large)
