const casestable = require("../constants/casesTable").table;
const isrequired = require("../common/functions").isrequired;

/** construct using the new keyword */
function construct(
	fileProvider = isrequired(),
	fileKey = isrequired(),
	fileUrl = isrequired(),
	caseNames = isrequired(),
	caseDate = isrequired(),
	caseCitations = isrequired(),
	dateProcessed = isrequired(),
	processingStatus = isrequired(),
	sourceCodeHash = isrequired(),
	dateAccessed = isrequired()
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

module.exports.getlabelsarray = function() {
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
