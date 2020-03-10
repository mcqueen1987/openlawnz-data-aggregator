const download = require("download")

const common = require("../../common/functions")

const run = async (url, pathArr) => {
    try {
        const jsonData = await download(url)

        if (!common.isJsonString(jsonData)) {
            console.log(`data from ${url} is not a valid json: ${jsonData}`)
            return
        }

        const json = JSON.parse(jsonData)
        return !pathArr ? json : common.getNestedObject(json, pathArr)
    } catch (ex) {
        throw ex
    }
}

if (require.main === module) {
    try {
        throw new Error("cannot be run individually.")
        //run()
    } catch (ex) {
        console.log(ex)
    }
} else {
    module.exports = run
}


