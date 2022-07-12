if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}


const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const {initialize} = require('./utils/passport-config');

const port = 8000;

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));




const userDatabase = [];

initialize(passport, email => {
    return userDatabase.find(user => user.email == email);
}, id => {
    console.log(id);
    return userDatabase.find(user => user.id == id);
});

app.get("/", checkAuthenticated, (req, res) => {
    
    res.render('index.ejs', {
        name: req.user.name
    });
});
app.delete("/logout", (req, res) => {
    req.logout(err => {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get("/login", (req, res) => {
    
    res.render('login.ejs');
});
app.post("/login", passport.authenticate("local", {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get("/register", (req, res) => {
    
    res.render('register.ejs');
});
app.post("/register", async (req, res) => {
    
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        userDatabase.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
});



function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}



app.listen(port, () => {
    console.log(`server berjalan di port ${port}`)
});