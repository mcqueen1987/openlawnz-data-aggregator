

const constants = {
    schemaName: 'ingest',
    legislationName: 'legislation',
    casesName: 'cases',
    sqlBegin: 'BEGIN',
    sqlCommit: 'COMMIT',
    sqlRollback: 'ROLLBACK',
    envFile: '.env.',
    asyncTimeout: 60000,
    mojType: 'moj',
    pcoType: 'pco',
    urlType: 'url',
    TTtype: 'tt', 
    localFileType: 'localfile',
    caseEntryPoint: 'getCases.js',
    legislationEntryPoint: 'getLegislation.js',
    unprocessedStatus: 'UNPROCESSED',
    dataLabel: 'data',
    pageCountLabel: 'case_count_from_page'
}
module.exports = constants;

