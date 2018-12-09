const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

let date = new Date();

module.exports.inventory = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/inventory/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.input = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/input/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.output = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/output/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.report = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/report/report(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.PO = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/PO/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.supplier = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/supplier/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});

module.exports.finished_good = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.File({ filename: `./log/finished_good/info(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log` }),
    new transports.File({ filename: `./log/error/error(${ date.getDate() }-${ date.getMonth() + 1 }-${ date.getFullYear() }).log`, level: 'error'})
  ]
});
