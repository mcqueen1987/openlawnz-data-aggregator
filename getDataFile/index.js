const constants = require('../constants');
const legislation = require('../models/legislation');
const helpers = require('../common/functions');
const MOJconstants = require('../constants/MOJresponse');
const jdocases = require('./jdoCases');

const casesonlyerror = 'You can only request cases from that datasource.';

module.exports = async (pgPool, pgPromise, dataSource, resourceLocator, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource");
    }
    let unformatted;

    switch (dataSource) {
        case constants.mojType:
            if(datatype !== constants.casesName) {
                throw new Error(casesonlyerror);
            }
            console.log(`aggregating ${constants.mojType}...`);
            unformatted = await require("./jdoCases").run();
            return choosecasesorlegislation(datatype, unformatted);

        case constants.pcoType:
            if (!process.env.APIFY_TASK_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables");
            }

            if(datatype !== constants.legislationName) {
                throw new Error('You can only request legislation from the PCO.');
            }
            console.log(`aggregating ${constants.pcoType}...`);
            unformatted = await require("./pcoLegislation").run();
            return choosecasesorlegislation(datatype, unformatted);

        case constants.urlType:
            checklocation(resourceLocator);
            console.log(`aggregating ${constants.urlType}...`);
            unformatted = await require("./generic/url")(resourceLocator);
            console.log(`${constants.urlType} response received...`);
            return choosecasesorlegislation(datatype, unformatted);

        case constants.localFileType:
            checklocation(resourceLocator);
            console.log(`aggregating ${constants.localFileType}...`);
            unformatted = await require("./generic/localfile")(resourceLocator);
            return choosecasesorlegislation(datatype, unformatted);

        case constants.TTtype:
            if(datatype !== constants.casesName) {
                throw new Error(casesonlyerror);
            }
            console.log(`aggregating ${constants.TTtype}...`);
            unformatted = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize);
            return unformatted;

        default:
            throw new Error('Incorrect datasource specified.');
    }
    
};

function checklocation(dataLocation) {
    if (!dataLocation) {
        throw new Error("Missing datalocation");
    }
}

function choosecasesorlegislation(datatype, unformattedresponse) {
    switch(datatype) {
        case constants.casesName:
            let output = unformattedresponse;

            try {
                let responseisfound = helpers.isNullOrUndefined(unformattedresponse['response']) === false;
                let docsarefound = helpers.isNullOrUndefined(unformattedresponse.response['docs']) === false;
                let isnotflat = responseisfound && docsarefound;

                if(isnotflat === true) {
                    output = helpers.getNestedObject(unformattedresponse, MOJconstants.flattenedarraypath);
                }
            }

            catch(error) {}
            return jdocases.maparraytocases(output);

        case constants.legislationName:
            return legislation.mapArrayToLegislation(unformattedresponse);

        default:
            throw new Error('invalid data type for URL aggregation.');
    }
}

