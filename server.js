const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const LastFm = require("lastfm-node-client");
const md5 = require("md5");
const expressLayouts = require("express-ejs-layouts");
const { render } = require("ejs");
// const { execMap } = require("nodemon/lib/config/defaults");
// const { acceptsCharset } = require("express/lib/request");

const API_KEY = "e63f42bdfc9a9c68d07abda93767e5f2";
const SECRET = "7603091c2684d07e1802a8aa0d9e1a40";

const server = express();
server.use(cookieParser());
server.use(expressLayouts);
server.set("layout", "./layouts/default.ejs")
server.set("view engine", "ejs");


async function validateSessionCookie(req, res, next) {
  const cookies = req.cookies;
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

function getUserFromRequest(req) {
  session_key = req.cookies.session_key;
}

async function getLastFmUser(session_key) {
  try {
    const lastFm = new LastFm(API_KEY, SECRET, session_key);
    const user = await lastFm.userGetInfo();
    return user.user;
  } catch (err) {
    return null;
  }
}

server.get("/", (req, res) => {
  const session_key = req.cookies.session_key;
  const username = req.cookies.username;
  if (session_key && username) {
    console.log("/ to home")
    res.redirect("home")
  } else {
    console.log("/ to index")
    res.render("index", { API_KEY: API_KEY });
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

server.get("/home", validateSessionCookie, (req, res) => {
  const username = req.cookies.username;
  res.render("home", { username: username });
})

server.get("/me", (req, res) => {
  getLastFmUser();
  res.render("home", { username: "test" })
})


server.listen("3000", () => {
  console.log("Running on http://localhost:3000")
})