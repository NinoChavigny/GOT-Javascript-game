var express = require("express");
var router = express.Router();
var database = require('./database');

const  credential = {
    email : "admin@gmail.com",
    password : "admin123"
}

// login user
router.post('/login', (req, res)=>{

    var user_email_address = req.user_email_address;

    var user_password = req.user_password;

    if(user_email_address && user_password)
    {
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
    }
    else
    {
        res.end('Please Enter Email Address and Password Details');
    }

});

// route for dashboard
router.get('/dashboard', (req, res) => {
    if(req.session.user){
        res.render('dashboard', {user : req.session.user})
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

module.exports = router;