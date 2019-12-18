const getDataFile = require("./getDataFile");
const path = require('path');

/**
 * Get cases
 * @param Postgres pipeline_connection
 */
const run = async (connection, pgPromise, dataSource, dataLocation) => {
  console.log("Getting cases data file");

  const insertCase = async (data, db = connection) => {
    const { file_key, case_name, file_provider, file_url, case_date, citations } = data;
    const sql = `INSERT INTO aggregator_cases.cases 
    (file_key, file_provider, file_url, case_date)
    VALUES ($1,$2,$3,$4) RETURNING file_key`;
    try {
      const fk = await db.query(sql, [file_key, file_provider, file_url, case_date]);
      if (fk) {
        const promises = citations.map(citation => insertCitation({ file_key, citation }));
        promises.push(insertCaseName({ file_key, name: case_name }));
        const caughtPromises = promises.map(promise => promise.catch(Error));
        return Promise.all(caughtPromises);
      }
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const insertCitation = async ({ file_key, citation }, db = connection) => {
    const sql = 'INSERT INTO aggregator_cases.citations (file_key, citation) VALUES ($1,$2) RETURNING file_key';
    try {
      const res = await db.query(sql, [file_key, citation]);
      if (res) return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const insertCaseName = async ({ file_key, name }, db = connection) => {
    try {
      const sql = 'INSERT INTO aggregator_cases.case_names (file_key, name) VALUES ($1,$2) RETURNING file_key';
      const res = await db.query(sql, [file_key, name]);
      if (res) return Promise.resolve(res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  try {
    const dataFile = await getDataFile(pgPool, pgPromise, dataSource, dataLocation);
    const promises = dataFile.map(c => insertCase(c, connection));
    const caughtPromises = promises.map(promise => promise.catch(Error));
    return Promise.all(caughtPromises);
  } catch (err) {
    return Promise.reject(err);
  }
};

if (require.main === module) {
  const argv = require("yargs").argv;
  (async () => {
    try {
      const { connection, pgPromise } = await require("./common/setup")(
        argv.env
      );
      await run(connection, pgPromise, argv.datasource, argv.datalocation);
    } catch (ex) {
      console.log(ex);
    }
  })().finally(process.exit);
} else {
  module.exports = run;
}
