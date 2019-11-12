const getDataFile = require("./getDataFile");
const path = require('path');

/**
 * Get cases
 * @param Postgres pipeline_connection
 */
const run = async (connection, pgPromise, datasource, datalocation) => {
  console.log("Getting cases data file");

  const insertCase = (data, db = connection) => new Promise((resolve, reject) => {
    const { file_key, case_name, file_provider, file_url, case_date, citations } = data;
    const sql = `INSERT INTO aggregator_cases.cases 
    (file_key, file_provider, file_url, case_date)
    VALUES ($1,$2,$3,$4)
    RETURNING file_key`;
    db.query(sql, [file_key, file_provider, file_url, case_date])
    .then(fk => {
      return insertCaseName({ file_key, name: case_name });
    })
      .then(async fk => {
        const promises = citations.map(citation => insertCitation({ file_key, citation }));
        const caughtPromises = promises.map(promise => promise.catch(Error));
        return Promise.all(caughtPromises);
      })
      .then(() => resolve())
      .catch(e => reject(e));
  });
  
  const insertCitation = ({ file_key, citation }, db = connection) => new Promise((resolve, reject) => {
    const sql = `INSERT 
    INTO aggregator_cases.citations (file_key, citation) VALUES ($1,$2)`;
    db.query(sql, [file_key, citation])
    .then(() => resolve())
    .catch(e => reject(e));
  });
  
  const insertCaseName = ({ file_key, name }, db = connection) => new Promise((resolve, reject) => {
    const sql = `INSERT 
    INTO aggregator_cases.case_names (file_key, name) VALUES ($1,$2)
    RETURNING file_key`;
    db.query(sql, [file_key, name])
      .then(() => resolve())
      .catch(e => reject(e));
  });  

  try {
    const dataFile = await getDataFile(datasource, datalocation);
    const promises = dataFile.map(c => insertCase(c,connection));
    const caughtPromises = promises.map(promise => promise.catch(Error));
    return Promise
      .all(caughtPromises)
      .then(() => {
        console.log('Done');
      })
      .catch(e => {
        console.error(e);
      });
  } catch (e) {
    throw e;
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
