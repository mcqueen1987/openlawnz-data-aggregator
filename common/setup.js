const fs = require('fs-extra');
const path = require('path');
const uuidv1 = require('uuid/v1');

module.exports = async (env, resumeSessionId) => {

    const options = {
        capSQL: true, // capitalize all generated SQL
        schema: ['pipeline_cases'],
        error(error, e) {
            if (e.cn) {
                console.log('CN:', e.cn);
                console.log('EVENT:', error.message || error);
            }
        }
    };

    const { Pool } = require("pg");
    const pgPromise = require('pg-promise')(options);
    const rootDir = path.resolve(__dirname + '/../');
    const sessionId = resumeSessionId || uuidv1();
    const cacheDir = path.join(rootDir, '.cache', sessionId);
    const logDir = path.join(rootDir, '.logs', sessionId);

    if (!env) {
        throw new Error('Missing env');
    }

    require('dotenv').config({
        path: rootDir + '/.env.' + env
    });

    // Ensure cache directory exists
    await fs.ensureDir(cacheDir);

    // Ensure log directory exists
    await fs.ensureDir(logDir);

    const conn = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
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
};
