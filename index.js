const fs = require('fs');
const SteamUser = require('steam-user');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const SteamTotp = require('steam-totp');
const log = require('./log.js'); // RENKLİ LOG MODÜLÜ

const { sendTrade } = require('./trade.js');
const { confirmOfferWithRetry } = require('./guard.js');
const { incrementTradeCount, getTradeCount } = require('./counter.js');

// ==== GİRİŞ BANNER'I =====
const chalk = require('chalk');
console.log(chalk.greenBright('\n=============================================='));
console.log(chalk.cyanBright('      Steam Trade Farm Bot - V2.0.0'));
console.log(chalk.yellowBright('        Made by Kaan Akkaya'));
console.log(chalk.gray('        github.com/AkkayaKaan'));
console.log(chalk.greenBright('==============================================\n'));
// =========================

// ======= KOD =========
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const accounts = config.accounts;

const bots = [], communities = [], managers = [];
let loggedIn = [false, false];

for (let i = 0; i < 2; i++) {
    bots[i] = new SteamUser();
    communities[i] = new SteamCommunity();
    managers[i] = new TradeOfferManager({
        steam: bots[i],
        community: communities[i],
        language: 'en'
    });
}

function login(index) {
    bots[index].logOn({
        accountName: accounts[index].username,
        password: accounts[index].password,
        twoFactorCode: SteamTotp.generateAuthCode(accounts[index].shared_secret)
    });

    bots[index].on('webSession', (sessionid, cookies) => {
        managers[index].setCookies(cookies);
        communities[index].setCookies(cookies);
        loggedIn[index] = true;
        log.success(`Bot${index + 1} logged in.`);
        if (loggedIn[0] && loggedIn[1]) startLoop();
    });
}

login(0);
login(1);

function wait(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// case takası
async function loopTrade(from, to) {
    try {
        // 2.hesabın envanteri
        const inv = await getInventoryWithRetry(managers[from], 440, "2", 8);
        const item = inv.find(it => it.tradable && it.market_hash_name.toLowerCase().includes('case'));
        if (!item) {
            log.warn(`No tradable 'case' item found in Bot${from + 1}'s inventory. Waiting 15s...`);
            await wait(15000);
            return loopTrade(from, to);
        }

        // takas gönder
        const offerId = await trySendTradeWithRetry(managers[from], accounts[to].trade_url, item.assetid, item.appid, item.contextid);
        log.trade(`Trade sent. OfferID: ${offerId}`);

        // gönderen hesap guard
        await new Promise((resolve, reject) => {
            confirmOfferWithRetry(
                communities[from],
                accounts[from].identity_secret,
                offerId,
                0, 6, (err) => {
                    if (err && !String(err).includes("Could not find confirmation")) {
                        log.error(`Mobile confirmation failed: ${err}`);
                        reject(err);
                    } else {
                        log.success("Mobile confirmation successful!");
                        resolve();
                    }
                }
            );
        });

        // trade kabul (alıcı)
        await acceptAndConfirm(to, offerId, false);

        // takas durumu kontrol sikim soniği
        await waitForOfferAccepted(managers[from], offerId);

        incrementTradeCount();
        log.info(`Trade completed. Total trades: ${getTradeCount()}`);

        setTimeout(() => loopTrade(to, from), 800);
    } catch (err) {
        log.error(`Trade loop error: ${err}`);
        await wait(4000);
        setTimeout(() => loopTrade(from, to), 2000);
    }
}

async function getInventoryWithRetry(manager, appid, contextid, retries = 8) {
    for (let i = 0; i < retries; i++) {
        try {
            const inventory = await new Promise((resolve, reject) => {
                manager.getInventoryContents(appid, contextid, true, (err, inventory) => {
                    if (err) return reject(err);
                    resolve(inventory);
                });
            });
            if (inventory && inventory.length > 0) return inventory;
        } catch (err) {
            log.warn(`Could not fetch inventory, retrying... [${retries - i - 1} retries left]`);
            await wait(3000 + i * 1500);
        }
    }
    throw new Error('Could not fetch inventory or item not found.');
}

async function startLoop() {
    log.info("Both bots are ready. Starting trade loop...");
    loopTrade(0, 1);
}

async function trySendTradeWithRetry(manager, tradeUrl, assetid, appid, contextid, retries = 4) {
    for (let i = 0; i < retries; i++) {
        try {
            return await sendTrade(manager, tradeUrl, assetid, appid, contextid);
        } catch (err) {
            if (String(err).includes('26')) {
                log.warn("Steam rate limit warning: Waiting 8 seconds.");
                await wait(8000);
            } else {
                log.warn(`Trade send failed, retrying... (${i+1}/${retries})`);
                await wait(2000);
            }
        }
    }
    throw new Error('Failed to send trade offer after several attempts.');
}
//hayatımdan nefret ediyorum, sanırım kendimi öldürücem
async function acceptAndConfirm(botIndex, offerId, useMobileGuard = false) {
    return new Promise((resolve, reject) => {
        managers[botIndex].getOffer(offerId, async (err, offerObj) => {
            if (err) return reject(err);
            offerObj.accept((err) => {
                if (err) return reject(err);
                if (useMobileGuard) {
                    confirmOfferWithRetry(
                        communities[botIndex],
                        accounts[botIndex].identity_secret,
                        offerId,
                        0, 6, (err2) => {
                            if (err2) return reject(err2);
                            resolve();
                        }
                    );
                } else {
                    resolve();
                }
            });
        });
    });
}

async function waitForOfferAccepted(manager, offerId, maxTries = 20) {
    for (let i = 0; i < maxTries; i++) {
        await wait(1000);
        const offerState = await new Promise((resolve) => {
            manager.getOffer(offerId, (err, offer) => {
                if (err || !offer) return resolve(null);
                resolve(offer.state);
            });
        });
        if (offerState === 3) return true; // 3: Accepted
    }
    throw new Error('Trade offer is not accepted after waiting.');
}
