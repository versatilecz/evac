# frontend

Basic template

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Run End-to-End Tests with [Nightwatch](https://nightwatchjs.org/)

```sh
# When using CI, the project must be built first.
yarn build

# Runs the end-to-end tests
yarn test:e2e
# Runs the tests only on Chrome
yarn test:e2e -- --env chrome
# Runs the tests of a specific file
yarn test:e2e -- tests/e2e/example.js
# Runs the tests in debug mode
yarn test:e2e -- --debug
```
    
### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```
