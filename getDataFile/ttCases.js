const urlAdapter = require("./generic/url");
const uuidv1 = require('uuid/v1');
const moment = require('moment');
const constants = require('../constants');
const casemodel = require('../models/case');
const commonfuncs = require('../common/functions');

// search start date. it should not be earlier than 3 years before
const FROM_DATE = '[NOW-3YEARS TO NOW]';
const BASE_URL = 'https://forms.justice.govt.nz/';
const BASE_PDF_URL = BASE_URL + 'search/Documents/TTV2/PDF/';
// the max case count to end loop. Supposed to be < 20000 per year. 20000 * 3 years = 60000
const MAX_CASE_COUNT = 60000;

/**
 * get Tenancy Tribunal data from server
 *
 * @param pgPool
 * @param pgPromise
 * @param startIndex
 * @param batchSize
 * @returns {Promise<*>}
 */
const run = async (pgPool, pgPromise, startIndex, batchSize) => {
	try {
		console.log(`get data: start case: [${startIndex}], page size : [${batchSize}]`);
		if (startIndex > MAX_CASE_COUNT) {
			console.log(`the case index [${startIndex}] reach to the max case count [${MAX_CASE_COUNT}], end the loop`);
			return false;
		}
		const jsonURL = [
			BASE_URL + 'solr/TTV2/select?',
			'facet=true',
			'&start=' + startIndex,
			'&rows=' + batchSize,
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
		if (!Object.keys(tenancyData).length) {
			console.log("fail to get data from url :", jsonURL);
			return false;
		}
		console.log(`${constants.TTtype} response received...`);

		const casesNumFound = tenancyData['response']['numFound'];
		let hash = commonfuncs.getprojecthash();

		const formattedTenancyData = tenancyData['response']['docs'].map(doc => {
			const provider = doc['categoryCode'][0];
			const order_detail = JSON.parse(doc['orderDetailJson_s'][0]);
			const casedatefound = order_detail['dateOfIssue'];
			const case_date_object = moment(casedatefound, "DD/MM/YYYY").toDate();
			const db_key = uuidv1() + '.pdf';  // like '6c84fb90-12c4-11e1-840d-7b25c5ee775a.pdf'
			const case_key = provider + '_' + case_date_object.getTime() + '_' + db_key;
			const pdf_url = BASE_PDF_URL + order_detail['publishedOrderPdfName'];
			// citation format : [$year] NZTT $location $applicationNumber e.g '[2019] NZTT Hamilton 4213491'
			const citation = '[' + case_date_object.getFullYear() + '] NZ' + provider + ' ' + doc['tenancyCityTown_s'] + ' ' + doc['applicationNumber_s'];
			const case_name = doc['casePerOrg_s'].join(' vs ');
			//const case_text = doc['document_text_abstract']

			return casemodel.construct(
				fileProvider = constants.TTtype,
				fileKey = case_key,
				fileUrl = pdf_url,
				caseNames = [case_name],
				caseDate = case_date_object,
				caseCitations = [citation],
				dateProcessed = null,
				processingStatus = constants.unprocessedstatus,
				sourceCodeHash = hash,
				dateAccessed = new Date()
			);
		})

		return {
			data: formattedTenancyData,
			case_count_from_page: casesNumFound,
		};
	} catch (ex) {
		throw ex;
	}
}

if (require.main === module) {
	try {
		run();
	} catch (ex) {
		console.log(ex);
	}
} else {
	module.exports = run;
}


