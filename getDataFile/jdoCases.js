const urlAdapter = require("./generic/url")
const MOJconstants = require('../constants/MOJresponse')
const constants = require('../constants')
const casemodel = require('../models/case')
const commonfuncs = require('../common/functions')

// Currently limited to 10 results for testing
const maxRows = 10
const fromDate = "2016-2-27"

const URL = [
	"https://forms.justice.govt.nz/solr/jdo/select",
	"?q=*",
	"&facet=true",
	"&facet.field=Location",
	"&facet.field=Jurisdiction",
	"&facet.limit=-1",
	"&facet.mincount=1",
	"&rows=" + maxRows,
	"&json.nl=map",
	`&fq=JudgmentDate%3A%5B${fromDate}T00%3A00%3A00Z%20TO%20*%20%5D`,
	"&sort=JudgmentDate%20desc",
	"&fl=CaseName%2C%20JudgmentDate%2C%20DocumentName%2C%20id%2C%20score",
	"&wt=json"
].join("")
module.exports.URL = URL

const run = async () => {
	try {
		const mojData = await urlAdapter(URL, MOJconstants.flattenedarraypath)
		console.log(`${constants.mojtype} response received...`)
		return mojData	
	} 
	
	catch (ex) {
		throw ex
	}
}

if (require.main === module) {
	try {
		run()
	} catch (ex) {
		console.log(ex)
	}
} else {
	module.exports.run = run
}

module.exports.maparraytocases = (inputarray) => {
	let output = {}
	output[constants.datalabel] = inputarray.map((currentitem) => {
		let hash = commonfuncs.getprojecthash()
        
        return new casemodel.construct(
            file_provider = constants.mojtype,
            file_key = `${constants.mojtype}_` + new Date(currentitem.JudgmentDate) + "_" + currentitem.DocumentName,
            file_url = "https://forms.justice.govt.nz/search/Documents/pdf/" + currentitem.id,
            case_names = [currentitem.CaseName],
            case_date = currentitem.JudgmentDate,
            citations = [commonfuncs.getCitation(currentitem.CaseName)],
            date_processed = null,
            processing_status = constants.unprocessedstatus,
            sourcecode_hash = hash,
            date_accessed = new Date()
        )	
	})
	return output
}

