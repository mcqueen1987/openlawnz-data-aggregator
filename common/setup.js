const fs = require('fs-extra');
const path = require('path');
const uuidv1 = require('uuid/v1');
const constants = require('../constants');
const yargs = require("yargs");
const dotEnv = require('dotenv');
const constEnv = require('../constants/environment');
const helpers = require('../common/functions')

const setup = async (envFileName, resumeSessionId = 0) => {
    const options = {
        capSQL: true, // capitalize all generated SQL
        schema: [constants.schemaName],
        error(error, e) {
            if (e.cn) {
                console.log('CN:', e.cn)
                console.log('EVENT:', error.message || error)
            }
        }
    };

    const { Pool } = require("pg");
    const pgPromise = require('pg-promise')(options);
    const rootDir = path.resolve(__dirname + '/../');
    const sessionId = resumeSessionId || uuidv1();
    const cacheDir = path.join(rootDir, '.cache', sessionId);
    const logDir = path.join(rootDir, '.logs', sessionId);

    if (!envFileName) {
        throw new Error('Missing env file name.')
    };

    let envResult = dotEnv.config({
        path: `${rootDir}/${constants.envFile}${envFileName}`
    });

    if(envResult.error) {
        throw envResult.error
    }

    if(helpers.isNullOrUndefined(process.env[constEnv.apifyTaskId]) ||
        helpers.isNullOrUndefined(process.env[constEnv.apifyToken]) ||
        helpers.isNullOrUndefined(process.env[constEnv.dbHost]) ||
        helpers.isNullOrUndefined(process.env[constEnv.dbName]) ||
        helpers.isNullOrUndefined(process.env[constEnv.dbPass]) ||
        helpers.isNullOrUndefined(process.env[constEnv.dbUser]) ||
        helpers.isNullOrUndefined(process.env[constEnv.port])) {
            throw new Error(`Missing required line/s in env file ${envFileName}`)
        }

    // Ensure cache directory exists
    await fs.ensureDir(cacheDir);

    // Ensure log directory exists
    await fs.ensureDir(logDir);

    const conn = {
        host: process.env[constEnv.dbHost],
        database: process.env[constEnv.dbName],
        port: process.env[constEnv.port],
        user: process.env[constEnv.dbUser],
        password: process.env[constEnv.dbPass],
        client_encoding: 'UTF8'
    };

    let pgPoolConnection = new Pool(conn);
    
    return {
        sessionId,
        cacheDir,
        logDir,
        pgPromise,
        pgPoolConnection
    };
}
module.exports.getStartData = setup;

module.exports.startApplication = function(entrypoint) {
    const argv = yargs.argv;

    let runner = async () => {
        setupdata = await setup(argv.env); 
        const {pgPoolConnection, pgPromise} = setupdata;

        await entrypoint(
            pgPoolConnection,
            pgPromise,
            argv.datasource,
            argv.resourcelocator,
            argv.tablename,
            argv.pagesize
        );        
    }
    runner().then(() => {
        console.log('aggregation complete.');
    })
    .catch((error) => {
        console.log(error);
    })
    .then(() => {
        process.exit();
    })
}

