const caser = require('../getCases')
const legislator = require('../getLegislation')
const constants = require('../constants')
const helpers = require('./testhelpers')
const casesURL = require('../getDataFile/jdoCases').URL
const legislationURL = require('../getDataFile/pcoLegislation').URL

describe('when MOJ cases are aggregated', () => {    
    let starters;

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    }, constants.asynctimeout)

    afterEach(async () => {
        await helpers.cleantable(starters.pgPoolConnection, constants.casesname)    
    }, constants.asynctimeout)

    async function dothething() {
        await runtest(constants.caseentrypoint, starters.pgPoolConnection, starters.pgPromise, constants.mojtype, null, null)
    }

    it('runs without error', dothething, constants.asynctimeout)

    it('can be found in the database', async () => {
        await dothething()
        console.log(`${constants.mojtype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.casesname)
    }, constants.asynctimeout)
})

describe("when PCO legislation is aggregated", () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    }, constants.asynctimeout)

    afterEach(async () => {
        await helpers.cleantable(starters.pgPoolConnection, constants.legislationname)
    }, constants.asynctimeout)

    async function dothething() {
        await runtest(constants.legislationentrypoint, starters.pgPoolConnection, starters.pgPromise, constants.pcotype, null, null)
    }

    it('runs without error', dothething, constants.asynctimeout)

    it('can be found in the database', async () => {
        await dothething()
        console.log(`${constants.pcotype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.legislationname)
    }, constants.asynctimeout)
})

async function runtest(entrypoint, pgPool, pgPromise, dataSource, dataLocation, pagesize) {
    let chosenrunner;

    switch(entrypoint) {
        case constants.caseentrypoint:
            chosenrunner = caser
            break

        case constants.legislationentrypoint:
            chosenrunner = legislator
            break

        default:
            throw new Error(`entrypoint: ${entrypoint} is invalid`)
    }

    try {
        await chosenrunner(pgPool, pgPromise, dataSource, dataLocation, pagesize)
    }   

    catch(error) {
        return Promise.reject(error)
    } 
}

describe("when a URL data source is aggregated", () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    }, constants.asynctimeout)

    async function dothething(entrypoint, chosenurl) {
        await runtest(entrypoint, starters.pgPoolConnection, starters.pgPromise, constants.urltype, chosenurl, null)
    }

    it('aggregates cases without error', 
        async () => {
            await dothething(constants.caseentrypoint, casesURL)
            await helpers.cleantable(starters.pgPoolConnection, constants.casesname) //I took this out of afterEach() so that I could clear only one table per test
        }, constants.asynctimeout)

    it('cases can be found in the database', async () => {
        await dothething(constants.caseentrypoint, casesURL)
        console.log(`${constants.urltype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.casesname)
        await helpers.cleantable(starters.pgPoolConnection, constants.casesname)
    }, constants.asynctimeout)

    it('aggregates legislation without error', async () => {
        let url = legislationURL()
        await dothething(constants.legislationentrypoint, url)
        await helpers.cleantable(starters.pgPoolConnection, constants.legislationname)
    }, constants.asynctimeout)

    it('legislation can be found in the database', async () => {
        let url = legislationURL()
        await dothething(constants.legislationentrypoint, url)
        console.log(`${constants.urltype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.legislationname)
        await helpers.cleantable(starters.pgPoolConnection, constants.legislationname)
    }, constants.asynctimeout)
})

describe("when a localfile data source is aggregated", () => {
   
})

fdescribe("when a TT data source is aggregated", () => {
    let starters;
    const inputpagesize = 1000
    const hugetimeout = constants.asynctimeout * 20

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    }, constants.asynctimeout)

    async function dothething(entrypoint, batchsize) {
        await runtest(entrypoint, starters.pgPoolConnection, starters.pgPromise, constants.TTtype, null, batchsize)
    }

    /** WARNING: VERY SLOW */
    it('aggregates cases in pages', 
        async () => {
            await dothething(constants.caseentrypoint, inputpagesize)
            await helpers.cleantable(starters.pgPoolConnection, constants.casesname)
        }, hugetimeout)

    /** WARNING: VERY SLOW */
    fit('cases can be found in the database after paging', async () => {
        await dothething(constants.caseentrypoint, inputpagesize)
        console.log(`${constants.urltype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.casesname)
        await helpers.cleantable(starters.pgPoolConnection, constants.casesname)
    }, hugetimeout)

    it('aggregates cases', 
        async () => {
            await dothething(constants.caseentrypoint, null)
            await helpers.cleantable(starters.pgPoolConnection, constants.casesname)
        }, constants.asynctimeout)

    it('cases can be found in the database', async () => {
        await dothething(constants.caseentrypoint, null)
        console.log(`${constants.urltype} aggregation finished and will be tested...`)
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.casesname)
        await helpers.cleantable(starters.pgPoolConnection, constants.casesname)
    }, constants.asynctimeout)
})

