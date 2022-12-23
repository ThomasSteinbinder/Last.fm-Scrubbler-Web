timeUtils = {

  localTime: function (dateUniversal) {
    let unixTime = dateUniversal.setMinutes(dateUniversal.getMinutes() - dateUniversal.getTimezoneOffset())
    return new Date(unixTime);
  },

  universalTime: function (dateLocal) {
    dateLocalCopy = new Date(dateLocal)
    const dateUniversal = new Date()
    let unixTime2 = dateLocalCopy.setMinutes(dateLocalCopy.getMinutes() + dateUniversal.getTimezoneOffset())
    const uni = new Date(unixTime2);
    return uni;
  }

}