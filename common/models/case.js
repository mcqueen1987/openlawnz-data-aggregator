const casestable = require("../constants/casestable")
const isrequired = require('../functions').isrequired

/** construct using the new keyword */
function construct(
    file_provider = isrequired(), 
    file_key = isrequired(), 
    file_url = isrequired(), 
    case_names = isrequired(), 
    case_date = isrequired(), 
    case_citations = isrequired(), 
    date_processed = isrequired(), 
    processing_status = isrequired(), 
    sourcecode_hash = isrequired(), 
    date_accessed = isrequired()
    ) {
    let output = {}
    output[casestable.file_provider] = file_provider
    output[casestable.file_key] = file_key
    output[casestable.file_url] = file_url
    output[casestable.case_names] = case_names
    output[casestable.case_date] = case_date
    output[casestable.case_citations] = case_citations
    output[casestable.date_processed] = date_processed
    output[casestable.processing_status] = processing_status
    output[casestable.sourcecode_hash] = sourcecode_hash
    output[casestable.date_accessed] = date_accessed
    return output
}
module.exports.construct = construct

module.exports.getlabelsarray = function() {
    return [
        casestable.file_provider,
        casestable.file_key,
        casestable.file_url,
        casestable.case_names,
        casestable.case_date,
        casestable.case_citations,
        casestable.date_processed,
        casestable.processing_status,
        casestable.sourcecode_hash,
        casestable.date_accessed
    ]
}