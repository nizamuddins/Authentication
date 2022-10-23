// require('dotenv').config()
const mongoose = require("mongoose");
// var encrypt = require('mongoose-encryption');
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const dataSchema = mongoose.Schema({
username:String,
password:String
})
dataSchema.plugin(passportLocalMongoose);


// dataSchema.plugin(encrypt, { secret:process.env.SECRET , encryptedFields: ['password']});

let User = mongoose.model("authentication",dataSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = {User};