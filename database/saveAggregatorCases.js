/**
 * save cases
 *
 * @param pgPool
 * @param pgPromise
 * @param data
 * @param mockSchemaName, the mock schema name used for test, test data will save to mock schema but not dev/live db
 * @returns {Promise<never>}
 */
const run = async (pgPool, pgPromise, data, mockSchemaName = '') => {

    const dbSchema = mockSchemaName ? mockSchemaName : 'aggregator_cases';

    const getInsertCaseSql = (data) => {
        let casesColumnSet = new pgPromise.helpers.ColumnSet(
            ['file_key', 'file_provider', 'file_url', 'case_date', 'case_text'],
            {table: {table: 'cases', schema: dbSchema}}
        );
        const onConflictSql = ' ON CONFLICT(file_url) DO NOTHING RETURNING file_key';
        return pgPromise.helpers.insert(data, casesColumnSet) + onConflictSql;
    };

    const getInsertCaseNamesSql = (data) => {
        let caseNamesColumnSet = new pgPromise.helpers.ColumnSet(
            ['file_key', 'name'],
            {table: {table: 'case_names', schema: dbSchema}}
        );
        return pgPromise.helpers.insert(data, caseNamesColumnSet);
    };

    const getInsertCitationSql = (data) => {
        const {file_key, citations} = data;
        let citationsColumnSet = new pgPromise.helpers.ColumnSet(
            ['file_key', 'citation'],
            {table: {table: 'citations', schema: dbSchema}}
        );
        let wrappedCitations = citations.map(citation => ({
            file_key,
            citation
        }));
        return pgPromise.helpers.insert(wrappedCitations, citationsColumnSet);
    };

    /**
     * insert one row of case data
     * when insert ON CONFLICT(file_url), DO NOT save data to any table
     *
     * @param client
     * @param item
     * @returns {Promise<void>}
     */
    const insertOneRow = async (client, item) => {
        // insert cases
        const casesSql = getInsertCaseSql(item);
        const ret = await client.query(casesSql);
        if (!ret['rowCount']) {
            console.log(`skip duplicated data: ${JSON.stringify(item)}`);
            return;
        }

        // insert case_names
        const caseNamesSql = getInsertCaseNamesSql(item);
        await client.query(caseNamesSql);

        // insert citations
        const citationsSql = getInsertCitationSql(item);
        await client.query(citationsSql);
    };

    let client = null;
    try {
        // insert data into database by transaction
        // 1. initiate transaction
        client = await pgPool.connect();
        await client.query('BEGIN');
        // 2. insert data in batches
        await Promise.all(
            data.map(item => insertOneRow(client, item))
        );
        // 3. commit transaction
        await client.query('COMMIT');
    } catch (err) {
        client && await client.query('ROLLBACK');
        return Promise.reject(err);
    } finally {
        client && client.release();
    }
};


if (require.main === module) {
    try {
        throw new Error("cannot be run individually.");
        //run();
    } catch (ex) {
        console.log(ex);
    }
} else {
    module.exports = run;
}
