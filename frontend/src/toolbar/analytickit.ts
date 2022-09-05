import AnalyticKit from 'analytickit-js-lite/analytickit-web'

const runningOnAnalytickit = !!window.analytickit_APP_CONTEXT
const apiKey = runningOnAnalytickit ? window.JS_ANALYTICKIT_API_KEY : 'sTMFPsFhdP1Ssg'
const apiHost = runningOnAnalytickit ? window.JS_ANALYTICKIT_HOST : 'https://app.analytickit.com'

export const analytickit = new AnalyticKit(apiKey, {
    host: apiHost,
    enable: false, // must call.optIn() before any events are sent
    persistence: 'memory', // We don't want to persist anything, all events are in-memory
    persistence_name: apiKey + '_toolbar', // We don't need this but it ensures we don't accidentally mess with the standard persistence
})

if (runningOnAnalytickit && window.JS_ANALYTICKIT_SELF_CAPTURE) {
    analytickit.debug()
}
