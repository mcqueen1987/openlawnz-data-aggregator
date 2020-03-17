const setup = require('../common/setup');
const fs = require('fs');
const constants = require('../constants');

async function getStartData() {    
    let envName = getEnvFilesLabel();
    let startData = await setup.getStartData(envName);
    expect(startData.pgPromise).toBeTruthy();
    expect(startData.pgPoolConnection).toBeTruthy();
    return startData;
}
module.exports.getStartData = getStartData;

function getEnvFilesLabel() {
    console.log('searching for env files...');
    let fileNames = fs.readdirSync('./');
    const envFileEndIndex = 5;

    let lastEnvFileFound = fileNames.reduce((accumulate, currentValue) => {
        let possibleEnvFile = currentValue.substring(0, envFileEndIndex);

        if(possibleEnvFile !== constants.envFile ||
            currentValue === `${constants.envFile}sample`){
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
        await client.query(constants.sqlBegin);
        await client.query(`DROP TABLE ${constants.schemaName}.${tableName};`);
        await client.query(constants.sqlCommit);
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
};

module.exports.checkTableHasResults = async function(connection, tableName) {
    let client = null;
    let selectQuery = `select * from ${constants.schemaName}.${tableName};`;

    try {
        client = await connection.connect();
        await client.query(constants.sqlBegin);
        let result = await client.query(selectQuery);
        await client.query(constants.sqlCommit);
        expect(result.rows).not.toHaveLength(0);
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
};

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
};

/** 
 * Returns the name of the test cases table, 
 * the name of the test legislation table. 
 * */
module.exports.createRandomNames = function() {   
    let randomNumber = `${(Math.random() * 100000000)}`.split('.').join('');  //full stops not allowed in table names
    let testCases = constants.casesName + randomNumber;
    let testLegislation = constants.legislationName + randomNumber;

    return {
        testCases,
        testLegislation
    };
};
