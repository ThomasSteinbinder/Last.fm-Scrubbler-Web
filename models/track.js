module.exports = class Track {
  constructor(track) {
    this.title = track.name;
    this.artist = track.artist['#text'];
    this.cover = track.image[0]['#text'];
    this.url = track.url;
    this.scrobbleDate = track.date ? track.date.uts : 0;
    this.scrobbleDateString = this.getlocalScrobbleDateString(track);
  }

  getlocalScrobbleDateString(track) {
    if (!track.date) {
      if (track["@attr"].nowplaying) {
        return "now playing...";
      } else {
        return "unavailable";
      }
    }
    const scrobbleDateUnix = track.date.uts
    let scrobbleDate = new Date(scrobbleDateUnix * 1000);
    let unixTime = scrobbleDate.setMinutes(scrobbleDate.getMinutes() - scrobbleDate.getTimezoneOffset())
    const scrobbleDateLocal = new Date(unixTime)
    const scrobbleDateString = `${scrobbleDateLocal.toISOString().substring(0, 10)} ${scrobbleDateLocal.toISOString().substring(11, 16)}`
    return scrobbleDateString;
  }
}