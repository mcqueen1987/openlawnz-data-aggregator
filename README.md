# openlawnz-data-aggregator

## General requirements

- Yarn
- Rename `.env.sample` to .env.`env` (e.g. `.env.local`) and fill in with Postgres details.

## Database Setup
We use Docker to download and provision the OpenLaw NZ database. Simply run docker.sh from [openlawnz-orchestration](https://github.com/openlawnz/openlawnz-orchestration) and then update your .env file.

There are 3 schemas:
`aggregator_cases`: this is populated by running the aggregator getCases
`pipeline_cases`: this is populated by running the pipeline and is not affected by the parsers
`cases`: this is populated and mutated by running the parsers
And check if it has correctly restored SQL dump file.

## env

Where you see the `env` option in a command, it will look for the corresponding ".env.`env`" file in the root of the project. You could have `.env.local` and `.env.dev`, for example.

If you're using [apify](https://www.apify.com/), then fill those details in your `.env`

## Installing

```bash
yarn install
```

### Description

- Procurement gets data from a `datasource` and loads it into PostgresSQL into a separate immutable database.

A `case` datastore must return an array of:

```javascript
{
  file_provider: "<string>", // e.g. jdo
  file_key: "<string>", // (must be unique) source-date-hash
  file_url: "<string>" // location of pdf file,
  case_name: "<string>" // case name,
  case_date: "<string>" // case date,
  citations: "<array<string>>" // citations string array
}
```

A `legislation` datastore must return an array of:

```javascript
{
  title: "<string>",
  link: "<string>",
  year: "<string>"
  alerts: "<string>"
}
```

### Running

#### Flags

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
node getCases.js --env=<env> --datasource=<datasource> --pagesize=<pagesize>
```
  - `pagesize` if we need to get data from datasource by chunks, pagesize is the number of cases per request
               without pagesize or pagesize=0 means get data from datasource at once, without pagination

*If one insert fails* you have to individually delete the rows of each table an issue has been create to resolve the issue.

Like So:  
```sql
DELETE FROM aggregator_cases.cases;
DELETE FROM aggregator_cases.case_names;
DELETE FROM aggregator_cases.citations;

SELECT * FROM aggregator_cases.cases;
```

#### Get Legislation

```bash
cd pipeline
node getLegislation.js --env=<env> --datasource=<datasource> [--datalocation=<datalocation>]
```

## NOTICE

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
