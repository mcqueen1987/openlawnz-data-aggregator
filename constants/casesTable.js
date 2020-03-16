const constants = require('../constants');

const casesTable = {
	fileProvider: "file_provider",
	fileKey: "file_key",
	fileUrl: "file_url",
	caseNames: "case_names",
	caseDate: "case_date",
	caseCitations: "case_citations",
	dateProcessed: "date_processed",
	processingStatus: "processing_status",
	sourceCodeHash: "sourcecode_hash",
	dateAccessed: "date_accessed"
};
module.exports.table = casesTable;

const getCreateQuery = (tableName) => 
`CREATE TABLE ${constants.schemaName}.${tableName} (
file_provider text NOT NULL,
file_key text NOT NULL,
file_url text NOT NULL,
case_names text[] NOT NULL,
case_date date NOT NULL,
case_citations text[] NOT NULL,
date_processed date,
sourcecode_hash text NOT NULL,
date_accessed date NOT NULL,
processing_status ${constants.schemaName}.processing_status NOT NULL
);

`;
module.exports.getCreateQuery = getCreateQuery;
