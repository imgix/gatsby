<!-- ix-docs-ignore -->

![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`@imgix/gatsby-source-url` is a library to transform [imgix](https://www.imgix.com/) URLs to a format compatible with gatsby-image.

[![npm version](https://img.shields.io/npm/v/@imgix/gatsby-source-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-source-url)
[![Build Status](https://travis-ci.org/imgix/gatsby.svg?branch=main)](https://travis-ci.org/imgix/gatsby)
[![Downloads](https://img.shields.io/npm/dm/@imgix/gatsby-source-url.svg)](https://www.npmjs.com/package/@imgix/gatsby-source-url)
[![License](https://img.shields.io/npm/l/@imgix/gatsby-source-url)](https://github.com/imgix/@imgix/gatsby-source-url/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fimgix%2Fgatsby.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fimgix%2Fgatsby?ref=badge_shield)
[![Dependencies Status](https://david-dm.org/imgix/@imgix/gatsby-source-url.svg)](https://david-dm.org/imgix/@imgix/gatsby-source-url)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

---

<!-- /ix-docs-ignore -->

<!-- NB: Run `npx markdown-toc README.md --maxdepth 4 | sed -e 's/[[:space:]]\{2\}/    /g' | pbcopy` to generate TOC and copy to clipboard :) -->

<!-- prettier-ignore-start -->

- [About This Library](#about-this-library)
- [Why use imgix instead of gatsby-transform-sharp?](#why-use-imgix-instead-of-gatsby-transform-sharp)
- [Get Started](#get-started)
    * [Configuration](#configuration)
- [Usage](#usage)
    * [Fluid Images](#fluid-images)
    * [Fixed Images](#fixed-images)
    * [Using a Web Proxy Source](#using-a-web-proxy-source)
- [API](#api)
    * [GraphQL](#graphql)
        + [GraphQL Fragments](#graphql-fragments)
    * [Gatsby/Plugin Configuration](#gatsbyplugin-configuration)
- [What is the `ixlib` Param on Every Request?](#what-is-the-ixlib-param-on-every-request)
- [Contributors](#contributors)

<!-- prettier-ignore-end -->

# About This Library

This library can be best thought about as a part-replacement for gatsby-image-sharp, and allows imgix URLs to be used with gatsby-image through the Gatsby GraphQL API. This library transforms imgix URLs into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this library you can either display images that already exist on imgix, or proxy other images through imgix.

This library supports many of the existing gatsby-image GraphQL that you know and love, and also supports most of the features of gatsby-image, such as blur-up and lazy loading. It also brings all of the great features of imgix, including the extensive image transformations and optimisations, as well as the excellent imgix CDN.

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

- **NPM**: `npm install @imgix/gatsby-source-url`
- **Yarn**: `yarn add @imgix/gatsby-source-url`

## Configuration

This source must be configured in your `gatsby-config` file as follows:

```js
module.exports = {
  //...
  plugins: [
    // your other plugins here
    {
      resolve: `@imgix/gatsby-source-url`,
      options: {
        domain: '<your imgix domain, e.g. acme.imgix.net>',
        defaultImgixParams: ['auto', 'format'],
      },
    },
  ],
};
```

Setting `auto: ['format', 'compress']` is highly recommended. This will re-format the image to the format that is best optimized for your browser, such as WebP. It will also reduce unnecessary wasted file size, such as transparency on a non-transparent image. More information about the auto parameter can be found [here](https://docs.imgix.com/apis/url/auto/auto).

# Usage

## Fluid Images

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

## Fixed Images

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

## Generating imgix URLs

If you would rather not use gatsby-image and would instead prefer just a plain imgix url, you can use the `url` field to generate one. For instance, you could generate a url and use it for the background image of an element:

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

## Using a Web Proxy Source

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

# What is the `ixlib` Param on Every Request?

For security and diagnostic purposes, we tag all requests with the language and version of library used to generate the URL.

To disable this, set `disableIxlibParam` to `true` in the plugin configuration options.

```js
// gatsby-config.js
module.exports = {
  //...
  plugins: [
    // your other plugins here
    {
      resolve: `@imgix/gatsby-source-url`,
      options: {
        domain: '<your imgix domain, e.g. acme.imgix.net>',
        disableIxlibParam: true, // <-- set this to true
      },
    },
  ],
};
```

# Contributors

imgix would like to make a special announcement about the prior work of [Angelo Ashmore](https://github.com/angeloashmore) from [Wall-to-Wall Studios](https://www.walltowall.com/) on his gatsby plugin for imgix. The code and API from his plugin has made a significant contribution to the codebase and API for imgix's official plugins, and imgix is very grateful that he agreed to collaborate with us.

<img src="./assets/wall-to-wall-logo.svg" height="100" alt="Wall-to-Wall Studios Logo">
