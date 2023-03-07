var express = require("express");
var router = express.Router();
var database = require('./database');


/// login user
router.post('/login', (req, res)=>{

    var user_email_address = req.body.email;

    var user_password = req.body.password;

    console.log(req.body.email, req.body.user_password);
    

    query = `
    SELECT * FROM user_login 
    WHERE user_email = "${user_email_address}"
    `;

    database.query(query, function(error, data){
        console.log(data);


        if(data.length > 0)
        {
            for(var count = 0; count < data.length; count++)
            {
                if(data[count].user_password == user_password)
                {
                    req.session.user = user_email_address;
                    req.session.uid = data[count].user_id;
                    res.redirect('/route/dashboard');
                }
                else
                {
                    res.end("Invalid Username or Password")
                }
            }
        }
        else
        {
            res.end('Incorrect Email Address');
        }
        res.end();
    });

});

router.get('/signup', (req, res) => {
    res.render('signup', {title : "Sign up"})
})

/// login user
router.post('/signup', (req, res)=>{

    var email = req.body.email;

    var pass = req.body.password;

    var passconf = req.body.password_confirmation;

    if(pass != passconf){
        res.end('Passwords are not matching !');
    }

    console.log(req.body.email, req.body.password, req.body.password_confirmation);
    

    query = `SELECT user_email FROM user_login WHERE user_email = "${email}"`;
    
    query2 = `INSERT INTO user_login (user_email, user_password) VALUES ('${email}', '${pass}')`;




    database.query(query, function(error, data){


        if(data.length > 0)
        {
            res.end('Email Address already used !');
        }
        else
        {
            database.query(query2);
            res.redirect('/');
        }
    });

});


// route for dashboard
router.get('/dashboard', (req, res) => {
    if(req.session.user){
        res.render('dashboard', {user: req.session.user, uid : req.session.uid})
    }else{
        res.send("Unauthorize User")
    }
})

// route for logout
router.get('/logout', (req ,res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Error")
        }else{
            res.render('base', { title: "Express", logout : "logout Successfully...!"})
        }
    })
})


// route for logout
router.get('/play', (req ,res)=>{
    if(req.session.user){
        res.render('game', {user: req.session.user, uid : req.session.uid})
    }else{
        res.send("Unauthorize User")
    }
})

module.exports = router;