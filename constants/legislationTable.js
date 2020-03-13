const constants = require('../constants')

const legislationTable = {
    link: 'link',
    year: 'year',
    title: 'title',
    alerts: 'alerts',
    dateAccessed: 'date_accessed'
}
module.exports.table = legislationTable;

const getCreateQuery = (tableName) => 
`CREATE TABLE ${constants.schemaName}.${tableName} (
link text NOT NULL,
year text NOT NULL,
title text NOT NULL,
alerts text NOT NULL,
date_accessed date NOT NULL
);

`
module.exports.getCreateQuery = getCreateQuery