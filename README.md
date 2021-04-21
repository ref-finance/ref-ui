# ref-ui

This is the front-end for [ref.finance](https://app.ref.finance).

## Quick Start

To run this project locally:

1. Prerequisites: Make sure you've installed [Node.js] ≥ 12
2. Install dependencies: `yarn`
3. Run the local development server connected to `testnet`: `yarn start` (see `package.json` for a full list of `scripts` you can run with `yarn`)

## Architecture

This project consists of three layers:

1. `services` is where communication (via the NEAR RPC API) to smart contracts happen.
2. `state` is where the services are used and connected to react state management
3. `components` and `pages` is where the view is created

## Tests

Tests use [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) and can be run with `yarn test`.

## Code Formatting

This project uses [Prettier](https://prettier.io/) to create consistently styled code.
Prettier can be installed to auto-format on save for most editors. You can also run
`yarn prettier` to check for styling errors and `yarn prettier:fix` to fix styling errors.
