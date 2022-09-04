import analytickit from 'analytickit-node'

export const analytickit = new analytickit('sTMFPsFhdP1Ssg', {
host: 'https://app.analytickit.com',
})

if(process.env.NODE_ENV === 'test') {
    analytickit.disable()
}
