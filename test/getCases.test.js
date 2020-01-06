let pgPromise = null;
let pgPool = null;
const dataSource = 'tt';
const dataLocation = '';
const getDataFile = require("./../getDataFile");
const saveAggregatorCases = require("../Database/saveAggregatorCases");
const initializeMockDatabase = require("./initializeMockDatabase");
const mockSchemaName = 'mock_aggregator_cases';

// One-Time DB Setup
beforeAll(() => {
    return initializeDatabase();
});

afterAll(() => {
    return disconnectDatabase();
});

async function initializeDatabase() {
    // create a mock schema for test
    await initializeMockDatabase.initiateMockSchema('openlawnz_db', 'aggregator_cases', mockSchemaName);
    // initialize database
    const argv = [];
    argv['env'] = 'local';
    const {pgPoolConnection, 'pgPromise': promise} = await require("./../common/setup")(argv.env);
    pgPool = pgPoolConnection;
    pgPromise = promise;
}

async function disconnectDatabase() {
    // drop the mock schema
    await initializeMockDatabase.dropMockSchema('openlawnz_db', mockSchemaName);
    pgPool && pgPool.end(); //shuts down all connection pools created in the process
}

test('get data from data source', async () => {
    // test get data
    const startIndex = 0;
    const pageSize = 3;
    const cases = await getDataFile(dataSource, dataLocation, startIndex, pageSize);
    // test cases have keys
    expect(cases).toHaveProperty('data');
    expect(cases).toHaveProperty('case_count_from_page');
    // test case number
    expect(cases['data'].length).toBe(pageSize);
    // test data keys
    expect(cases['data'][0]['file_provider']).toBe('TT');
    expect(cases['data'][0]['file_key']).toMatch(/\.pdf/);
    expect(cases['data'][0]['file_url']).toMatch(/https:\/\/forms\.justice\.govt\.nz\/search\/Documents/);
    expect(cases['data'][0]).toHaveProperty('name');
    expect(cases['data'][0]).toHaveProperty('case_date');
    expect(cases['data'][0]).toHaveProperty('case_text');
    expect(cases['data'][0]['citations'].length).toBeGreaterThanOrEqual(1);
}, 50000);

test('save aggregator cases', async () => {
    // initiate mock data
    const mockData = '{"data":[{"file_provider":"TT","file_key":"TT_1574852400000_bdffbb30-3003-11ea-9aeb-fbc6abc9b81d.pdf","file_url":"https://forms.justice.govt.nz/search/Documents/TTV2/PDF/5095372-Tenancy_Tribunal_Order.pdf","name":"...","case_date":"28/11/2019","citations":["[2019] NZTT Hamilton 4213491"],"case_text":"..."},{"file_provider":"TT","file_key":"TT_1574852400000_bdffbb30-3003-11ea-9aeb-fbc6abc9b82d.pdf","file_url":"https://forms.justice.govt.nz/search/Documents/TTV2/PDF/5095373-Tenancy_Tribunal_Order.pdf","name":"...","case_date":"28/11/2019","citations":["[2019] NZTT Hamilton 4213491"],"case_text":"..."},{"file_provider":"TT","file_key":"TT_1574852400000_bdffbb30-3003-11ea-9aeb-fbc6abc9b83d.pdf","file_url":"https://forms.justice.govt.nz/search/Documents/TTV2/PDF/5095374-Tenancy_Tribunal_Order.pdf","name":"...","case_date":"28/11/2019","citations":["[2019] NZTT Hamilton 4213491"],"case_text":"..."}],"case_count_from_page":40400}';
    const cases = JSON.parse(mockData);
    const mockCaseNumber = cases['data'].length;

    // get info before save to db
    // 1. cases
    const preTotalCaseNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.cases`);
    // 2. case_names
    const preTotalCaseNamesNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.case_names`);
    // 3. citations
    const preTotalCitationsNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.citations`);

    // save to db
    await saveAggregatorCases(pgPool, pgPromise, cases['data'], mockSchemaName);

    // get info after save to db
    // 1. cases
    let afterTotalCaseNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.cases`);
    // 2. case_names
    let afterTotalCaseNamesNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.cases`);
    // 3. citations
    let afterTotalCitationsNumber = await pgPool.query(`SELECT count(*) FROM ${mockSchemaName}.citations`);

    // test whether saved succeed
    // 1. cases
    let newCasesNumber = afterTotalCaseNumber['rows'][0]['count'] - preTotalCaseNumber['rows'][0]['count'];
    expect(newCasesNumber).toBe(mockCaseNumber);
    // 2. case_names
    let newCaseNamesNumber = afterTotalCaseNamesNumber['rows'][0]['count'] - preTotalCaseNamesNumber['rows'][0]['count'];
    expect(newCaseNamesNumber).toBe(mockCaseNumber);
    // 3. citations
    let totalCitationsFromPage = 0;
    cases['data'].forEach(item => {
        totalCitationsFromPage += item['citations'].length;
    });
    let newCitationsInserted = afterTotalCitationsNumber['rows'][0]['count'] - preTotalCitationsNumber['rows'][0]['count'];
    expect(newCitationsInserted).toBe(totalCitationsFromPage);
    // all test data gonna be deleted in function afterAll()
}, 30000);
