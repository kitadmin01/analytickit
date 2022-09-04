# AnalyticKit Browser JS Library

[![npm package](https://img.shields.io/npm/v/analytickit-js?style=flat-square)](https://www.npmjs.com/package/analytickit-js)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Please see [AnalyticKit Docs](https://analytickit.com/docs).
Specifically, [browser JS library details](https://analytickit.com/docs/libraries/js).

## Testing

Unit tests: run `yarn test`.
Cypress: run `yarn serve` to have a test server running and separately `yarn cypress` to launch Cypress test engine.

### Running TestCafe E2E tests with BrowserStack

Testing on IE11 requires a bit more setup.

1. Run `analytickit` locally on port 8000 (`DEBUG=1 TEST=1 ./bin/start`).
2. Run `python manage.py setup_dev --no-data` on analytickit repo, which sets up a demo account.
3. Optional: rebuild array.js on changes: `nodemon -w src/ --exec bash -c "yarn build-rollup"`.
4. Export browserstack credentials: `export BROWSERSTACK_USERNAME=xxx BROWSERSTACK_ACCESS_KEY=xxx`.
5. Run tests: `npx testcafe "browserstack:ie" testcafe/e2e.spec.js`.

### Tiers of testing

1. Unit tests - this verifies the behavior of the library in bite-sized chunks. Keep this coverage close to 100%, test corner cases and internal behavior here
2. Cypress tests - integrates with a real chrome browser and is capable of testing timing, browser requests, etc. Useful for testing high-level library behavior, ordering and verifying requests. We shouldn't aim for 100% coverage here as it's impossible to test all possible combinations.
3. TestCafe E2E tests - integrates with a real analytickit instance sends data to it. Hardest to write and maintain - keep these very high level

## Developing together with another repo

### Using Yarn link
Use [`yarn link`](https://classic.yarnpkg.com/en/docs/cli/link/). Run `yarn link` in `analytickit-js`, and then `yarn link analytickit-js` in `analytickit`. Once you're done, remember to `yarn unlink analytickit-js` in `analytickit`, and `yarn unlink` in `analytickit-js`.

An alternative is to update dependency in package.json to e.g. `"analytickit-js": "link:../analytickit-js"`, `yarn` and run `yarn build && yarn build-module`

#### Developing with main AnalyticKit repo

The `analytickit-js` snippet for a website loads static js from the main `AnalyticKit/analytickit` repo. Which means, when testing the snippet with a website, there's a bit of extra setup required:

1. Run `AnalyticKit/analytickit` locally
2. Link the `analytickit-js` dependency to your local version (see above)
3. Run `yarn serve` in `analytickit-js`. (This ensures `dist/array.js` is being generated)
4. In your locally running `AnalyticKit/analytickit` build, run `yarn copy-scripts`. (This copies the scripts generated in step 3 to the static assets folder for `AnalyticKit/analytickit`)

Further, it's a good idea to modify `start-http` script to add development mode: `webpack serve --mode development`, which doesn't minify the resulting js (which you can then read in your browser).

### Using Yalc (Alternative to yarn link)

Run `npm install -g yalc`

* In the analytickit-js repo
    * Run `yalc publish`
* In the analytickit repo
    * Run `yalc add analytickit-js`
    * Run `yarn`
    * Run `yarn copy-scripts`

#### When making changes

* In the analytickit-js repo
    * Run `yalc publish`
* In the analytickit repo
    * Run `yalc update`
    * Run `yarn`
    * Run `yarn copy-scripts`

#### To remove the local package

* In the analytickit repo
    * run `yalc remove analytickit-js`
    * run `yarn install`


## Releasing a new version

Just bump up `version` in `package.json` on the main branch and the new version will be published automatically,
with a matching PR in the [main AnalyticKit repo](https://github.com/analytickit/analytickit) created.

It's advised to use `bump patch/minor/major` label on PRs - that way the above will be done automatically
when the PR is merged.

Courtesy of GitHub Actions.

### Manual steps

To release a new version, make sure you're logged into npm (`npm login`).

We tend to follow the following steps:

1. Merge your changes into master.
2. Release changes as a beta version:
    - `npm version 1.x.x-beta.0`
    - `npm publish --tag beta`
    - `git push --tags`
3. Create a PR linking to this version in the [main AnalyticKit repo](https://github.com/analytickit/analytickit).
4. Once deployed and tested, write up CHANGELOG.md, and commit.
5. Release a new version:
    - `npm version 1.x.x`
    - `npm publish`
    - `git push --tags`
6. Create a PR linking to this version in the [main AnalyticKit repo](https://github.com/analytickit/analytickit).

## Questions?

### [Join our Slack community.](https://analytickit.com/slack)
