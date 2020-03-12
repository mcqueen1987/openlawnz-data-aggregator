const legislationtable = require('../constants/legislationTable').table
const isrequired = require('../common/functions').isrequired

/** construct using the new keyword */
function construct(
    link = isrequired(),
    year = isrequired(),
    title = isrequired(),
    alerts = isrequired(),
    dateAccessed = isrequired()
) {
    let output = {};
    output[legislationtable.link] = link;
    output[legislationtable.year] = year;
    output[legislationtable.title] = title;
    output[legislationtable.alerts] = alerts;
    output[legislationtable.dateAccessed] = dateAccessed;
    return output;
}
module.exports.construct = construct

module.exports.getlabelsarray = function () {
    return [
        legislationtable.link,
        legislationtable.year,
        legislationtable.title,
        legislationtable.alerts,
        legislationtable.dateAccessed
    ];
}

module.exports.maparraytolegislation = (inputarray) =>
    inputarray.map((item) =>
        new construct(
            link = item.link,
            year = item.year,
            title = item.title,
            alerts = item.alerts,
            dateAccessed = new Date()
        )
    )

