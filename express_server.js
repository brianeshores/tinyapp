var express = require("express");
var app = express();
var PORT = 8080; // default port 8080


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
  res.render("urls_new");
});
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] =longURL;
  console.log("url urlDatabase: ", urlDatabase); // Log the POST request body to the console
  res.send(shortURL);         // Respond with 'Ok' (we will replace this)
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});