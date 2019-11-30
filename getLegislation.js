const getDataFile = require('./getDataFile');
/**
 * Parse Legislation
 *
 * @param pipeline_connection
 * @param pgPromise
 * @param datasource
 * @param datalocation
 * @returns {Promise<*>}
 */
const run = async (pipeline_connection, pgPromise, datasource, datalocation) => {

    const insertLegislation = async (dataArr, db = pipeline_connection, pgp = pgPromise) => {
        if (dataArr.length < 1) {
            return Promise.reject('Empty Legislation Data');
        }

        // multi-row insert with pg-promise
        const legislationColumnSet = new pgp.helpers.ColumnSet(
            ['title', 'link', 'year', 'alerts'],
            {table: {table: 'legislation', schema: 'aggregator_cases'}}
        );

        // generating a multi-row insert query:
        const sql = pgp.helpers.insert(dataArr, legislationColumnSet);
        try {
            return db.none(sql)
                .then(data => { // success
                    return Promise.resolve(data);
                })
                .catch(error => { // error
                    return Promise.reject(error);
                });
        } catch (err) {
            return Promise.reject(err);
        }
    };

    try {
        const legislationData = await getDataFile(datasource, datalocation);
        const promises = insertLegislation(legislationData, pipeline_connection);
        return Promise.all([promises]);
    } catch (err) {
        return Promise.reject(err);
    }
};

if (require.main === module) {
    const argv = require("yargs").argv;
    (async () => {
        try {
            const {connection, pgPromise} = await require("./common/setup")(argv.env);
            await run(
                connection,
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
