const express = require("express");
const app = express();
const PORT = 3000; // default port 8080;
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
app.use(cookieSession({
  name: 'session',
  keys: ['my keys'],
  maxAge: 24 * 60 * 60 * 1000 
}));

function generateRandomString() {
  let randomString = "";
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < 6; i++) {
  const randomPos = Math.floor(Math.random() * charSet.length);
  randomString += charSet.substring(randomPos, randomPos+1);
  }
  return randomString;
}

function checkIfUserExists (newEmail) {
  for(var userKey in users) {
    if(newEmail === users[userKey].email) {
      return users[userKey];
    }
  }
}

function urlsForUser(id) {
  let usersURLS = {};
  for(var shortURL in urlDatabase) {
    if(id === urlDatabase[shortURL].userID) {
      usersURLS[shortURL] = urlDatabase[shortURL];
    }
  }
  return usersURLS;   
}

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "test@test.com", 
    password: "test"
  }
}

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  if(users[req.session.user_id] === undefined) {
    res.redirect("/urls");
  }
  else {
    let templateVars = {
      urls: urlDatabase, 
        userID: users[req.session.user_id] 
    }
    res.render("urls_new", templateVars);
  }
});

app.get("/", (req, res) => {
  let templateVars = {
    userID: users[req.session.user_id]
  }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    userID: users[req.session.user_id]
  }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  //
  let templateVars = { 
    urls: urlsForUser(req.session.user_id),
    userID: users[req.session.user_id],
  };
  console.log("users: ", users);
  console.log("req session: ,", req.session);
  console.log("template vars: ", templateVars);

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    userID: users[req.session.user_id],
    urlString: req.params.shortURL  
  };

  res.render("urls_show", templateVars);
});

app.get("shortURL/u/:", (req, res) => {
  let templateVars = {
    userID: users[req.session.user_id]
  }
  let shortURL = req.params.shortURL;
  const longUrl = urlDatabase[shortURL];
  res.redirect(longUrl);
});

app.get("/register", (req, res) => {
  let templateVars = {
    email: req.body.email,
    password: req.body.password
  }
  res.render("registration", templateVars);
})

app.get("/login", (req, res) => {
  res.render("login");
})

app.post("/urls", (req, res) => {
  if(req.session['user_id']) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    urlDatabase[shortURL] =  { 
      longURL: longURL, 
      userID: users[req.session.user_id] 
    };
    res.redirect("/urls/" +shortURL);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.shortURL] = { 
    longURL: longURL, 
    userID: req.session["user_id"] 
  };
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let user = checkIfUserExists(req.body.email);
  if(user && bcrypt.compareSync(password, hashedPassword) === true) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
  else if (email.length === 0 || password.length === 0) {
    res.status(400);
    res.send('Please enter valid email and password');
  }
  else {
    res.status(403);
    res.send('User not found');
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const id = userID;
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  if (email.length === 0 || password.length === 0) {
    res.status(400);
    res.send('Please enter valid email and password');
  }
  if(checkIfUserExists(email)) {
    res.status(400);
    res.send('Email already a user');
  }
  else {
    const newUser = {
      id,
      email,
      password
    }
    users[userID] = newUser;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});