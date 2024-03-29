
var express = require("express");
var router = express.Router();
var database = require('./database');
const server = require('./server');
var serverIPAddress = require("ip").address();



///Connexion utilisateur via MySQL
router.post('/login', (req, res) => {
    var user_email_address = req.body.email;

    var user_password = req.body.password;

    console.log(req.body.email, req.body.user_password);


    query = `
    SELECT * FROM user_login 
    WHERE user_email = "${user_email_address}"
    `;

    database.query(query, function (error, data) {
        console.log(data);


        if (data.length > 0) {
            for (var count = 0; count < data.length; count++) {
                if (data[count].user_password == user_password) {
                    req.session.user = user_email_address;
                    req.session.uid = data[count].user_id;
                    res.redirect('/route/dashboard');
                }
                else {
                    res.end("Invalid Username or Password")
                }
            }
        }
        else {
            res.end('Incorrect Email Address');
        }
        res.end();
    });

});

///Redirection page Inscription utilisateur via MySQL
router.get('/signup', (req, res) => {
    res.render('signup', { title: "Sign up" })
})

///Inscription utilisateur via MySQL
router.post('/signup', (req, res) => {

    var email = req.body.email;

    var pass = req.body.password;

    var passconf = req.body.password_confirmation;

    if (pass != passconf) {
        res.end('Passwords are not matching !');
    }

    console.log(req.body.email, req.body.password, req.body.password_confirmation);


    query = `SELECT user_email FROM user_login WHERE user_email = "${email}"`;

    query2 = `INSERT INTO user_login (user_email, user_password) VALUES ('${email}', '${pass}')`;




    database.query(query, function (error, data) {


        if (data.length > 0) {
            res.end('Email Address already used !');
        }
        else {
            database.query(query2);
            res.redirect('/');
        }
    });

});


//Redirection vers le tableau de bord
router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user, uid: req.session.uid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})

//Déconnexion utilisateur
router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send("Error")
        } else {
            res.render('base', { title: "Express", logout: "logout Successfully...!" })
        }
    })
})


//Redirection vers la partie de jeu selectionnée
router.get('/play', (req, res) => {
    if (req.session.user && req.session.uid == req.query.uid) {
        req.session.roomid = req.query.roomid;
        console.log(req.session.roomid)
        res.render('game', { title: 'Game', user: req.session.user, uid: req.session.uid, roomid: req.session.roomid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})

///redirection page pistes influences
router.get('/influences', (req, res) => {
    if (req.session.user && req.session.uid) {
        res.render('influences', { title: 'Influence', user: req.session.user, uid: req.session.uid, roomid: req.session.roomid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})

///Redirection carte de jeu
router.get('/home', (req, res) => {
    if (req.session.user) {
        res.render('game', { title: 'Game', user: req.session.user, uid: req.session.uid, roomid: req.session.roomid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})


///Redirection vers page des cartes Westeros et Wildings
router.get('/gamecards', (req, res) => {
    if (req.session.user && req.session.uid) {
        res.render('gamecards', { title: 'gamecards', user: req.session.user, uid: req.session.uid, roomid: req.session.roomid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})

///Redirection vers l'inventaire du joueur
router.get('/inventory', (req, res) => {
    if (req.session.user && req.session.uid) {
        res.render('inventory', { title: 'inventory', user: req.session.user, uid: req.session.uid, roomid: req.session.roomid, serverIPAddress: serverIPAddress })
    } else {
        res.send("Unauthorize User")
    }
})

console.log("router ip", serverIPAddress)

module.exports = router;