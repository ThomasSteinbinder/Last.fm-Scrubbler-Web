const LastFm = require("lastfm-node-client");

async function getLastFmUser(session_key, username = undefined) {
  try {
    const lastFm = new LastFm(API_KEY, SECRET, session_key);
    let user = undefined;
    if (username == undefined) {
      user = await lastFm.userGetInfo();
    } else {
      user = await lastFm.userGetInfo({ user: username });
    }
    return user.user;
  } catch (err) {
    console.log("oh boii...")
    return null;
  }
}

function getLastFmObjectFrom(req) {
  const sessionKey = req.cookies.session_key;
  const lastFm = new LastFm(API_KEY, SECRET, sessionKey)
  return lastFm;
}

async function isAuthenticated(req) {
  const session_key = req.cookies.session_key;
  const username = req.cookies.username;
  const user = await getLastFmUser(session_key);
  return (user && username == user.name)
}

async function validateSession(req, res, next) {
  const session_key = req.cookies.session_key;
  const username = req.cookies.username;
  const user = await getLastFmUser(session_key);

  if (user && username == user.name) {
    res.cookie("user", JSON.stringify(user));
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
  isAuthenticated,
  validateSession,
}