const fs = require('fs');
const util = require('util');
const readFile = (fileName) => util.promisify(fs.readFile)(fileName, 'utf8');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [new winston.transports.Console()],
});


module.exports = {
    readFile,
    logger
}