const express = require("express");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const app = express();

app.use(session({
    secret: 'little secret',
    resave: false,
    saveUninitialized: false,
  }))

app.use(passport.initialize());
app.use(passport.session());  

mongoose.connect("mongodb+srv://nizam:nizam@cluster0.phabhjk.mongodb.net/authenticaton");
// mongoose.set("useCreateIndex",true);