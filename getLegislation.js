const getDataFile = require('./getDataFile');

/**
 * get legislation data then save to databases
 *
 * @param pgPool
 * @param pgPromise
 * @param datasource
 * @param datalocation
 * @returns {Promise<void>}
 */
const run = async (pgPool, pgPromise, datasource, datalocation) => {
    // get multi-row insert sql
    const legislationData = await getDataFile(datasource, datalocation);
    const legislationColumnSet = new pgPromise.helpers.ColumnSet(
        ['title', 'link', 'year', 'alerts'],
        {table: {table: 'legislation', schema: 'aggregator_cases'}}
    );

    // insert sql within a Transaction
    let client = null;
    try {
        client = await pgPool.connect();
        await client.query('BEGIN');
        const sql = pgPromise.helpers.insert(legislationData, legislationColumnSet);
        await client.query(sql);
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err
    } finally {
        client.release();
    }
};

if (require.main === module) {
    const argv = require("yargs").argv;
    (async () => {
        try {
            const {pgPoolConnection, pgPromise} = await require("./common/setup")(argv.env);
            await run(
                pgPoolConnection,
                pgPromise,
                argv.datasource,
                argv.datalocation
            );
        } catch (ex) {
            console.log(ex);
        }
    })().finally(process.exit);
} else {
    module.exports = run;
}
