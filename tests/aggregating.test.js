const caser = require('../getCases');
const legislator = require('../getLegislation');
const constants = require('../constants');
const helpers = require('./testHelpers');
const casesURL = require('../getDataFile/jdoCases').URL;
const legislationURL = require('../getDataFile/pcoLegislation').URL;
const caseModel = require('../constants/casesTable');
const legislationModel = require('../constants/legislationTable')

describe('when MOJ cases are aggregated', () => {    
    let starters;
    let testNames;

    beforeEach(async () => {
        console.log('initializing test...');
        starters = await helpers.getStartData();
        testNames = helpers.createRandomNames();        
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)

    afterEach(async () => {
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)

    async function dothething() {
        await runTest(constants.caseEntryPoint, starters.pgPoolConnection, starters.pgPromise, constants.mojType, null, testNames.testCases, null);
    }

    it('runs without error', dothething, constants.asyncTimeout)

    it('can be found in the database', async () => {
        await dothething();
        console.log(`${constants.mojType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)
})

describe("when PCO legislation is aggregated", () => {
    let starters;
    let testNames;

    beforeEach(async () => {
        console.log('initializing test...');
        starters = await helpers.getStartData();
        testNames = helpers.createRandomNames();
        await createlegislationTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)

    afterEach(async () => {
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)

    async function dothething() {
        await runTest(constants.legislationEntryPoint, starters.pgPoolConnection, starters.pgPromise, constants.pcoType, null, testNames.testLegislation, null);
    }

    it('runs without error', dothething, constants.asyncTimeout)

    it('can be found in the database', async () => {
        await dothething();
        console.log(`${constants.pcoType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)
})

async function runTest(entrypoint, pgPool, pgPromise, dataSource, dataLocation, tableName, pagesize) {
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
        await chosenrunner(pgPool, pgPromise, dataSource, dataLocation, tableName, pagesize);
    }   

    catch(error) {
        return Promise.reject(error);
    } 
}

async function createCasesTable(pgPool, tableName) {
    let casesCreateScript = caseModel.getCreateQuery(tableName);
    await helpers.createFreshTable(pgPool, casesCreateScript, tableName);
}

async function createlegislationTable(pgPool, tableName) {
    let legislationCreateScript = legislationModel.getCreateQuery(tableName);
    await helpers.createFreshTable(pgPool, legislationCreateScript, tableName);
}

describe("when a URL data source is aggregated", () => {
    let starters;
    let testNames;

    beforeEach(async () => {
        console.log('initializing test...');
        starters = await helpers.getStartData();
        testNames = helpers.createRandomNames();
    }, constants.asyncTimeout)

    async function doTheThing(entryPoint, chosenUrl, chosenTable) {
        await runTest(entryPoint, starters.pgPoolConnection, starters.pgPromise, constants.urlType, chosenUrl, chosenTable, null);
    }

    it('aggregates cases without error', async () => {
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await doTheThing(constants.caseEntryPoint, casesURL, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);  //I took this out of afterEach() so that I could clear only one table per test
    }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await doTheThing(constants.caseEntryPoint, casesURL, testNames.testCases);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)

    it('aggregates legislation without error', async () => {
        await createlegislationTable(starters.pgPoolConnection, testNames.testLegislation);
        let url = legislationURL();
        await doTheThing(constants.legislationEntryPoint, url, testNames.testLegislation);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)

    it('legislation can be found in the database', async () => {
        await createlegislationTable(starters.pgPoolConnection, testNames.testLegislation);
        let url = legislationURL();
        await doTheThing(constants.legislationEntryPoint, url, testNames.testLegislation);
        console.log(`${constants.urlType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testLegislation);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)
})

describe("when a localfile data source is aggregated", () => {
    let starters;
    let testNames;
    const mojPath = `${__dirname}/../exampledata/MOJresponse.json`;
    const pcoPath = `${__dirname}/../exampledata/PCOresponse.json`;

    beforeEach(async () => {
        starters = await helpers.getStartData();
        testNames = helpers.createRandomNames();
    }, constants.asyncTimeout)

    async function dothething(entrypoint, chosenfile, tableName) {
        await runTest(entrypoint, starters.pgPoolConnection, starters.pgPromise, constants.localFileType, chosenfile, tableName, null);
    }

    it('aggregates cases without error', async () => {
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await dothething(constants.caseEntryPoint, mojPath, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await dothething(constants.caseEntryPoint, mojPath, testNames.testCases);
        console.log(`${constants.localFileType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)

    it('aggregates legislation without error', async () => {
        await createlegislationTable(starters.pgPoolConnection, testNames.testLegislation);
        await dothething(constants.legislationEntryPoint, pcoPath, testNames.testLegislation);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)
    
    it('legislation can be found in the database', async () => {
        await createlegislationTable(starters.pgPoolConnection, testNames.testLegislation);
        await dothething(constants.legislationEntryPoint, pcoPath, testNames.testLegislation);
        console.log(`${constants.localFileType} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testLegislation);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testLegislation);
    }, constants.asyncTimeout)
})

describe("when a TT data source is aggregated", () => {
    let testNames;
    let starters;
    const inputPageSize = 1000;
    const hugeTimeout = constants.asyncTimeout * 20;
    const slowWarning = 'WARNING: PAGINATED TT SOURCE IS VERY SLOW. 20 MIN APPROX.';

    beforeEach(async () => {
        starters = await helpers.getStartData();
        testNames = helpers.createRandomNames();        
    }, constants.asyncTimeout)

    async function doTheThing(entryPoint, batchSize, tableName) {
        await runTest(entryPoint, starters.pgPoolConnection, starters.pgPromise, constants.TTtype, null, tableName, batchSize);
    }

    /** WARNING: VERY SLOW. 20MINUTES APPROX */
    it('aggregates cases in pages', async () => {
        console.log(slowWarning);
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await doTheThing(constants.caseEntryPoint, inputPageSize, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, hugeTimeout)

    /** WARNING: VERY SLOW. 20MINUTES APPROX */
    it('cases can be found in the database after paging', async () => {
        console.log(slowWarning);
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await doTheThing(constants.caseEntryPoint, inputPageSize, testNames.testCases);
        console.log(`${constants.TTtype} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, hugeTimeout)

    it('aggregates cases', async () => {
            await createCasesTable(starters.pgPoolConnection, testNames.testCases);
            await doTheThing(constants.caseEntryPoint, null, testNames.testCases);
            await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
        }, constants.asyncTimeout)

    it('cases can be found in the database', async () => {
        await createCasesTable(starters.pgPoolConnection, testNames.testCases);
        await doTheThing(constants.caseEntryPoint, null, testNames.testCases);
        console.log(`${constants.TTtype} aggregation finished and will be tested...`);
        await helpers.checkTableHasResults(starters.pgPoolConnection, testNames.testCases);
        await helpers.dropTestTable(starters.pgPoolConnection, testNames.testCases);
    }, constants.asyncTimeout)
})

