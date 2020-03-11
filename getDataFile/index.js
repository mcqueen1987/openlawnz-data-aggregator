const constants = require('../constants')
const legislation = require('../models/legislation')
const helpers = require('../common/functions')
const MOJconstants = require('../constants/MOJresponse')
const jdocases = require('./jdoCases')

const casesonlyerror = 'You can only request cases from the MOJ.'

module.exports = async (pgPool, pgPromise, dataSource, dataLocation, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource")
    }
    let unformatted;

    switch (dataSource) {
        case constants.mojtype:
            if(datatype !== constants.casesname) {
                throw new Error(casesonlyerror)
            }
            console.log(`aggregating ${constants.mojtype}...`)
            unformatted = await require("./jdoCases").run()
            return choosecasesorlegislation(datatype, unformatted)

        case constants.pcotype:
            if (!process.env.APIFY_TASK_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables")
            }

            if(datatype !== constants.legislationname) {
                throw new Error('You can only request legislation from the PCO.')
            }
            console.log(`aggregating ${constants.pcotype}...`)
            unformatted = await require("./pcoLegislation").run()
            return choosecasesorlegislation(datatype, unformatted)

        case constants.urltype:
            checklocation(dataLocation)
            console.log(`aggregating ${constants.urltype}...`)
            unformatted = await require("./generic/url")(dataLocation)
            console.log(`${constants.urltype} response received...`)
            return choosecasesorlegislation(datatype, unformatted)

        case constants.localfiletype:
            checklocation(dataLocation)
            console.log(`aggregating ${constants.localfiletype}...`)
            unformatted = await require("./generic/localfile")(dataLocation)
            return choosecasesorlegislation(datatype, unformatted)

        case constants.TTtype:
            if(datatype !== constants.casesname) {
                throw new Error(casesonlyerror)
            }
            console.log(`aggregating ${constants.TTtype}...`)
            unformatted = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize)
            return unformatted

        default:
            throw new Error('Incorrect datasource specified.')
    }
    
}

function checklocation(dataLocation) {
    if (!dataLocation) {
        throw new Error("Missing datalocation")
    }
}

function choosecasesorlegislation(datatype, unformattedresponse) {
    switch(datatype) {
        case constants.casesname:
            let output = unformattedresponse

            try {
                let responseisfound = helpers.isnullorundefined(unformattedresponse['response']) === false
                let docsarefound = helpers.isnullorundefined(unformattedresponse.response['docs']) === false
                let isnotflat = responseisfound && docsarefound

                if(isnotflat === true) {
                    output = helpers.getNestedObject(unformattedresponse, MOJconstants.flattenedarraypath)
                }
            }

            catch(error) {}
            return jdocases.maparraytocases(output)

        case constants.legislationname:
            return legislation.maparraytolegislation(unformattedresponse)

        default:
            throw new Error('invalid data type for URL aggregation.')
    }
}

