const legislationTable = require('../constants/legislationTable').table;
const isRequired = require('../common/functions').isRequired;

/** construct using the new keyword */
function construct(
    link = isRequired(),
    year = isRequired(),
    title = isRequired(),
    alerts = isRequired(),
    dateAccessed = isRequired()
) {
    let output = {};
    output[legislationTable.link] = link;
    output[legislationTable.year] = year;
    output[legislationTable.title] = title;
    output[legislationTable.alerts] = alerts;
    output[legislationTable.dateAccessed] = dateAccessed;
    return output;
}
module.exports.construct = construct;

module.exports.getLabelsArray = function () {
    return [
        legislationTable.link,
        legislationTable.year,
        legislationTable.title,
        legislationTable.alerts,
        legislationTable.dateAccessed
    ];
};

module.exports.mapArrayToLegislation = (inputarray) =>
    inputarray.map((item) =>
        new construct(
            link = item.link,
            year = item.year,
            title = item.title,
            alerts = item.alerts,
            dateAccessed = new Date()
        )
    );

