var appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new winston.transports.File({ filename: '${appRoot}/logs/info.log' })
  ]
});

module.exports = logger;