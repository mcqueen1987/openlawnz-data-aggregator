const setup = require('../common/setup')
const fs = require('fs')
const constants = require('../constants')

module.exports.getstartdata = async function() {
    console.log('initializing tests...')
    let envlabel = getenvfileslabel()
    startdata = await setup.getstartdata(envlabel)
    expect(startdata.pgPromise).toBeTruthy()
    expect(startdata.pgPoolConnection).toBeTruthy()
    console.log('initialized complete. tests starting...')    
    return startdata    
}

function getenvfileslabel() {
    console.log('searching for env files...')
    let filenames = fs.readdirSync('./')
    const envfileendindex = 5

    let lastenvfilefound = filenames.reduce((accumulate, currentvalue) => {
        let possibleenvfile = currentvalue.substring(0, envfileendindex)

        if(possibleenvfile !== constants.envfile ||
            currentvalue === `${constants.envfile}sample`) {
            return accumulate
        }        
        let fileslabel = currentvalue.substring(envfileendindex)
        return fileslabel
    }, null)
    expect(lastenvfilefound).not.toEqual(null)
    console.log('env label found: ' + lastenvfilefound)
    return lastenvfilefound
    
}

module.exports.cleantables = async function(connection) {
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

const errorlabel = 'Error'

module.exports.teststringforerrors = function(subject) {
    expect(subject).not.toContain(errorlabel)
    expect(subject).not.toContain(errorlabel.toLowerCase)
    expect(subject).not.toContain(errorlabel.toUpperCase)
}

module.exports.checktablehasresults = async function(connection, tablename) {
    let client = null

    try {
        client = await connection.connect()
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