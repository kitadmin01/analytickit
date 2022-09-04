import AnalyticKit from 'analytickit-js-lite'

const runningOnAnalyticKit = !!window.analytickit_APP_CONTEXT
const apiKey = runningOnAnalyticKit ? window.JS_analytickit_API_KEY : 'sTMFPsFhdP1Ssg'
const apiHost = runningOnAnalyticKit ? window.JS_analytickit_HOST : 'https://app.analytickit.com'

export const analytickit = new AnalyticKit(apiKey, {
host: apiHost,
enable: false, // must call.optIn() before any events are sent
    persistence: 'memory', // We don't want to persist anything, all events are in-memory
    persistence_name: apiKey + '_toolbar', // We don't need this but it ensures we don't accidentally mess with the standard persistence
})

if (runningOnanalytickit && window.JS_analytickit_SELF_CAPTURE) {
    analytickit.debug()
}
