

const constants = {
    schemaname: 'ingest',
    legislationname: 'legislation',
    casesname: 'cases',
    sqlbegin: 'BEGIN',
    sqlcommit: 'COMMIT',
    sqlrollback: 'ROLLBACK',
    envfile: '.env.',
    asynctimeout: 60000,
    mojtype: 'moj',
    pcotype: 'pco',
    urltype: 'url',
    TTtype: 'tt', 
    localfiletype: 'localfile',
    caseentrypoint: 'getCases.js',
    legislationentrypoint: 'getLegislation.js',
    unprocessedstatus: 'UNPROCESSED'
}
module.exports = constants

