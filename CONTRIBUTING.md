# Contributing

Contributions are a vital part of this library and imgix's commitment to open-source. We welcome all contributions which align with this project's goals. All we ask is that you please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of
the developers managing and developing this open source project. In return,
they should reciprocate that respect in addressing your issue or assessing
patches and features.

<!-- NB: Run `npx markdown-toc CONTRIBUTING.md | pbcopy` to generate TOC :) -->

<!-- prettier-ignore-start -->

- [Contributing](#contributing)

  - [Project Goals](#project-goals)
  - [Using the issue tracker](#using-the-issue-tracker)
  - [Development](#development)
  - [Publishing](#publishing)
  - [Code Conventions](#code-conventions)
  - [Project setup](#project-setup)
  - [Build the entire project](#build-the-entire-project)
  - [Build the entire project, and watch for changes](#build-the-entire-project-and-watch-for-changes)
  - [Run the tests](#run-the-tests)
  - [Lints and fixes files](#lints-and-fixes-files)

<!-- prettier-ignore-end -->

## Project Goals

- Well-tested and high quality code.
- The public API should be handled with care because a) once an API is submitted, we are committed to supporting it for a reasonable amount of time, and b) any changes to the API creates exponentially more work for the users of our libraries.

## Using the issue tracker

The issue tracker is the preferred channel for [bug reports](#bugs),
[features requests](#features), questions, and [submitting pull
requests](#pull-requests), but please respect the following restrictions:

- Please **do not** derail or troll issues. Keep the discussion on topic and respect the opinions of others.

## Development

The development of this library follows standard TDD practices. You can run the tests in TDD mode with `yarn tdd` from the root.

## Publishing

1. Bump the versions of relevant packages with `npx lerna version --no-push`. Do NOT push to GH yet.
2. Update the version in packages/gatsby-transform-url/src/index.ts and commit with --amend.
3. Move the git tags to the new commit
4. Run `yarn build && npx lerna publish from-git` from root.

Publish stable versions from main, and prerelease versions from beta.

## Code Conventions

1.  Make all changes to files under `./src`, **not** `./dist` or `./es`.
2.  Use [Prettier](https://prettier.io/) for code formatting. Code will automatically be formatted upon submitting a PR.
3.  Every commit must follow the [conventional commit specification](https://www.conventionalcommits.org/en/v1.0.0-beta.2/).

## Project setup

1. Run `yarn` to install dependencies
2. Add a .env file to the root of the project with the contents from "Gatsby .env file" in 1Password.

## Build the entire project

```
yarn build
```

## Build the entire project, and watch for changes

```
yarn build:watch
```

## Run the tests

```
yarn test
```

## Lints and fixes files

```
yarn lint
```
