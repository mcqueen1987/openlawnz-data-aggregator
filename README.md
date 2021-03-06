[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![](https://badgen.net/dependabot/openlawnz/openlawnz-data-aggregator/214537725=?icon=dependabot)

# openlawnz-data-aggregator

## General requirements

- Yarn
- Rename `.env.sample` to .env.`env` (e.g. `.env.local`) and fill in with Postgres details.

## Database Setup

Clone the [database project](https://github.com/openlawnz/openlawnz-database) and follow its readme file to start a local environment database.

## env

Where you see the `env` option in a command, it will look for the corresponding ".env.`env`" file in the root of the project. You could have `.env.local` and `.env.dev`, for example.

If you're using [apify](https://www.apify.com/), then fill those details in your `.env`

## Installing

```bash
yarn install
```

### Description

- Procurement gets data from a `datasource` and loads it into a postgres database server named `openlawnz_db` and a schema named `ingest`.

A `case` datastore must return an array of:

```javascript
{
  file_provider: "<string>", // e.g. jdo
  file_key: "<string>", // (must be unique) source-date-hash
  file_url: "<string>" // location of pdf file,
  case_names: "<array<string>>" // case names,
  case_date: "<date>" // case date,
  case_citations: "<array<string>>" // citations string array
  date_processed: '<date>'
  processing_status: '<enum>' //UNPROCESSED, PROCESSING, PROCESSED
  sourcecode_hash: '<string>'
  date_accessed: '<date>'
}
```

A `legislation` datastore must return an array of:

```javascript
{
  title: "<string>";
  link: "<string>";
  year: "<string>";
  alerts: "<string>";
  date_accessed: "<date_accessed>";
}
```

### Running the project

There are two entrypoint files depending on which type of data you wish to aggregate: `getCases.js` and `getLegislation.js`. Each take the same parameters.

#### Parameters

_datasource_:

- `moj` Data from the Ministry of Justice's database. Only works when `getCases.js` is the entrypoint.

- `pco` Data scraped from the Parliamentary Council Office. Only works when `getLegislation.js` is the entrypoint.

- `localfile` A JSON file in similar format to data in the /exampledata folder. Requires --datalocation .

- `url` general URL to cases or legislation. Be very careful with this. Requires --datalocation .

- `tt` Data from the Tenancy Tribunal's decision search. Requires --pageSize .

_resorcelocator_:

- a local json file OR
- a url

It should be within double quotes otherwise it may not send the entire url.

_pagesize_:
  
  pagesize of a Tenancy Tribunal (TT) paginated response.

  Requires --datasource=tt

#### Get Cases

```bash
cd pipeline
node getCases.js --env=<env> --datasource=<datasource>
```

If insertion into the database fails, you have to individually delete the rows of each table.

Like So:

```sql
DELETE FROM ingest.cases;
DELETE FROM ingest.legislation;

SELECT * FROM ingest.cases;
```

#### Get Legislation

```bash
cd pipeline
node getLegislation.js --env=<env> --datasource=pco
```

#### Example Usage

```
node getCases.js --env=<local> --datasource=moj
```

You can find an example of the data from different sources in the `/exampledata` folder.

## Using the PCO data source

You will need to be given administrative access to the OpenLawNZ Apify account. Add the following variables to your .env file:

- APIFY_TASK_ID
- APIFY_TOKEN

## Using the TT data source

The Tenancy Tribunal provides a paged response which can be used with the following command.

```
node getCases.js --env=<local> --datasource=tt --pagesize=1000
```

#### Testing

run `Jest --runInBand` in the root directory. It's important that Tenancy Tribunal tests are run in series as parallel tests can trigger the APIs ratelimit.

Or, prss `F5` to use the vscode breakpoints set up in the launch.json file.

WARNING: It is EXTREMELY IMPORTANT that we don't DDOS the government servers due to overtesting!

Table name is passed as argument into the program to isolate side effects between tests.

### Linting

run the following command to check any mistakes regarding our style convention:

```
npm run eslint "./**/*.js"
```

## NOTICE

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
