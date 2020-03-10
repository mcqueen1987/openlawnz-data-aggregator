const constants = require('../constants')

module.exports = async (pgPool, pgPromise, dataSource, dataLocation, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource")
    }
    let retData
    switch (dataSource) {
        case constants.mojtype:
            if(datatype !== constants.casesname) {
                throw new Error('You can only request cases from the MOJ.')
            }
            retData = await require("./jdoCases")()
            break
        case constants.pcotype:
            if (!process.env.APIFY_TASK_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables")
            }

            if(datatype !== constants.legislationname) {
                throw new Error('You can only request legislation from the PCO.')
            }
            retData = await require("./pcoLegislation")()
            break
        case constants.urltype:
            checklocation()
            retData = await require("./generic/url")(dataLocation)
            break
        case constants.localfiletype:
            checklocation()
            retData = await require("./generic/localfile")(dataLocation)
            break
        case constants.TTtype:
            retData = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize)
            break
        default:
            throw new Error('Incorrect datasource specified.')
    }
    return retData
}

function checklocation() {
    if (!dataLocation) {
        throw new Error("Missing datalocation")
    }
}
