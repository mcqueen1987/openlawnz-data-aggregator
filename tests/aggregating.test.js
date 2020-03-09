const caser = require('../getCases')
const legislator = require('../getLegislation')
const setup = require('../common/setup')
const constants = require('../constants')
const childprocess = require('child_process')

describe('aggregator', () => {
    const errorlabel = 'Error'

    let builder;
    let connection;

    beforeAll(async () => {
        let startdata = await setup.getstartdata()
        const {pgPromise, pgPoolConnection} = startdata
        builder = pgPromise
        connection = pgPoolConnection
        expect(builder).toBeTruthy()
        expect(builder).toBeTruthy()
    })

    afterEach(async () => {
        await cleantables()        
    })

    async function cleantables() {
        let client = null

        try {
            client = await connection.connect()
            await client.query(constants.sqlbegin)
            await client.query("TRUNCATE TABLE ingest.cases;")
            await client.query("TRUNCATE TABLE ingest.legislation;")
            await client.query(constants.sqlcommit)
            console.log('tables cleaned.')
            return Promise.resolve()
        } 
        
        catch (error) {
            client && await client.query(constants.sqlrollback)
            console.log(error)
            return Promise.reject(error)
        } 
        
        finally {
            client && client.release()
        }
    }

    function teststringforerrors(subject) {
        expect(subject).not.toContain(errorlabel)
        expect(subject).not.toContain(errorlabel.toLowerCase)
        expect(subject).not.toContain(errorlabel.toUpperCase)
    }

    async function checktablehasresults(tablename) {
        let client = null

        try {
            client = await builder.connect()
            await client.query(constants.sqlbegin)
            let response = await client.query(`select * from ingest.${tablename};`)
            await client.query(constants.sqlcommit)
console.log('table results: ' + JSON.stringify(response))
            return Promise.resolve(response)
        } 
        
        catch (error) {
            client && await client.query(constants.sqlrollback)
            console.log(error)
            return Promise.reject(error)
        } 
        
        finally {
            client && client.release()
        }
    }

    fdescribe("when MOJ cases are aggregated", () => {
        const runMOJtest = async () => {
            await caser(connection, builder, 'moj', null, null)
            console.log('moj aggregation finished and will be tested...')
            teststringforerrors(result)
        }

        it('runs without error', runMOJtest)

        it('can be found in the database', () => {
            runMOJtest()
            checktablehasresults(constants.casesname)
        })
    })

    describe("when PCO legislation are aggregated", () => {
        it('runs without error', () => {
            
        })

        it('results can be found in the database', () => {
            
        })
    })

    describe("when a URL data source is used", () => {
        it('aggregates cases without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })

        it('aggregates legislation without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })
    })

    describe("when a localfile data source is used", () => {
        it('aggregates cases without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })

        it('aggregates legislation without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })
    })

    describe("when a TT data source is used", () => {
        it('aggregates cases without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })

        it('aggregates legislation without error', () => {
            
        })

        it('cases can be found in the database', () => {
            
        })
    })
})