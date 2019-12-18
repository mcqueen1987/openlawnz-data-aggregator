const getDataFile = require('./getDataFile');

/**
 * get tenancy tribunal data and save to postgres
 *
 * @param pgPool
 * @param pgPromise
 * @param datasource
 * @param datalocation
 * @returns {Promise<void>}
 */
const run = async (pgPool, pgPromise, datasource, datalocation) => {
    await getDataFile(pgPool, pgPromise, datasource, datalocation);
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
