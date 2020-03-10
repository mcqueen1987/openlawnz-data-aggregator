const legislationtable = require('../constants/legislationtable')
const isrequired = require('../common/functions').isrequired

/** construct using the new keyword */
function construct(
    link = isrequired(),
    year = isrequired(),
    title = isrequired(),
    alerts = isrequired(),
    date_accessed = isrequired()
    ) {
    let output = {}
    output[legislationtable.link] = link
    output[legislationtable.year] = year
    output[legislationtable.title] = title
    output[legislationtable.alerts] = alerts
    output[legislationtable.date_accessed] = date_accessed
    return output
}
module.exports.construct = construct

module.exports.getlabelsarray = function() {
    return [
        legislationtable.link,
        legislationtable.year,
        legislationtable.title,
        legislationtable.alerts,
        legislationtable.date_accessed
    ]
}

module.exports.maparraytolegislation = (inputarray) =>
    inputarray.map((item) => 
        new construct(
            link = item.link,
            year = item.year,
            title = item.title,
            alerts = item.alerts,
            date_accessed = new Date()
        )
    )