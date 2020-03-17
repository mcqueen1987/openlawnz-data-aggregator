const constants = require('../constants');
const legislation = require('../models/legislation');
const helpers = require('../common/functions');
const MOJconstants = require('../constants/MOJresponse');
const jdoCases = require('./jdoCases');
const envConsts = require('../constants/environment');

const casesOnlyError = 'You can only request cases from that datasource.';

module.exports = async (pgPool, pgPromise, dataSource, resourceLocator, datatype, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource");
    }
    let unformatted;

    switch (dataSource) {
        case constants.mojType:
            if(datatype !== constants.casesName) {
                throw new Error(casesOnlyError);
            }
            console.log(`aggregating ${constants.mojType}...`);
            unformatted = await require("./jdoCases").run();
            return chooseCasesOrLegislation(datatype, unformatted);

        case constants.pcoType:
            if (!process.env[envConsts.apifyTaskId] || !process.env[envConsts.apifyToken]) {
                throw new Error("Missing Apify env variables");
            }

            if(datatype !== constants.legislationName) {
                throw new Error('You can only request legislation from the PCO.');
            }
            console.log(`aggregating ${constants.pcoType}...`);
            unformatted = await require("./pcoLegislation").run();
            return chooseCasesOrLegislation(datatype, unformatted);

        case constants.urlType:
            checkLocation(resourceLocator);
            console.log(`aggregating ${constants.urlType}...`);
            unformatted = await require("./generic/url")(resourceLocator);
            console.log(`${constants.urlType} response received...`);
            return chooseCasesOrLegislation(datatype, unformatted);

        case constants.localFileType:
            checkLocation(resourceLocator);
            console.log(`aggregating ${constants.localFileType}...`);
            unformatted = await require("./generic/localfile")(resourceLocator);
            return chooseCasesOrLegislation(datatype, unformatted);

        case constants.TTtype:
            if(datatype !== constants.casesName) {
                throw new Error(casesOnlyError);
            }
            console.log(`aggregating ${constants.TTtype}...`);
            unformatted = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize);
            return unformatted;

        default:
            throw new Error('Incorrect datasource specified.');
    }
    
};

function checkLocation(dataLocation) {
    if (!dataLocation) {
        throw new Error("Missing datalocation");
    }
}

function chooseCasesOrLegislation(dataType, unformattedResponse) {
    switch(dataType) {
        case constants.casesName:
            let output = unformattedResponse;

            try {
                let responseisfound = helpers.isNullOrUndefined(unformattedResponse['response']) === false;
                let docsAreFound = helpers.isNullOrUndefined(unformattedResponse.response['docs']) === false;
                let isNotFlat = responseisfound && docsAreFound;

                if(isNotFlat === true) {
                    output = helpers.getNestedObject(unformattedResponse, MOJconstants.flattenedArrayPath);
                }
            }

            catch(error) {}
            return jdoCases.mapArrayToCases(output);

        case constants.legislationName:
            return legislation.mapArrayToLegislation(unformattedResponse);

        default:
            throw new Error('invalid data type for URL aggregation.');
    }
}

