## AnalyticKit Plugin Scaffold

[![npm package](https://img.shields.io/npm/v/@analytickit/plugin-scaffold?style=flat-square)](https://www.npmjs.com/package/@analytickit/plugin-scaffold)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

This project contains shared typescript types that AnalyticKit plugin
authors can use.

```bash
# if using yarn
yarn add --dev @analytickit/plugin-scaffold

# if using npm
npm install --save-dev @analytickit/plugin-scaffold
``` 

Then in your plugins:

```typescript
import { PluginEvent, PluginInput, PluginMeta } from "@analytickit/plugin-scaffold";

export function processEvent(event: PluginEvent, meta: PluginMeta<PluginInput>) {
    if (event.properties) {
        event.properties['hello'] = 'world'
    }
    return event
}
```

## Releasing a new version

It's magic! Just bump up `version` in `package.json` on the main branch and the new version will be published automatically, on GitHub and on npm. Courtesy of GitHub Actions.

## Questions?

### [Join our Slack community.](https://join.slack.com/t/analytickitusers/shared_invite/enQtOTY0MzU5NjAwMDY3LTc2MWQ0OTZlNjhkODk3ZDI3NDVjMDE1YjgxY2I4ZjI4MzJhZmVmNjJkN2NmMGJmMzc2N2U3Yjc3ZjI5NGFlZDQ)


