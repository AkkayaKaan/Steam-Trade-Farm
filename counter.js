const fs = require('fs');
const file = './trade_count.json';

function incrementTradeCount() {
    let count = 0;
    if (fs.existsSync(file)) {
        count = JSON.parse(fs.readFileSync(file, 'utf-8')).count;
    }
    count++;
    fs.writeFileSync(file, JSON.stringify({ count }), 'utf-8');
    return count;
}

function getTradeCount() {
    if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf-8')).count;
    }
    return 0;
}

module.exports = { incrementTradeCount, getTradeCount };
