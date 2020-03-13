const setup = require('../common/setup');
const fs = require('fs');
const constants = require('../constants');
const commonfuncs = require('../common/functions');
const environmentConsts = require('../constants/environment')
const path = require('path')

const testEnvironmentName = 'testenvironmentdonttouch'
module.exports.testEnvironmentName = testEnvironmentName

async function getStartData(overridingEnvironmentName = null) {
    
    let envLabel;

    if(commonfuncs.isNullOrUndefined(overridingEnvironmentName)) {
        envLabel = getEnvFilesLabel();
    }

    else {
        envLabel = testEnvironmentName
    }
    let startData = await setup.getStartData(envLabel);
    expect(startData.pgPromise).toBeTruthy();
    expect(startData.pgPoolConnection).toBeTruthy();
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
        let result2 = await client.query(`DROP TABLE ${constants.schemaName}.${tableName};`);
        let result4 = await client.query(constants.sqlCommit);
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
    let selectQuery = `select * from ${constants.schemaName}.${tableName};`;

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

module.exports.createFreshTable = async function(connection, createScript, newTableName) {
    let client;

    try {
        client = await connection.connect();
        await client.query(constants.sqlBegin);
        await client.query(createScript);
        await client.query(constants.sqlCommit);
        console.log('test table created: ' + newTableName);
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

/** returns the name of the test environment file, 
 * the name of the test cases table, 
 * the name of the test legislation table. 
 * */
module.exports.createEnvironmentFile = async function() {   
    let randomNumber = `${(Math.random() * 100000000)}`.split('.').join('')  //full stops not allowed in table names
    let testFile = testEnvironmentName + randomNumber
    let testCases = constants.casesName + randomNumber
    let testLegislation = constants.legislationName + randomNumber
    
    const originalSetup = await getStartData()
    let newEnv = {}
    newEnv[environmentConsts.apifyTaskId] = originalSetup.environment[environmentConsts.apifyTaskId]
    newEnv[environmentConsts.apifyToken] = originalSetup.environment[environmentConsts.apifyToken]
    newEnv[environmentConsts.dbHost] = originalSetup.environment[environmentConsts.dbHost]
    newEnv[environmentConsts.dbName] = originalSetup.environment[environmentConsts.dbName]
    newEnv[environmentConsts.dbPass] = originalSetup.environment[environmentConsts.dbPass]
    newEnv[environmentConsts.dbUser] = originalSetup.environment[environmentConsts.dbUser]
    newEnv[environmentConsts.port] = originalSetup.environment[environmentConsts.port]
    newEnv[environmentConsts.casesTableName] = testCases
    newEnv[environmentConsts.legislationTable] = testLegislation
    let fileData = parseJsonToEnv(newEnv)
    let filePath = path.resolve(`${__dirname}/../${constants.envFile}${testFile}`)
    fs.writeFileSync(filePath, fileData)

    return {
        testFile,
        testCases,
        testLegislation
    }
}

function parseJsonToEnv(inputJson) {
    let output = ''
    const newLine = '\r\n'
    let keys = Object.keys(inputJson)

    for(let i = 0; i < keys.length; i++) {
        currentKey = keys[i]
        let currentProp = inputJson[keys[i]]
        output += `${currentKey}=${currentProp}${newLine}`
    }
    output += newLine
    return output
}

module.exports.removeEnvFile = function(nameUniquePart) {
    let filePath = path.resolve(`${__dirname}/../${constants.envFile}${testFile}`)
    fs.unlinkSync(filePath)
}