<!-- ix-docs-ignore -->

![imgix logo](https://assets.imgix.net/sdk-imgix-logo.svg)

`@imgix/gatsby-source-url` is a library to transform [imgix](https://www.imgix.com/) urls to a format compatible with gatsby-image.

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
- [Get Started](#get-started)
- [Contributors](#contributors)


<!-- prettier-ignore-end -->

# About This Library

This library can be best thought about as a part-replacement for gatsby-image-sharp, and allows imgix urls to be used with gatsby-image through the Gatsby GraphQL API. This library transforms imgix urls into a format that is compatible with gatsby-image. This can generate either fluid or fixed images. With this library you can either display images that already exist on imgix, or proxy other images through imgix.

This library supports many of the existing gatsby-image GraphQL that you know and love, and also supports most of the features of gatsby-image, such as blur-up and lazy loading. It also brings all of the great features of imgix, including the extensive image transformations and optimisations, as well as the excellent imgix CDN.

# Get Started

Firstly, this library requires an imgix account, so please follow this [quick start guide](https://docs.imgix.com/setup/quick-start) if you don't have an account.

Then, install this library with the following commands, depending on your package manager.

- **NPM**: `npm install @imgix/gatsby-source-url`
- **Yarn**: `yarn add @imgix/gatsby-source-url`

# Contributors

imgix would like to make a special announcement about the prior work of [Angelo Ashmore](https://github.com/angeloashmore) from [Wall-to-Wall Studios](https://www.walltowall.com/) on his gatsby plugin for imgix. The code and API from his plugin has made a significant contribution to the codebase and API for imgix's official plugins, and imgix is very grateful that he agreed to collaborate with us.

<img src="./assets/wall-to-wall-logo.svg" height="100" alt="Wall-to-Wall Studios Logo">
