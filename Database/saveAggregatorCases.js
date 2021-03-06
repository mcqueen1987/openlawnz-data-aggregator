const constants = require('../constants');
const caseModel = require('../models/case');

/**
 * save cases
 *
 * @param data
 * @param pgPool
 * @param pgPromise
 * @returns {Promise<never>}
 */
const run = async (data, pgPool, pgPromise, tableName) => {

    const getInsertCaseSql = (oneCase) => {
        let casesColumnSet = new pgPromise.helpers.ColumnSet(
            caseModel.getLabelsArray(),
            {table: {table: tableName, schema: constants.schemaName}}
        );

        const onConflictSql = ' ON CONFLICT(file_url) DO NOTHING RETURNING file_key';
        return pgPromise.helpers.insert(oneCase, casesColumnSet) + onConflictSql;
    };


    /**
     * insert one row of case data
     * when insert ON CONFLICT(file_url), DO NOT save data to any table
     *
     * @param client
     * @param oneCase
     * @returns {Promise<void>}
     */
    const insertOneRow = async (client, oneCase) => {
        // insert cases
        const casesSql = getInsertCaseSql(oneCase);
        const ret = await client.query(casesSql);
        if (!ret['rowCount']) {
            console.log(`skip duplicated data: ${JSON.stringify(oneCase)}`);
            return;
        }
    };

    let client = null;
    console.log('saving cases...');
    try {
        // insert data into database by transaction
        // 1. initiate transaction
        client = await pgPool.connect();
        await client.query(constants.sqlBegin);
        // 2. insert data in batches
        await Promise.all(
            data.map(currentcase => insertOneRow(client, currentcase))
        );
        // 3. commit transaction
        await client.query(constants.sqlCommit);
    } catch (err) {
        client && await client.query(constants.sqlRollback);
        return Promise.reject(err);
    } finally {
        client && client.release();
    }
};

if (require.main === module) {
    try {
        throw new Error("cannot be run individually.");
    } 

    catch (ex) {
        console.log(ex);
    }
} 

else {
    module.exports = run;
}


