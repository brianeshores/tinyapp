const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
    // console.log("id: ", id);
    // console.log("id in database:", urlDatabase[shortURL].id)
    // console.log("shortURL ", urlDatabase[shortURL]);
    // console.log("database ", urlDatabase);
    if(id === urlDatabase[shortURL].userID) {
      usersURLS.urls = urlDatabase[shortURL].longURL;
    }
  }
  console.log(usersURLS);
  return usersURLS;   
}



// console.log("randomString: ", randomString);
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
  console.log("cookie: ", req.cookies);
  console.log("users: ", users);
  if(users[req.cookies.user_id] === undefined) {
    res.redirect("/urls");
  }
  else {
    let templateVars = {
      urls: urlDatabase, 
        userID: users[req.cookies.user_id] 
    }
    res.render("urls_new", templateVars);
  }
});

app.get("/", (req, res) => {
  let templateVars = {
    userID: users[req.cookies.user_id]
  }
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    userID: users[req.cookies.user_id]
  }
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { 
    urls: urlDatabase, 
    userID: users[req.cookies.user_id],
  };
  console.log("for user urls: ", urlsForUser(req.cookies.user_id));

  // console.log("url database:", urlDatabase);

  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    userID: users[req.cookies.user_id],
    urlString: req.params.shortURL  
  };

  res.render("urls_show", templateVars);
});

app.get("shortURL/u/:", (req, res) => {
  let templateVars = {
    userID: users[req.cookies.user_id]
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
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  console.log("longURL ", req.body.longURL);
  let templateVars = {
    userID: users[req.cookies.user_id]
  }
  urlDatabase[shortURL] = longURL;
  console.log("urlDatabase: ", urlDatabase);
  res.redirect("/urls/" +shortURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  let templateVars = {
    userID: users[req.cookies.user_id]
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let templateVars = {
    userID: users[req.cookies.user_id]
  }
  urlDatabase[req.params.shortURL] = req.body.longURL
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = checkIfUserExists(req.body.email);
  if(user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
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
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const id = userID;
  const email = req.body.email;
  const password = req.body.password;

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
    res.cookie("user_id", id);
    console.log("register body: ", req.body);
    console.log('register: ', req.params);
    console.log('users database ', users);
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});