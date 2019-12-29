module.exports = async (pgPool, pgPromise, dataSource, dataLocation, startIndex = 0, batchSize = 1) => {
    if (!dataSource) {
        throw new Error("Missing datasource");
    }
    let retData;
    switch (dataSource) {
        case 'moj':
            retData = await require("./jdoCases")();
            break;
        case 'pco':
            if (!process.env.APIFY_USER_ID || !process.env.APIFY_CRAWLER_ID || !process.env.APIFY_TOKEN) {
                throw new Error("Missing Apify env variables");
            }
            retData = await require("./pcoLegislation")();
            break;
        case 'url':
            if (!dataLocation) {
                throw new Error("Missing datalocation");
            }
            retData = await require("./generic/url")(dataLocation);
            break;
        case 'localfile':
            if (!dataLocation) {
                throw new Error("Missing datalocation");
            }
            retData = await require("./generic/localfile")(dataLocation);
            break;
        case 'tt':
            retData = await require("./ttCases")(pgPool, pgPromise, startIndex, batchSize);
            break;
        default:
            try {
                retData = JSON.stringify(JSON.parse(dataSource));
            } catch (ex) {
                throw ex;
            }
    }
    return retData;
};
