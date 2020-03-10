const urlAdapter = require("./generic/url")
const legislation = require('../models/legislation')

const run = async () => {

    try {

        const jsonURL = [
            `https://api.apify.com/v2/actor-tasks/${process.env.APIFY_TASK_ID}`,
            `/runs/last/dataset/items`,
            `?token=${process.env.APIFY_TOKEN}`,
            `&format=json`,
            `&simplified=true`
        ].join("")

        const apifyData = await urlAdapter(jsonURL)
        return apifyData
    } 
    
    catch (ex) {
        throw ex
    }
}

if (require.main === module) {
    try {
        run()
    } catch (ex) {
        console.log(ex)
    }
} else {
    module.exports = run
}
