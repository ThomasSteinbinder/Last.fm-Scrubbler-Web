require("dotenv").config();
console.log(process.env.API_KEY);

const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const LastFm = require("lastfm-node-client");
const md5 = require("md5");
const expressLayouts = require("express-ejs-layouts");
const { render } = require("ejs");
// const { execMap } = require("nodemon/lib/config/defaults");
// const { acceptsCharset } = require("express/lib/request");

const API_KEY = process.env.API_KEY;
const SECRET = process.env.SECRET;

const server = express();
server.use(cookieParser());
server.use(expressLayouts);
server.set("layout", "./layouts/default");
server.set("view engine", "ejs");
server.use(express.static("./public"));


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
    res.render("index", { API_KEY: API_KEY, layout: "layouts/index" });
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

server.get("/home", validateSession, (req, res) => {
  const username = req.cookies.username;
  res.render("home", { username: username });
})

server.get("/me", validateSession, async (req, res) => {
  const session_key = req.cookies.session_key;
  const user = await getLastFmUser(session_key);
  res.send(user);
})


server.listen("3000", () => {
  console.log("Running on http://localhost:3000")
})