const urlAdapter = require("./generic/url")
const legislation = require('../models/legislation')

const run = async () => {

    try {

        const jsonURL = [
            `https://api.apify.com/v1/${process.env.APIFY_USER_ID}`,
            `/crawlers/${process.env.APIFY_CRAWLER_ID}`,
            `/lastExec/results?token=${process.env.APIFY_TOKEN}`
        ].join("")

        const apifyData = await urlAdapter(jsonURL)

        const allLegislation = Array.prototype.concat.apply(
            [],
            apifyData.map(item => {
                return new legislation.construct(
                    link = item.link,
                    year = item.year,
                    title = item.title,
                    alerts = item.alerts,
                    date_accessed = Date())
            })
        )

        return allLegislation
    } catch (ex) {
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
