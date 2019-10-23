const getDataFile = require("./getDataFile");
/**
 * Get cases
 * @param Postgres pipeline_connection
 */
const run = async (connection, pgPromise, datasource, datalocation) => {
  console.log("Getting cases data file");

  const dataFile = await getDataFile(datasource, datalocation);

  const cs = new pgPromise.helpers.ColumnSet(
    ["processing_status", "date_inserted", "date_pdf_stored"],
    { table: "pipeline_cases" }
  );

  const values = dataFile.map(d => ({
    ...d,
    date_aggregated: +new Date(),
    processing_status: 0
  }));

  const query =
    pgPromise.helpers.insert(values, cs) +
    " ON CONFLICT(id) DO UPDATE SET " +
    cs.assignColumns({ from: "EXCLUDED", skip: "pdf_db_key" });

    await connection.none(query);
    
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
