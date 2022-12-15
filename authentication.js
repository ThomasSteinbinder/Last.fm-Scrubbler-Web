const LastFm = require("lastfm-node-client");

async function getLastFmUser(session_key) {
  try {
    const lastFm = new LastFm(API_KEY, SECRET, session_key);
    const user = await lastFm.userGetInfo();
    return user.user;
  } catch (err) {
    return null;
  }
}

function getLastFmObjectFrom(req) {
  const sessionKey = req.cookies.session_key;
  const lastFm = new LastFm(API_KEY, SECRET, sessionKey)
  return lastFm;
}

async function validateSession(req, res, next) {
  const session_key = req.cookies.session_key;
  const username = req.cookies.username;
  const user = await getLastFmUser(session_key);
  if (user && username == user.name) {
    next();
  } else {
    res.clearCookie("session_key");
    res.clearCookie("username");
    res.redirect("/")
  }
}

module.exports = {
  getLastFmUser,
  getLastFmObjectFrom,
  validateSession,
}