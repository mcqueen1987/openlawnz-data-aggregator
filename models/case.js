const casestable = require("../constants/casesTable").table;
const isRequired = require("../common/functions").isRequired;

/** construct using the new keyword */
function construct(
	fileProvider = isRequired(),
	fileKey = isRequired(),
	fileUrl = isRequired(),
	caseNames = isRequired(),
	caseDate = isRequired(),
	caseCitations = isRequired(),
	dateProcessed = isRequired(),
	processingStatus = isRequired(),
	sourceCodeHash = isRequired(),
	dateAccessed = isRequired()
) {
	let output = {};
	output[casestable.fileProvider] = fileProvider;
	output[casestable.fileKey] = fileKey;
	output[casestable.fileUrl] = fileUrl;
	output[casestable.caseNames] = caseNames;
	output[casestable.caseDate] = caseDate;
	output[casestable.caseCitations] = caseCitations;
	output[casestable.dateProcessed] = dateProcessed;
	output[casestable.processingStatus] = processingStatus;
	output[casestable.sourceCodeHash] = sourceCodeHash;
	output[casestable.dateAccessed] = dateAccessed;
	return output;
}
module.exports.construct = construct;

module.exports.getLabelsArray = function() {
	return [
		casestable.fileProvider,
		casestable.fileKey,
		casestable.fileUrl,
		casestable.caseNames,
		casestable.caseDate,
		casestable.caseCitations,
		casestable.dateProcessed,
		casestable.processingStatus,
		casestable.sourceCodeHash,
		casestable.dateAccessed
	];
};
