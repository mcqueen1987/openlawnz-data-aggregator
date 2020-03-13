const getDataFile = require('./getDataFile');
const constants = require('./constants');
const legislationModel = require('./models/legislation');
const setup = require('./common/setup');
const helpers = require('./common/functions');

/**
 * get legislation data then save to databases
 *
 * @param pgPool
 * @param pgPromise
 * @param dataSource
 * @param dataLocation
 * @returns {Promise<void>}
 */
const run = async (pgPool, pgPromise, dataSource, dataLocation, tableName = null) => {
    console.log('starting getLegislation.js');
    let tableNameUsed = helpers.getTableName(tableName)
    // get multi-row insert sql
    const legislationData = await getDataFile(pgPool, pgPromise, dataSource, dataLocation, constants.legislationName);
    let legislationColumnSet = new pgPromise.helpers.ColumnSet(
        legislationModel.getlabelsarray(),
        {table: {table: tableNameUsed, schema: constants.schemaName}}
    );

    // insert sql within a transaction
    let client = null;
    console.log('saving legislation...');
    try {
        client = await pgPool.connect();
        await client.query(constants.sqlBegin);
        const sql = pgPromise.helpers.insert(legislationData, legislationColumnSet);
        await client.query(sql);
        await client.query(constants.sqlCommit);
    } catch (err) {
        await client.query(constants.sqlRollback);
        throw err;
    } finally {
        client && client.release();
    }
}

if (require.main === module) {
    setup.startApplication(run);
} else {
    module.exports = run;
}
