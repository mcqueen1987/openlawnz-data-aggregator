const setup = require('../common/setup');
const fs = require('fs');
const constants = require('../constants');
const rng = require('rng')
const commonfuncs = require('../common/functions');
const environmentConsts = require('../constants/environment')

const getSelectAllQuery = (tableName) => `select * from ingest.${tableName};`;

const testEnvironmentName = 'testenvironmentdonttouch'
module.exports.testEnvironmentName = testEnvironmentName

async function getStartData(overridingEnvironmentName = null) {
    console.log('initializing tests...');
    let envLabel;

    if(commonfuncs.isnullorundefined(overridingEnvironmentName)) {
        envLabel = getEnvFilesLabel();
    }

    else {
        envLabel = testEnvironmentName
    }
    let startData = await setup.getStartData(envLabel);
    expect(startData.pgPromise).toBeTruthy();
    expect(startData.pgPoolConnection).toBeTruthy();
    console.log('initialization complete. tests starting...');
    return startData;
}
module.exports.getStartData = getStartData

function getEnvFilesLabel() {
    console.log('searching for env files...');
    let fileNames = fs.readdirSync('./');
    const envFileEndIndex = 5;

    let lastEnvFileFound = fileNames.reduce((accumulate, currentValue) => {
        let possibleEnvFile = currentValue.substring(0, envFileEndIndex);

        if(possibleEnvFile !== constants.envFile ||
            currentValue === `${constants.envFile}sample`) {
            return accumulate;
        }        
        let fileslabel = currentValue.substring(envFileEndIndex);
        return fileslabel;
    }, null);
    expect(lastEnvFileFound).not.toEqual(null);
    console.log('env label found: ' + lastEnvFileFound);
    return lastEnvFileFound;
    
}

module.exports.dropTestTable = async function(connection, tableName) {
    let client = null;

    try {
        client = await connection.connect();
        let result1 = await client.query(constants.sqlBegin);
        let result2 = await client.query(`DROP TABLE ingest.${tableName};`);
        let result4 = await client.query(constants.sqlCommit);

        let result5 = await client.query(constants.sqlBegin);
        let selectQuery = getSelectAllQuery(tableName);
        let result6 = await client.query(selectQuery);
        let result7 = await client.query(constants.sqlCommit);
        expect(result6.rows).toHaveLength(0);
        console.log(`${tableName} test table removed.`);
        return Promise.resolve();
    } 
    
    catch (error) {
        client && await client.query(constants.sqlRollback);
        console.log(error);
        return Promise.reject(error);
    } 
    
    finally {
        client && client.release();
    }
}

module.exports.checkTableHasResults = async function(connection, tableName) {
    let client = null;
    let selectQuery = getSelectAllQuery(tableName);

    try {
        client = await connection.connect();
        let result1 = await client.query(constants.sqlBegin);
        let result2 = await client.query(selectQuery);
        let result4 = await client.query(constants.sqlCommit);
        expect(result2.rows).not.toHaveLength(0);
        console.log('table data was found.');
        return Promise.resolve();
    } 
    
    catch (error) {
        client && await client.query(constants.sqlRollback);
        console.log(error);
        return Promise.reject(error);
    } 
    
    finally {
        client && client.release();
    }
}

module.exports.createFreshTable = async function(connection, newTableName) {
    let client;

    try {
        client = await connection.connect();
        await client.query(constants.sqlBegin);
        await client.query(`create table ${newTableName};`);
        await client.query(constants.sqlCommit);
        console.log('test table created: ' + newTableName)        
        return Promise.resolve()
    }

    catch(error) {
        console.log(error)
        return Promise.reject(error)
    }
}

/** returns the name of the test environment file, 
 * the name of the test cases table, 
 * the name of the test legislation table. 
 * */
module.exports.createEnvironmentFile = async function() {    
    let randomNumber = rng.range(0, 1000000)
    let testFile = testEnvironmentName + randomNumber
    let testCases = constants.casesName + randomNumber
    let testLegislation = constants.legislationName + randomNumber
    
    const originalSetup = await getStartData()
    let environmentCopy = JSON.parse(JSON.stringify(originalSetup.environment))
    environmentCopy[environmentConsts.casesTableName] = testCases
    environmentCopy[environmentConsts.legislationName] = testLegislation
    let fileData = parseJsonToEnv(environmentCopy)
    fs.writeFileSync(`../${constants.envFile}${testFile}`, fileData)

    return {
        testFile,
        testCases,
        testLegislation
    }
}

function parseJsonToEnv(inputJson) {
    let output = ''
    const newLine = '/n'

    for(let i = 0; i < inputJson.keys.length; i++) {
        currentKey = inputJson.keys[i]
        let currentProp = inputJson[inputJson.keys[i]]
        output += `${currentKey}=${currentProp}${newLine}`
    }
    output += newLine
    return output
}