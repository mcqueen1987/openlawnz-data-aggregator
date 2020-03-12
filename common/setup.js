const fs = require('fs-extra');
const path = require('path');
const uuidv1 = require('uuid/v1');
const constants = require('../constants');
const yargs = require("yargs");
const dotEnv = require('dotenv');
const constEnv = require('../constants/environment');

const setup = async (environmentfilename, resumeSessionId = 0) => {
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

    if (!environmentfilename) {
        throw new Error('Missing env')
    };

    dotEnv.config({
        path: rootDir + '/.env.' + environmentfilename
    });

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
    let environment = process.env
    return {
        sessionId,
        cacheDir,
        logDir,
        pgPromise,
        pgPoolConnection,
        environment
    };
}
module.exports.getStartData = setup;

module.exports.startApplication = function(entrypoint, pagesize = null) {
    const argv = yargs.argv;

    let runner = async () => {
        setupdata = await setup(argv.env); 
        const {pgPoolConnection, pgPromise} = setupdata;

        await entrypoint(
            pgPoolConnection,
            pgPromise,
            argv.datasource,
            argv.datalocation,
            pagesize
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

