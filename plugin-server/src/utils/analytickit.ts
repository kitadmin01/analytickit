import AnalyticKit from 'analytickit-node'

export const analytickit = new AnalyticKit('sTMFPsFhdP1Ssg', {
    host: 'https://app.analytickit.com',
})

if (process.env.NODE_ENV === 'test') {
    analytickit.disable()
}
