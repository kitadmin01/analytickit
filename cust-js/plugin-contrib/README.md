## analytickit Plugin Contrib

[![npm package](https://img.shields.io/npm/v/@analytickit/plugin-contrib?style=flat-square)](https://www.npmjs.com/package/@analytickit/plugin-contrib)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)

This project contains shared code that analytickit plugin authors can use.

Code imported from this package runs outside the plugin virtual machine, and can thus use timeouts and other NodeJS features.

## Included in this package

### Batch processing

```typescript
import { createBuffer } from '@analytickit/plugin-contrib'
import fetch from 'node-fetch'

export function setupPlugin({ global }) {
    global.buffer = createBuffer({
        limit: 10 * 1024 * 1024, // 10 MB
        timeoutSeconds: 10 * 60, // 10 minutes
        onFlush: async (batch) => {
            const resp = await fetch('https://httpbin.org/post', {
                method: 'post',
                body: JSON.stringify(batch),
                headers: { 'Content-Type': 'application/json' },
            })
            const json = await resp.json()
            if (!json.success) {
                // retry somehow?
            }
        },
    })
}

export function teardownPlugin({ global }) {
    global.buffer.flush()
}

export function processEvent(event, { config, global }) {
    global.buffer.add(event, JSON.stringify(event).length) // add(object, points)
    return event
}
```

## Releasing a new version

It's magic! Just bump up `version` in `package.json` on the main branch and the new version will be published automatically, on GitHub and on npm. Courtesy of GitHub Actions.

## Questions?

### [Join our Slack community.](https://join.slack.com/t/analytickitusers/shared_invite/enQtOTY0MzU5NjAwMDY3LTc2MWQ0OTZlNjhkODk3ZDI3NDVjMDE1YjgxY2I4ZjI4MzJhZmVmNjJkN2NmMGJmMzc2N2U3Yjc3ZjI5NGFlZDQ)
