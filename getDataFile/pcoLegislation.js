const urlAdapter = require("./generic/url")
const legislation = require('../models/legislation')

function getURL(){
    return [
        `https://api.apify.com/v2/actor-tasks/${process.env.APIFY_TASK_ID}`,
        `/runs/last/dataset/items`,
        `?token=${process.env.APIFY_TOKEN}`,
        `&format=json`,
        `&simplified=true`
    ].join("")
}

module.exports.URL = getURL

const run = async () => {

    try {
        let url = getURL()
        const apifyData = await urlAdapter(url)
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
    module.exports.run = run
}
