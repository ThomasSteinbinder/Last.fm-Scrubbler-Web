require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')
const axios = require("axios");
const LastFm = require("lastfm-node-client");
const md5 = require("md5");
const expressLayouts = require("express-ejs-layouts");
const auth = require("./authentication");
const utils = require("./utils")
const Track = require("./models/track.js")


API_KEY = process.env.API_KEY;
SECRET = process.env.SECRET;
HOST = process.env.HOST;

const server = express();
server.use(cookieParser());
server.use(expressLayouts);
server.set("layout", "./layouts/default");
server.set("view engine", "ejs");
server.use(express.static("./public"));
const jsonParser = bodyParser.json()


server.get("/", (req, res) => {
  const session_key = req.cookies.session_key;
  const username = req.cookies.username;
  if (session_key && username) {
    res.redirect("home")
  } else {
    res.render("index", { API_KEY: API_KEY, REDIRECT_URL: `${HOST}/login`, layout: "layouts/index" });
  }
})

server.get("/login", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    res.render("error", { error: "Couldn't login" })
  }
  const api_signature = md5(`api_key${API_KEY}methodauth.getSessiontoken${token}${SECRET}`)
  try {
    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=auth.getSession&token=${token}&api_key=${API_KEY}&api_sig=${api_signature}&format=json`);
    const session = response.data.session;
    res.cookie("session_key", session.key)
    res.cookie("username", session.name)
    res.redirect("home")
  } catch (err) {
    console.log(err)
    res.render("error", { error: "Couldn't login" })
  }
})

server.get("/home", auth.validateSession, (req, res) => {
  const username = req.cookies.username;
  res.render("home", { username: username });
})

server.get("/me", auth.validateSession, async (req, res) => {
  const session_key = req.cookies.session_key;
  const user = await auth.getLastFmUser(session_key);
  res.send(user);
})

server.get("/about", async (req, res) => {
  if (await auth.isAuthenticated(req)) {
    res.render("about")
  } else {
    res.render("about", { layout: "./layouts/index" })
  }
})

server.get("/singleTrack", auth.validateSession, (req, res) => {
  res.render("singleTrack");
})

server.get("/fromFile", auth.validateSession, (req, res) => {
  res.render("scrobbleFromFile");
})

server.get("/friendScrobble", auth.validateSession, async (req, res) => {
  const lastFm = auth.getLastFmObjectFrom(req);
  try {
    const data = await lastFm.userGetFriends({
      user: req.cookies.username
    });
    //res.send(data.friends.user);
    res.render("scrobbleFromFriend", {
      friends: data.friends.user
    });
  } catch (ex) {
    console.log(ex)
    res.send({ 'err': "ex" })
  }
})

server.get("/friendScrobble/:user", auth.validateSession, async (req, res) => {
  res.redirect(`/friendScrobble/${req.params.user}/1`)
})

server.get("/friendScrobble/:user/:page", auth.validateSession, async (req, res) => {
  const lastFm = auth.getLastFmObjectFrom(req);
  try {
    const data = await lastFm.userGetRecentTracks({
      user: req.params.user,
      page: req.params.page
    });
    let tracks = []
    data.recenttracks.track.forEach(track => {
      let trackModel = new Track(track);
      tracks.push(trackModel)
    });

    const friend = await auth.getLastFmUser(req.cookies.session_key, req.params.user)
    const tracksPerPage = 50
    const numPages = friend.playcount / tracksPerPage > 9
      ? 10
      : Math.ceil(friend.playcount / tracksPerPage);

    res.render("latestScrobblesOfUser", {
      user: friend,
      tracks: tracks,
      numPages: numPages
    })
  } catch (ex) {
    console.log(ex)
    res.send({ 'err': "ex" })
  }
})

server.get("/latestTracks", auth.validateSession, async (req, res) => {
  const lastFm = auth.getLastFmObjectFrom(req);
  const data = await lastFm.userGetRecentTracks({
    user: req.cookies.username,
    limit: 9
  });
  res.send(data);
})

server.put("/scrobble", jsonParser, auth.validateSession, async (req, res) => {
  let scrobbleData = req.body;
  scrobbleData = utils.removeEmptyPropsFrom(scrobbleData);
  try {
    lastFm = auth.getLastFmObjectFrom(req);
    const response = await lastFm.trackScrobble(
      scrobbleData
    );
    if (response.scrobbles["@attr"].accepted != 1) {
      throw "scrobble not ok"
    }
    res.send("okay")
  } catch (err) {
    console.log(err);
    res.sendStatus(400)
  }
})

server.put("/scrobbleBatch", jsonParser, auth.validateSession, async (req, res) => {
  let scrobbleData = req.body;
  scrobbleData = utils.removeEmptyPropsFrom(scrobbleData);
  try {
    lastFm = auth.getLastFmObjectFrom(req);
    const response = await lastFm.trackScrobbleMany(
      scrobbleData
    );
    if (response.scrobbles["@attr"].accepted != scrobbleData.length) {
      throw "scrobble not ok"
    }
    res.send(response);
  } catch (err) {
    console.log(err);
    res.sendStatus(400)
  }
})


server.listen(3000, () => {
  console.log("Running on http://localhost:3000");
})