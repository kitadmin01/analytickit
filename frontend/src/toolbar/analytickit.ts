import { browserAnalyticKit } from 'analytickit-js-lite/dist/src/targets/browser'

const apiKey = 'sTMFPsFhdP1Ssg'
const apiHost = 'https://dpa.analytickit.com'

export const analytickit = browserAnalyticKit(apiKey, {
    apiHost: apiHost,
    optedIn: false, // must call .optIn() before any events are sent
})
