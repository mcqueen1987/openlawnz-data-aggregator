const fs = require('fs');
const path = require('path');
const childprocess = require('child_process');

module.exports.makeLogger = () => {
	var logDir;
	var logFile;
	var logFileWithoutExtension;
	var logFileExtension;

	return {
		setLogDir: dir => {
			logDir = dir;
		},
		setLogFile: fileName => {
			logFile = path.basename(fileName);
			var logFileSplit = logFile.split('.');
			logFileWithoutExtension = logFileSplit[0];
			logFileExtension = 'txt';
		},
		log: (data, append, appendFileName) => {
			if (!process.env.SUPPRESS_LOGGING) {
				if (!logFile) {
					console.log(data);
				} else {
					if (Array.isArray(data)) {
						data = data.join('\t');
					}
					var method = !append ? fs.writeFileSync : fs.appendFileSync;
					var currentLogFile = !appendFileName ? logFile: `${logFileWithoutExtension}-${appendFileName}.${logFileExtension}`;
					method(path.join(logDir, currentLogFile), data);
				}
			}
		}
	};
};

module.exports.insertSlash = function(citation, insertString) {
	var first = citation.substring(0, 4);
	var second = citation.substring(4);
	return first + insertString + second;
};

// https://hackernoon.com/accessing-nested-objects-in-javascript-f02f1bd6387f
module.exports.getNestedObject = (nestedObj, pathArr) => {
	return pathArr.reduce(
		(obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined),
		nestedObj
	);
};

module.exports.getCitation = function(str) {
	const regCite = /(\[?\d{4}\]?)(\s*?)NZ(D|F|H|C|S|L)(A|C|R)(\s.*?)(\d+)*/;
	// try for neutral citation
	if (str.match(regCite)) {
		return str.match(regCite)[0];
	} else {
		// try for other types of citation
		const otherCite = /((\[\d{4}\])(\s*)NZ(D|F|H|C|S|L)(A|C|R)(\s.*?)(\d+))|((HC|DC|FC) (\w{2,4} (\w{3,4}).*)(?=\s\d{1,2} ))|(COA)(\s.{5,10}\/\d{4})|(SC\s\d{0,5}\/\d{0,4})/;
		if (str.match(otherCite)) {
			return str.match(otherCite)[0];
		} else {
			return null;
		}
	}
};

module.exports.isJsonString = function(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};

module.exports.isRequired = function() {
	throw new Error('A function argument was required but not given.');
};

/** returns the hash of the current commit on the current branch. */
module.exports.getProjectHash = () =>
	childprocess.execSync('git rev-parse HEAD');

const isNullOrUndefined = subject => subject === null || subject === undefined;
module.exports.isNullOrUndefined = isNullOrUndefined;

module.exports.getTableName = function(defaultName, inputTableName) {
	let tableNameUsed = defaultName;

	if(isNullOrUndefined(inputTableName) === false) {
		tableNameUsed = inputTableName;
		console.log(`using tablename: ${tableNameUsed}`);
	}    
	return tableNameUsed;
};
