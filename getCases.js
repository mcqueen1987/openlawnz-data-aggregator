const getDataFile = require("./getDataFile");
const saveAggregatorCases = require("./Database/saveAggregatorCases");
const constants = require('./constants');
const setup = require('./common/setup');
const helpers = require('./common/functions');
// case count per request
const BATCH_SIZE = 1000;
// sleep 5 seconds per request
const REQUEST_INTERVAL_MS = 5000;

/**
 * get cases
 *
 * @param pgPool
 * @param pgPromise
 * @param argvs
 * @returns Promise<void>
 */
const run = async (pgPool, pgPromise, dataSource, resourceLocator, tableName = null, pageSize = null) => {
    console.log('starting getCases.js');
    let tableNameUsed = helpers.getTableName(tableName)

    try {
        // without pagination
        if (helpers.isNullOrUndefined(pageSize)) {
            const dataresult = await getDataFile(pgPool, pgPromise, dataSource, resourceLocator, constants.casesName);
            await saveAggregatorCases(dataresult[constants.dataLabel], pgPool, pgPromise, tableNameUsed);
            return Promise.resolve();
        }

        // get and save data by pagination, one page per request, default page size is BATCH_SIZE
        let totalCaseCount = 0;
        let startIndex = 0;
        const safePageSize = pageSize <= 0 ? BATCH_SIZE : pageSize;
        for (let startIndex = 0; startIndex <= totalCaseCount; startIndex += safePageSize) {
            const dataresult = await getDataFile(pgPool, pgPromise, dataSource, resourceLocator, constants.casesName, startIndex, safePageSize);
            
            // set total case count if not set
            if (totalCaseCount === 0) {
                totalCaseCount = dataresult[constants.pageCountLabel];
                console.log(`total case count: [${totalCaseCount}]`);
            }
            await saveAggregatorCases(dataresult[constants.dataLabel], pgPool, pgPromise, tableNameUsed);
            // sleep between calls
            await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
            console.log(`data saved: start index [${startIndex}] page size [${safePageSize}]`);
        }
        return Promise.resolve();
    } 
    
    catch (err) {
        return Promise.reject(err);
    }
}

if (require.main === module) {
    setup.startApplication(run);
} else {
    module.exports = run;
}
