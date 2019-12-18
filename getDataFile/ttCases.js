const urlAdapter = require("./generic/url");
const uuidv1 = require('uuid/v1');
const moment = require('moment');

// Get Tenancy Tribunal
// case count per request
const BATCH_SIZE = 1000;
// search start date. it should not be earlier than 3 years before
const FROM_DATE = '[NOW-3YEARS TO NOW]';
const BASE_URL = 'https://forms.justice.govt.nz/';
const BASE_PDF_URL = BASE_URL + 'search/Documents/TTV2/PDF/';
// sleep 5 seconds per request
const REQUEST_INTERVAL_MS = 5000;
// the max case count to end loop. Supposed to be < 20000 per year. 20000 * 3 years = 60000
const MAX_CASE_COUNT = 60000;

const run = async (pgPool, pgPromise) => {
    let caseCountFromPage = 1;
    try {
        for (let startIndex = 0; startIndex < caseCountFromPage && startIndex < MAX_CASE_COUNT; startIndex += BATCH_SIZE) {
            console.log(`total number: ${caseCountFromPage}, start case: ${startIndex}, page size : ${BATCH_SIZE}`);
            const jsonURL = [
                BASE_URL + 'solr/TTV2/select?',
                'facet=true',
                '&start=' + startIndex,
                '&rows=' + BATCH_SIZE,
                '&hl.requireFieldMatch=true',
                '&hl.usePhraseHighlighter=true',
                '&facet.limit=-1',
                '&facet.mincount=-1',
                '&sort=decisionDateIndex_l%20desc',
                '&json.nl=map',
                '&q=*',
                '&fq=jurisdictionCode_s%3ATT%20AND%20publishedDate_dt%3A' + encodeURI(FROM_DATE),
                '&wt=json'
            ].join("");

            let tenancyData = await urlAdapter(jsonURL);
            if (!tenancyData) {
                console.log("fail to get data from url :", jsonURL);
                continue;
            }

            const casesNumFound = tenancyData['response']['numFound'];
            if (casesNumFound > caseCountFromPage) {
                caseCountFromPage = casesNumFound;
            }

            const formattedTenancyData = tenancyData['response']['docs'].map(doc => {
                const provider = doc['categoryCode'][0];
                const order_detail = JSON.parse(doc['orderDetailJson_s'][0]);
                const case_date = order_detail['dateOfIssue'];
                const case_date_object = moment(case_date, "DD/MM/YYYY").toDate();
                const db_key = uuidv1() + '.pdf';  // like '6c84fb90-12c4-11e1-840d-7b25c5ee775a.pdf'
                const case_key = provider + '_' + case_date_object.getTime() + '_' + db_key;
                const pdf_url = BASE_PDF_URL + order_detail['publishedOrderPdfName'];
                //  citation format : [$year] NZTT $location $applicationNumber; e.g '[2019] NZTT Hamilton 4213491'
                const citations = '[' + case_date_object.getFullYear() + '] NZ' + provider + ' ' + doc['tenancyCityTown_s'] + ' ' + doc['applicationNumber_s'];
                const case_name = doc['casePerOrg_s'].join(' vs ');
                const case_text = doc['document_text_abstract'];
                return {
                    case_provider: provider,
                    case_key: case_key,
                    pdf_url: pdf_url,
                    case_name: case_name,
                    case_date: case_date,
                    citations: citations,
                    case_text: case_text.trim(),
                };
            });

            // insert data into database by transaction
            let tenancyColumnSet = new pgPromise.helpers.ColumnSet(
                ['case_provider', 'case_key', 'pdf_url', 'case_name', 'case_date', 'citations', 'case_text'],
                {table: {table: 'tenancy_tribunal', schema: 'aggregator_cases'}}
            );

            let client = null;
            try {
                client = await pgPool.connect();
                await client.query('BEGIN');
                const setDateStyleSql = 'SET datestyle = dmy;';
                // Do nothing ON CONFLICT(pdf_url, case_name)
                const onConflictSql = ' ON CONFLICT(pdf_url, case_name) DO NOTHING';
                const sql = setDateStyleSql + pgPromise.helpers.insert(formattedTenancyData, tenancyColumnSet) + onConflictSql;
                await client.query(sql);
                await client.query('COMMIT');
            } catch (err) {
                await client.query('ROLLBACK');
                throw err
            } finally {
                client && client.release();
            }
            // sleep 5s between calls
            await new Promise(resolve => setTimeout(resolve, REQUEST_INTERVAL_MS));
        }
    } catch (ex) {
        throw ex;
    }
};

if (require.main === module) {
    try {
        run();
    } catch (ex) {
        console.log(ex);
    }
} else {
    module.exports = run;
}
