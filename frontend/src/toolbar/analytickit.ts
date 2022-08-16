importanalytickitfrom'analytickit-js-lite'

const runningOnanalytickit = !!window.analytickit_APP_CONTEXT
const apiKey = runningOnanalytickit ? window.JS_analytickit_API_KEY : 'sTMFPsFhdP1Ssg'
const apiHost = runningOnanalytickit ? window.JS_analytickit_HOST : 'https://app.analytickit.com'

export const analytickit = new analytickit(apiKey, {
host: apiHost,
enable: false, // must call.optIn() before any events are sent
    persistence: 'memory', // We don't want to persist anything, all events are in-memory
    persistence_name: apiKey + '_toolbar', // We don't need this but it ensures we don't accidentally mess with the standard persistence
})

if (runningOnanalytickit && window.JS_analytickit_SELF_CAPTURE) {
    analytickit.debug()
}
