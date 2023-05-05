lastFmUtils = {
    getlocalScrobbleDateString: function (scrobbleDateUnix) {
        if (scrobbleDateUnix == 0) {
            return "now playing..."
        }
        let scrobbleDate = new Date(scrobbleDateUnix * 1000);
        const localUnix = scrobbleDate.setMinutes(scrobbleDate.getMinutes() - scrobbleDate.getTimezoneOffset())
        const scrobbleDateLocal = new Date(localUnix)
        const scrobbleDateString = `${scrobbleDateLocal.toISOString().substring(0, 10)} ${scrobbleDateLocal.toISOString().substring(11, 16)}`
        return scrobbleDateString;
    }
}