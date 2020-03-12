
const legislationtable = {
    link: 'link',
    year: 'year',
    title: 'title',
    alerts: 'alerts',
    dateAccessed: 'date_accessed'
}
module.exports.table = legislationtable;

const getCreateQuery = (tableName) => 
`CREATE TABLE ingest.${tableName} (
link text NOT NULL,
year text NOT NULL,
title text NOT NULL,
alerts text NOT NULL,
date_accessed date NOT NULL
);

`
module.exports.getCreateQuery = getCreateQuery