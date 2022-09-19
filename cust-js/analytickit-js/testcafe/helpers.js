import fs from 'fs'
import path from 'path'
import { RequestLogger, RequestMock, ClientFunction } from 'testcafe'
import fetch from 'node-fetch'

// NOTE: These tests are run against a dedicated test project in AnalyticKit cloud
// but can be overridden to call a local API when running locally
const { ANALYTICKIT_API_KEY } = process.env
const ANALYTICKIT_API_HOST = process.env.ANALYTICKIT_API_HOST || 'https://app.analytickit.com'
const ANALYTICKIT_API_PROJECT = process.env.ANALYTICKIT_API_PROJECT || '11213'

const HEADERS = { Authorization: `Bearer ${ANALYTICKIT_API_KEY}` }

export const captureLogger = RequestLogger(/ip=1/, {
    logRequestHeaders: true,
    logRequestBody: true,
    logResponseHeaders: true,
    logResponseBody: true,
    stringifyRequestBody: true,
    stringifyResponseBody: true,
})

export const staticFilesMock = RequestMock()
    .onRequestTo(/array.js/)
    .respond((req, res) => {
        const arrayjs = fs.readFileSync(path.resolve(__dirname, '../dist/array.js'))
        res.setBody(arrayjs)
    })
    .onRequestTo(/playground/)
    .respond((req, res) => {
        const html = fs.readFileSync(path.resolve(__dirname, '../playground/cypress/index.html'))
        res.setBody(html)
    })

export const initAnalytickit = (config) => {
    return ClientFunction((configParams = {}) => {
        var testSessionId = Math.round(Math.random() * 10000000000).toString()
        configParams.debug = true
        window.analytickit.init(configParams.api_key, configParams)
        window.analytickit.register({
            testSessionId,
        })

        return testSessionId
    })({
        ...config,
        api_host: process.env.ANALYTICKIT_API_HOST || 'https://app.analytickit.com',
        api_key: process.env.ANALYTICKIT_PROJECT_KEY,
    })
}

export async function retryUntilResults(operation, target_results, limit = 100) {
    const attempt = (count, resolve, reject) => {
        if (count === limit) {
            return reject(new Error(`Failed to fetch results in ${limit} attempts`))
        }

        setTimeout(() => {
            operation()
                .then((results) =>
                    results.length >= target_results ? resolve(results) : attempt(count + 1, resolve, reject)
                )
                .catch(reject)
        }, 600)
    }

    return new Promise((...args) => attempt(0, ...args))
}

export async function queryAPI(testSessionId) {
    const url = `${ANALYTICKIT_API_HOST}/api/projects/${ANALYTICKIT_API_PROJECT}/events?properties=[{"key":"testSessionId","value":["${testSessionId}"],"operator":"exact","type":"event"}]`
    const response = await fetch(url, {
        headers: HEADERS,
    })

    const data = await response.text()

    if (!response.ok) {
        console.error("Bad Response", response.status, data)
        throw new Error("Bad Response")
    }

    const { results } = JSON.parse(data)
    return results
}
