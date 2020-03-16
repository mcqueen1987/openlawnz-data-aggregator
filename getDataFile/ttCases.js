const urlAdapter = require("./generic/url");
const uuidv1 = require('uuid/v1');
const moment = require('moment');
const constants = require('../constants');
const caseModel = require('../models/case');
const helpers = require('../common/functions');

// search start date. it should not be earlier than 3 years before
const fromDate = '[NOW-3YEARS TO NOW]';
const baseUrl = 'https://forms.justice.govt.nz/';
const basePdfUrl = baseUrl + 'search/Documents/TTV2/PDF/';
// the max case count to end loop. Supposed to be < 20000 per year. 20000 * 3 years = 60000
const maxCaseCount = 60000;

const rateLimitError = 'You hit the rate limit in parallel tests! Dont do that.';
const orderDetailKey = 'orderDetailJson_s';


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
		if (startIndex > maxCaseCount) {
			console.log(`the case index [${startIndex}] reach to the max case count [${maxCaseCount}], end the loop`);
			return false;
		}
		const jsonURL = [
			baseUrl + 'solr/TTV2/select?',
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
			'&fq=jurisdictionCode_s%3ATT%20AND%20publishedDate_dt%3A' + encodeURI(fromDate),
			'&wt=json'
		].join("");

		let tenancyData = await urlAdapter(jsonURL);

		if(helpers.isNullOrUndefined(tenancyData)) {
			throw new Error(rateLimitError);
		}

		if (!Object.keys(tenancyData).length) {
			throw new Error("fail to get data from url :", jsonURL);
			
		}
		console.log(`${constants.TTtype} response received...`);

		const casesNumFound = tenancyData['response']['numFound'];
		let hash = helpers.getProjectHash();

		const formattedTenancyData = tenancyData['response']['docs'].map(doc => {
			const provider = doc['categoryCode'][0];			
			const dateObject = moment(doc["publishedDate_s"][0], "DD/MM/YYYY").toDate();
			const dbKey = uuidv1() + '.pdf';  // like '6c84fb90-12c4-11e1-840d-7b25c5ee775a.pdf'
			const caseKey = provider + '_' + dateObject.getTime() + '_' + dbKey;
			const caseName = doc['casePerOrg_s'].join(' vs ');
			let pdfUrl = null;

			try {
				pdfUrl = basePdfUrl + doc[orderDetailKey][0]['publishedOrderPdfName'];
			}

			catch(error) {
				console.log(`TT record: ${caseName} didnt come with a backing pdf file!`);
			}
			// citation format : [$year] NZTT $location $applicationNumber e.g '[2019] NZTT Hamilton 4213491'
			const citation = '[' + dateObject.getFullYear() + '] NZ' + provider + ' ' + doc['tenancyCityTown_s'] + ' ' + doc['applicationNumber_s'];			
			//const case_text = doc['document_text_abstract']

			return caseModel.construct(
				fileProvider = constants.TTtype,
				fileKey = caseKey,
				fileUrl = pdfUrl,
				caseNames = [caseName],
				caseDate = dateObject,
				caseCitations = [citation],
				dateProcessed = null,
				processingStatus = constants.unprocessedStatus,
				sourceCodeHash = hash,
				dateAccessed = new Date()
			);
		});

		let output = {
			data: formattedTenancyData			
		};
		output[constants.pageCountLabel] = casesNumFound;
		return output;
	} 
	
	catch (ex) {
		console.log(ex);
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


