const constants = require('../constants')

module.exports = async (pgPool, pgPromise, dataSource, dataLocation, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource")
    }
    let unformatted;

    switch (dataSource) {
        case constants.mojtype:
            if(datatype !== constants.casesname) {
                throw new Error('You can only request cases from the MOJ.')
            }
            unformatted = await require("./jdoCases")()
            break

        case constants.pcotype:
            if (!process.env.APIFY_TASK_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables")
            }

            if(datatype !== constants.legislationname) {
                throw new Error('You can only request legislation from the PCO.')
            }
            unformatted = await require("./pcoLegislation")()
            break

        case constants.urltype:
            checklocation()
            unformatted = await require("./generic/url")(dataLocation)
            break

        case constants.localfiletype:
            checklocation()
            unformatted = await require("./generic/localfile")(dataLocation)
            break

        case constants.TTtype:
            unformatted = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize)
            break

        default:
            throw new Error('Incorrect datasource specified.')
    }
    return choosecasesorlegislation(datatype, unformatted)
}

function checklocation() {
    if (!dataLocation) {
        throw new Error("Missing datalocation")
    }
}

function choosecasesorlegislation(datatype, unformattedresponse) {
    switch(datatype) {
        case constants.casesname:
            return casesmodel.maparraytocases(json)

        case constants.legislationname:
            return legislation.maparraytolegislation(json)

        default:
            throw new Error('invalid data type for URL aggregation.')
    }
}