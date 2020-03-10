const caser = require('../getCases')
const legislator = require('../getLegislation')
const constants = require('../constants')
const helpers = require('./testhelpers')

describe('when MOJ cases are aggregated', () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    })

    afterEach(async () => {
        await helpers.cleantables(starters.pgPoolConnection)        
    })

    async function runMOJtest() {
        try {
            await caser(starters.pgPoolConnection, starters.pgPromise, 'moj', null, null)
            console.log('moj aggregation finished and will be tested...')
        }   

        catch(error) {
            return Promise.reject(error)
        }        
    }

    it('runs without error', runMOJtest, constants.asynctimeout)

    it('can be found in the database', async () => {
        await runMOJtest()
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.casesname)
    }, constants.asynctimeout)
})

fdescribe("when PCO legislation is aggregated", () => {
    let starters;

    beforeAll(async () => {
        starters = await helpers.getstartdata()
    })

    afterEach(async () => {
        await helpers.cleantables(starters.pgPoolConnection)        
    })

    async function runPCOtest() {
        try {
            await legislator(starters.pgPoolConnection, starters.pgPromise, 'pco', null, null)
            console.log('pco aggregation finished and will be tested...')
        }   

        catch(error) {
            return Promise.reject(error)
        }        
    }

    it('runs without error', runPCOtest, constants.asynctimeout)

    it('can be found in the database', async () => {
        await runPCOtest()
        await helpers.checktablehasresults(starters.pgPoolConnection, constants.legislationname)
    }, constants.asynctimeout)
})

describe("when a URL data source is aggregated", () => {
    it('aggregates cases without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })

    it('aggregates legislation without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })
})

describe("when a localfile data source is aggregated", () => {
    it('aggregates cases without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })

    it('aggregates legislation without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })
})

describe("when a TT data source is aggregated", () => {
    it('aggregates cases without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })

    it('aggregates legislation without error', () => {
        
    })

    it('cases can be found in the database', () => {
        
    })
})