const setup = require('../common/setup');
const fs = require('fs');
const constants = require('../constants');

const getselectallquery = (tablename) => `select * from ingest.${tablename};`;

module.exports.getstartdata = async function() {
    console.log('initializing tests...');
    let envlabel = getenvfileslabel();
    startdata = await setup.getstartdata(envlabel);
    expect(startdata.pgPromise).toBeTruthy();
    expect(startdata.pgPoolConnection).toBeTruthy();
    console.log('initialization complete. tests starting...');
    return startdata;
}

function getenvfileslabel() {
    console.log('searching for env files...');
    let filenames = fs.readdirSync('./');
    const envfileendindex = 5;

    let lastenvfilefound = filenames.reduce((accumulate, currentvalue) => {
        let possibleenvfile = currentvalue.substring(0, envfileendindex);

        if(possibleenvfile !== constants.envfile ||
            currentvalue === `${constants.envfile}sample`) {
            return accumulate;
        }        
        let fileslabel = currentvalue.substring(envfileendindex);
        return fileslabel;
    }, null);
    expect(lastenvfilefound).not.toEqual(null);
    console.log('env label found: ' + lastenvfilefound);
    return lastenvfilefound;
    
}

module.exports.cleantable = async function(connection, tablename) {
    let client = null;

    try {
        client = await connection.connect();
        let result1 = await client.query(constants.sqlbegin);
        let result2 = await client.query(`TRUNCATE TABLE ingest.${tablename};`);
        let result4 = await client.query(constants.sqlcommit);

        let result5 = await client.query(constants.sqlbegin);
        let selectquery = getselectallquery(tablename);
        let result6 = await client.query(selectquery);
        let result7 = await client.query(constants.sqlcommit);
        expect(result6.rows).toHaveLength(0);
        console.log(`${tablename} table cleaned.`);
        return Promise.resolve();
    } 
    
    catch (error) {
        client && await client.query(constants.sqlrollback);
        console.log(error);
        return Promise.reject(error);
    } 
    
    finally {
        client && client.release();
    }
}

module.exports.checktablehasresults = async function(connection, tablename) {
    let client = null;
    let selectquery = getselectallquery(tablename);

    try {
        client = await connection.connect();
        let result1 = await client.query(constants.sqlbegin);
        let result2 = await client.query(selectquery);
        let result4 = await client.query(constants.sqlcommit);
        expect(result2.rows).not.toHaveLength(0);
        console.log('table data was found.');
        return Promise.resolve();
    } 
    
    catch (error) {
        client && await client.query(constants.sqlrollback);
        console.log(error);
        return Promise.reject(error);
    } 
    
    finally {
        client && client.release();
    }
}
