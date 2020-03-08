const getDataFile = require("./getDataFile")
const saveAggregatorCases = require("./Database/saveAggregatorCases")
const constants = require('./constants')
// case count per request
const BATCH_SIZE = 1000
// sleep 5 seconds per request
const REQUEST_INTERVAL_MS = 5000

/**
 * get cases
 *
 * @param pgPoolConnection
 * @param pgPromise
 * @param argvs
 * @returns {Promise<*>}
 */
const run = async (pgPoolConnection, pgPromise, argvs) => {
    const {'datasource': dataSource, 'datalocation': dataLocation, 'pagesize': pageSize} = argvs
    try {
        // without pagination
        if (isNaN(pageSize)) {
            const dataFile = await getDataFile(pgPoolConnection, pgPromise, dataSource, dataLocation, constants.casesname)
            await saveAggregatorCases(dataFile, pgPoolConnection, pgPromise)
            return Promise.resolve()
        }

        // get and save data by pagination, one page per request, default page size is BATCH_SIZE
        let totalCaseCount = 0
        let startIndex = 0
        const safePageSize = pageSize <= 0 ? BATCH_SIZE : pageSize
        for (let startIndex = 0; startIndex <= totalCaseCount; startIndex += safePageSize) {
            const dataFile = await getDataFile(pgPoolConnection, pgPromise, dataSource, dataLocation, constants.casesname, startIndex, safePageSize)
            if (!dataFile) {
                return Promise.reject('get empty data from server, need to debug manually!')
            }
            // set total case count if not set
            if (!totalCaseCount) {
                totalCaseCount = dataFile['case_count_from_page']
                console.log(`total case count: [${totalCaseCount}]`)
            }
            await saveAggregatorCases(dataFile['data'], pgPoolConnection, pgPromise)
            // sleep between calls
            await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS))
            console.log(`data saved: start index [${startIndex}] page size [${safePageSize}]`)
        }
    } catch (err) {
        return Promise.reject(err)
    }
}

if (require.main === module) {
    const yargs = require("yargs")
    let argv = yargs.argv
    
    (async () => {
        try {
            const {pgPoolConnection, pgPromise} = await require("./common/setup")(argv.env)
            await run(
                pgPoolConnection,
                pgPromise,
                argv
            )
        } catch (ex) {
            console.log(ex)
        }
    })().finally(process.exit)
} else {
    module.exports = run
}
