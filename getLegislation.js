const getDataFile = require('./getDataFile');
/**
 * Parse Legislation
 * @param MysqlConnection pipeline_connection
 */
const run = async (pipeline_connection, datasource, datalocation) => {

    /**
     * insert ONE legislation data per time
     *
     * @param data
     * @param db
     * @returns {Promise<*>}
     */
    const insertLegislation = async (data, db = pipeline_connection) => {
        const [title, link, year, alerts] = data;
        const sql = `INSERT INTO aggregator_cases.legislation 
                    (title, link, year, alerts)
                    VALUES ($1,$2,$3,$4) RETURNING id`;
        try {
            const res = await db.query(sql, [title, link, year, alerts]);
            return res ? Promise.resolve(res) : Promise.reject();
        } catch (err) {
            return Promise.reject(err);
        }
    };

    try {
        const legislationData = await getDataFile(datasource, datalocation);
        let insertValues = legislationData.map(legislation => [
            legislation.title,
            legislation.link,
            legislation.year,
            legislation.alerts
        ]);
        const promises = insertValues.map(item => insertLegislation(item, pipeline_connection));
        const caughtPromises = promises.map(promise => promise.catch(Error));
        return Promise.all(caughtPromises);
    } catch (err) {
        return Promise.reject(err);
    }

};

if (require.main === module) {
    const argv = require("yargs").argv;
    (async () => {
        try {
            const {connection} = await require("./common/setup")(argv.env);
            await run(
                connection,
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
