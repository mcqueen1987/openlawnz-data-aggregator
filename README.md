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
  title: "<string>"
  link: "<string>"
  year: "<string>"
  alerts: "<string>"
  link: '<string>'
  year: '<string>'
  date_accessed: '<date_accessed>'
}
```

### Running the project

#### Parameters

*datasource*:

  - `moj` (only works for `getCases.js`)
  - `pco` (only works for `getLegislation.js`)
  - `localfile` (requires `datalocation`)
  - `url` (requires `datalocation`)

*datalocation*:

  - a local json file OR
  - a url

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

#### Example Usage

```
node getCases.js --env=local --datasource=jdo
```

#### Get Legislation

```bash
cd pipeline
node getLegislation.js --env=<env> --datasource=<datasource> [--datalocation=<datalocation>]
```

## NOTICE

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
