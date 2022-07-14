const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const md5 = require("md5");
const { render } = require("ejs");

const API_KEY = "e63f42bdfc9a9c68d07abda93767e5f2";
const SECRET = "7603091c2684d07e1802a8aa0d9e1a40";

const server = express();
server.use(cookieParser());
server.set("view engine", "ejs")

function validateSessionCookie(req, res, next) {
  const { cookies } = req;
  if ("session_key" in cookies) {
    // validate session
    next();
  } else {
    res.redirect("/")
  }
}

server.get("/", (req, res) => {
  res.render("index", { API_KEY: API_KEY, test: "yay" });
})

server.get("/login", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    res.render("error", { error: "Couldn't login" })
  }
  let api_signature = md5(`api_key${API_KEY}methodauth.getSessiontoken${token}${SECRET}`)
  try {
    let response = await axios.get(`http://ws.audioscrobbler.com/2.0/?method=auth.getSession&token=${token}&api_key=${API_KEY}&api_sig=${api_signature}&format=json`);
    const session = response.data.session;
    res.cookie("session_key", session.key)
    res.cookie("username", session.name)
    res.redirect("home")
  } catch(err) {
    console.log(err)
    res.render("error", { error: "Couldn't login" })
  }
})

server.get("/home", validateSessionCookie, (req, res) => {
  session_key = req.cookies.session_key;
  username = req.cookies.username;
  if (session_key && username) {
    res.render("home", {username: username});
  } else {
    res.redirect("index")
  }
})


server.listen("3000", () => {
  console.log("Running on http://localhost:3000")
})