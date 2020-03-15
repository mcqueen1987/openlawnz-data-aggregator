const urlAdapter = require("./generic/url");
const constants = require('../constants');
const envConsts = require('../constants/environment');

function getURL(){
    return [
        `https://api.apify.com/v2/actor-tasks/${process.env[envConsts.apifyTaskId]}`,
        `/runs/last/dataset/items`,
        `?token=${process.env[envConsts.apifyToken]}`,
        `&format=json`,
        `&simplified=true`
    ].join("");
}

module.exports.URL = getURL;

const run = async () => {

    try {
        let url = getURL();
        const apifyData = await urlAdapter(url);
        console.log(`${constants.pcoType} response received...`);
        return apifyData;
    } 
    
    catch (ex) {
        throw ex;
    }
};

if (require.main === module) {
    try {
        run();
    } catch (ex) {
        console.log(ex);
    }
} else {
    module.exports.run = run;
}


