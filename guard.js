function confirmOfferWithRetry(community, identitySecret, offerId, attempt = 0, maxRetry = 10, cb) {
    community.acceptConfirmationForObject(identitySecret, offerId, (err) => {
        if (err) {
            attempt++;
            if (attempt > maxRetry) {
                console.error("Mobil onay tekrarlarında limit aşıldı! Hala başarısız.");
                if (cb) cb(err);
                return;
            }
            console.error(`Mobil onay başarısız (attempt ${attempt}), tekrar deneniyor...`, err.message || err);
            setTimeout(() => {
                confirmOfferWithRetry(community, identitySecret, offerId, attempt, maxRetry, cb);
            }, 15000);
        } else {
            //console.log("Mobil onay başarılı!");
            if (cb) cb(null);
        }
    });
}

module.exports = { confirmOfferWithRetry };
