const TradeOfferManager = require('steam-tradeoffer-manager');

async function sendTrade(manager, toTradeUrl, assetid, appid, contextid) {
    return new Promise((resolve, reject) => {
        const offer = manager.createOffer(toTradeUrl);
        offer.addMyItem({ appid, contextid, assetid });
        offer.send((err, status) => {
            if (err) return reject(err);
            resolve(offer.id);
        });
    });
}

module.exports = { sendTrade };
