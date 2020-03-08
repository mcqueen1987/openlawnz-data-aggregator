const constants = require('../constants')

module.exports = async (pgPool, pgPromise, dataSource, dataLocation, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource")
    }
    let retData
    switch (dataSource) {
        case 'moj':
            if(datatype !== constants.casesname) {
                throw new Error('You can only request cases from the MOJ.')
            }
            retData = await require("./jdoCases")()
            break
        case 'pco':
            if (!process.env.APIFY_USER_ID || !process.env.APIFY_CRAWLER_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables")
            }

            if(datatype !== constants.legislationname) {
                throw new Error('You can only request legislation from the PCO.')
            }
            retData = await require("./pcoLegislation")()
            break
        case 'url':
            checklocation()
            retData = await require("./generic/url")(dataLocation)
            break
        case 'localfile':
            checklocation()
            retData = await require("./generic/localfile")(dataLocation)
            break
        case 'tt':
            retData = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize)
            break
        default:
            try {
                retData = JSON.stringify(JSON.parse(dataSource))
            } catch (ex) {
                throw ex
            }
    }
    return retData
}

function checklocation() {
    if (!dataLocation) {
        throw new Error("Missing datalocation")
    }
}
