const urlAdapter = require("./generic/url");
const MOJconstants = require('../constants/MOJresponse');
const constants = require('../constants');
const caseModel = require('../models/case');
const helpers = require('../common/functions');

// Currently limited to 10 results for testing
const maxRows = 10;
const fromDate = "2016-2-27";

const URL = [
	"https://forms.justice.govt.nz/solr/jdo/select",
	"?q=*",
	"&facet=true",
	"&facet.field=Location",
	"&facet.field=Jurisdiction",
	"&facet.limit=-1",
	"&facet.mincount=1",
	"&rows=" + maxRows,
	"&json.nl=map",
	`&fq=JudgmentDate%3A%5B${fromDate}T00%3A00%3A00Z%20TO%20*%20%5D`,
	"&sort=JudgmentDate%20desc",
	"&fl=CaseName%2C%20JudgmentDate%2C%20DocumentName%2C%20id%2C%20score",
	"&wt=json" 
].join(""); 
module.exports.URL = URL;

const run = async () => {
	try {
		const mojData = await urlAdapter(URL, MOJconstants.flattenedArrayPath);
		console.log(`${constants.mojType} response received...`);
		return mojData;
	}

	catch (ex) {
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
	module.exports.run = run;
}

module.exports.mapArrayToCases = (inputarray) => {
	let output = {};
	output[constants.dataLabel] = inputarray.map((currentitem) => {
		let hash = helpers.getProjectHash();

		return new caseModel.construct(
			fileProvider = constants.mojType,
			fileKey = `${constants.mojType}_` + (+new Date(currentitem.JudgmentDate)) + "_" + currentitem.DocumentName,
			fileUrl = "https://forms.justice.govt.nz/search/Documents/pdf/" + currentitem.id,
			caseNames = [currentitem.CaseName],
			caseDate = currentitem.JudgmentDate,
			caseCitations = [helpers.getCitation(currentitem.CaseName)],
			dateProcessed = null,
			processingStatus = constants.unprocessedStatus,
			sourceCodeHash = hash,
			dateAccessed = new Date()
		);
	});
	return output;
};

