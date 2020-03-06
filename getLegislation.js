const getDataFile = require('./getDataFile')
const constants = require('./common/constants')
const legislationmodel = require('./common/models/legislation')

/**
 * get legislation data then save to databases
 *
 * @param pgPool
 * @param pgPromise
 * @param dataSource
 * @param dataLocation
 * @returns {Promise<void>}
 */
const run = async (pgPool, pgPromise, dataSource, dataLocation) => {
    // get multi-row insert sql
    const legislationData = await getDataFile(pgPool, pgPromise, dataSource, dataLocation)
    let legislationColumnSet = new pgPromise.helpers.ColumnSet(
        legislationmodel.getlabelsarray(),
        {table: {table: constants.legislationname, schema: constants.schemaname}}
    )

    // insert sql within a transaction
    let client = null
    try {
        client = await pgPool.connect()
        await client.query(constants.sqlbegin)
        const sql = pgPromise.helpers.insert(legislationData, legislationColumnSet)
        await client.query(sql)
        await client.query(constants.sqlcommit)
    } catch (err) {
        await client.query(constants.sqlrollback)
        throw err
    } finally {
        client && client.release()
    }
}

if (require.main === module) {
    const argv = require("yargs").argv
    (async () => {
        try {
            const {pgPoolConnection, pgPromise} = await require("./common/setup")(argv.env)
            await run(
                pgPoolConnection,
                pgPromise,
                argv.datasource,
                argv.datalocation
            )
        } catch (ex) {
            console.log(ex)
        }
    })().finally(process.exit)
} else {
    module.exports = run
}
