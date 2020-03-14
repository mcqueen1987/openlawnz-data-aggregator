

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
    pageCountLabel: 'caseCountFromPage',
    carriageReturnNewLine: '\r\n'
}
module.exports = constants;

