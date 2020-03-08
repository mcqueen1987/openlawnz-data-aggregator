const constants = require('../constants')
const casemodel = require('../models/case')

/**
 * save cases
 *
 * @param data
 * @param pgPool
 * @param pgPromise
 * @returns {Promise<never>}
 */
const run = async (data, pgPool, pgPromise) => {

    const getInsertCaseSql = (onecase) => {
        let casesColumnSet = new pgPromise.helpers.ColumnSet(
            casemodel.getlabelsarray(),
            {table: {table: constants.casesname, schema: constants.schemaname}}
        )
        return pgPromise.helpers.insert(onecase, casesColumnSet)
    }


    /**
     * insert one row of case data
     * when insert ON CONFLICT(file_url), DO NOT save data to any table
     *
     * @param client
     * @param onecase
     * @returns {Promise<void>}
     */
    const insertOneRow = async (client, onecase) => {
        // insert cases
        const casesSql = getInsertCaseSql(onecase)
        const ret = await client.query(casesSql)
        if (!ret['rowCount']) {
            console.log(`skip duplicated data: ${JSON.stringify(onecase)}`)
            return
        }
        await client.query(citationsSql)
    }

    let client = null
    try {
        // insert data into database by transaction
        // 1. initiate transaction
        client = await pgPool.connect()
        await client.query(constants.sqlbegin)
        // 2. insert data in batches
        await Promise.all(
            data.map(currentcase => insertOneRow(client, currentcase))
        )
        // 3. commit transaction
        await client.query(constants.sqlcommit)
    } catch (err) {
        client && await client.query(constants.sqlrollback)
        return Promise.reject(err)
    } finally {
        client && client.release()
    }
}


if (require.main === module) {
    try {
        throw new Error("cannot be run individually.")
        //run()
    } catch (ex) {
        console.log(ex)
    }
} else {
    module.exports = run
}
