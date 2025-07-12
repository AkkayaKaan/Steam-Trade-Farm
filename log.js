const chalk = require('chalk');

function getTimestamp() {
    return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
}

module.exports = {
    info: (...args) => console.log(getTimestamp(), chalk.blue('[INFO]'), ...args),
    success: (...args) => console.log(getTimestamp(), chalk.green('[SUCCESS]'), ...args),
    warn: (...args) => console.log(getTimestamp(), chalk.yellow('[WARN]'), ...args),
    error: (...args) => console.log(getTimestamp(), chalk.red('[ERROR]'), ...args),
    trade: (...args) => console.log(getTimestamp(), chalk.cyan('[TRADE]'), ...args),
};
