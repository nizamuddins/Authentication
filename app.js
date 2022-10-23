//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

// var encrypt = require('mongoose-encryption');
// var md5 = require('md5'); 
// const  bcrypt = require('bcrypt'); 
// const saltRounds = 10;
// let UserName;
let sign=0;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: 'little secret',
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());  

mongoose.connect("mongodb+srv://nizam:nizam@cluster0.phabhjk.mongodb.net/authenticaton");

const dataSchema = mongoose.Schema({username: String, password: String,googleId: String});
// const dataSchema2 = mongoose.Schema({username:String,color:String})

dataSchema.plugin(passportLocalMongoose);
dataSchema.plugin(findOrCreate);


// dataSchema.plugin(encrypt, { secret:process.env.SECRET , encryptedFields:
// ['password']});

let User = mongoose.model("authentication", dataSchema);
// let User1 = mongoose.model("authentication1", dataSchema2);


passport.use(User.createStrategy());

passport.serializeUser((user,done)=>{
    done(null,user.id)
});
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    })
});
// ----------------------
passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
 async function(accessToken, refreshToken, profile, cb) {
    let find = await User.findOne({googleId: profile.id });
    console.log(find);
    console.log(sign)
    if(find === null && sign === 0){
        return cb(null);
    }else if(find!== null){
        User.findOne({googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
    else if(find === null && sign === 1){
        User.findOrCreate({googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }

  }
));
// ------------------

app.get("/", (req, res) => {
    res.render("home")
})

app.get("/signup", (req, res) => {
    sign = 1;
    res.render("signup");
})

    
// gooogle
app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] })
)

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: "/login"}),
  (req, res)=>{
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get("/login", (req, res) => {
    sign = 0;

    res.render("login")
})


app.get("/secrets", (req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/signup")
    }

})


// -------------
app.post("/signup", async (req, res) => {
UserName = req.body.username;
    User.register({username:req.body.username, active: false}, req.body.password, function(err, user) {
        if (err) { 
            console.log(err);
            res.redirect("/signup");
         }else{
             passport.authenticate("local")(req,res, ()=>{
                 res.redirect("/secrets")
             })
         }
    })
   
})


app.post("/login",  async(req, res) => {
    UserName = req.body.username;
    let user = new User({
        username:req.body.username,
        password:req.body.password
    })
    req.login(user,(err)=>{
        if(err){
            console.log(err)
            res.redirect('/login')
        }else{
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets")
            })
        }
    })

    // let find = await User1.find({username:UserName});
    // for(let i=0;i<find.length;i++){
    //     console.log(find[i].color)

    // }
})

app.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if (err) { 
            console.log(err)
        }
        res.redirect('/');
    });
})

// app.post("/post",async(req,res)=>{
//     let data1 = new User1({username:UserName,color:req.body.text});
//     let result = await data1.save();
// res.end()
// })

app.listen(3000, () => {
    console.log("server is started")
})