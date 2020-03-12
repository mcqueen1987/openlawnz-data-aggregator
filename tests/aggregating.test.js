const caser = require('../getCases');
const legislator = require('../getLegislation');
const constants = require('../constants');
const helpers = require('./testhelpers');
const casesURL = require('../getDataFile/jdoCases').URL;
const legislationURL = require('../getDataFile/pcoLegislation').URL;

fdescribe('when MOJ cases are aggregated', () => {    
    let starters;
    let testNames;

    beforeEach(async () => {
        testNames = await helpers.createEnvironmentFile();
        starters = await helpers.getStartData(testNames.testFile);
        await helpers.createFreshTable(starters.pgPoolConnection, testNames.testCases);        
    }, constants.asyncTimeout)

    afterEach(async () => {
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)

    async function dothething() {
        await runTest(constants.caseEntryPoint, starters.pgPoolConnection, starters.pgPromise, constants.mojType, null, null);
    }

    it('runs without error', dothething, constants.asyncTimeout)

    it('can be found in the database', async () => {
        await dothething();
        console.log(`${constants.mojType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)
})

describe("when PCO legislation is aggregated", () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getStartData();
    }, constants.asyncTimeout)

    afterEach(async () => {
        await helpers.dropTestTable(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)

    async function dothething() {
        await runTest(constants.legislationEntryPoint, starters.pgPoolConnection, starters.pgPromise, constants.pcoType, null, null);
    }

    it('runs without error', dothething, constants.asyncTimeout)

    it('can be found in the database', async () => {
        await dothething();
        console.log(`${constants.pcoType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)
})

async function runTest(entrypoint, pgPool, pgPromise, dataSource, dataLocation, pagesize) {
    let chosenrunner;

    switch(entrypoint) {
        case constants.caseEntryPoint:
            chosenrunner = caser;
            break;

        case constants.legislationEntryPoint:
            chosenrunner = legislator;
            break;

        default:
            throw new Error(`entrypoint: ${entrypoint} is invalid`);
    }

    try {
        await chosenrunner(pgPool, pgPromise, dataSource, dataLocation, pagesize);
    }   

    catch(error) {
        return Promise.reject(error);
    } 
}

describe("when a URL data source is aggregated", () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getStartData();
    }, constants.asyncTimeout)

    async function dothething(entrypoint, chosenurl) {
        await runTest(entrypoint, starters.pgPoolConnection, starters.pgPromise, constants.urlType, chosenurl, null);
    }

    it('aggregates cases without error', async () => {
        await dothething(constants.caseEntryPoint, casesURL);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName); //I took this out of afterEach() so that I could clear only one table per test
    }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await dothething(constants.caseEntryPoint, casesURL);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.casesName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)

    it('aggregates legislation without error', async () => {
        let url = legislationURL();
        await dothething(constants.legislationEntryPoint, url);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)

    it('legislation can be found in the database', async () => {
        let url = legislationURL();
        await dothething(constants.legislationEntryPoint, url);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.legislationName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)
})

describe("when a localfile data source is aggregated", () => {
    let starters;
    const mojPath = `${__dirname}/../exampledata/MOJresponse.json`;
    const pcoPath = `${__dirname}/../exampledata/PCOresponse.json`;

    beforeAll(async () => {
        starters = await helpers.getStartData();
    }, constants.asyncTimeout)

    async function dothething(entrypoint, chosenfile) {
        await runTest(entrypoint, starters.pgPoolConnection, starters.pgPromise, constants.localFileType, chosenfile, null);
    }

    it('aggregates cases without error', async () => {
       await dothething(constants.caseEntryPoint, mojPath);
       await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await dothething(constants.caseEntryPoint, mojPath);
        console.log(`${constants.localFileType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.casesName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)

    it('aggregates legislation without error', async () => {
        await dothething(constants.legislationEntryPoint, pcoPath);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)

    it('legislation can be found in the database', async () => {
        await dothething(constants.legislationEntryPoint, pcoPath);
        console.log(`${constants.localFileType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.legislationName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.legislationName);
    }, constants.asyncTimeout)
})

describe("when a TT data source is aggregated", () => {
    let starters;
    const inputPageSize = 1000;
    const hugeTimeout = constants.asyncTimeout * 20;
    const slowWarning = 'WARNING: PAGINATED TT SOURCE IS VERY SLOW. 20 MIN APPROX.';

    beforeAll(async () => {
        starters = await helpers.getStartData();
    }, constants.asyncTimeout)

    async function doTheThing(entryPoint, batchSize) {
        await runTest(entryPoint, starters.pgPoolConnection, starters.pgPromise, constants.TTtype, null, batchSize);
    }

    /** WARNING: VERY SLOW. 20MINUTES APPROX */
    it('aggregates cases in pages', async () => {
        console.log(slowWarning);
        await doTheThing(constants.caseEntryPoint, inputPageSize);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, hugeTimeout)

    /** WARNING: VERY SLOW. 20MINUTES APPROX */
    it('cases can be found in the database after paging', async () => {
        console.log(slowWarning);
        await doTheThing(constants.caseEntryPoint, inputPageSize);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.casesName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, hugeTimeout)

    it('aggregates cases', 
        async () => {
            await doTheThing(constants.caseEntryPoint, null);
            await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
        }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await doTheThing(constants.caseEntryPoint, null);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, constants.casesName);
        await helpers.dropTestTable(starters.pgPoolConnection, constants.casesName);
    }, constants.asyncTimeout)
})

