var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  let randomString = "";
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 6; i++) {
  var randomPos = Math.floor(Math.random() * charSet.length);
  randomString += charSet.substring(randomPos, randomPos+1);
  }
  return randomString;
}

// console.log("randomString: ", randomString);
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new");
});

app.get("/", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]
  };
  console.log("username:" , req.cookies["username"]);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    username: req.cookies["username"],
    urlString: req.params.shortURL  
  };
  res.render("urls_show", templateVars);
});

app.get("shortURL/u/:", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  let shortURL = req.params.shortURL;
  const longUrl = urlDatabase[shortURL];
  res.redirect(longUrl);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let templateVars = {
    username: req.cookies["username"]
  }
  urlDatabase[shortURL] =longURL;
  console.log("urlDatabase: ", urlDatabase);
  res.redirect("/urls/" +shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let templateVars = {
    username: req.cookies["username"]
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");

});

app.post("/urls/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});