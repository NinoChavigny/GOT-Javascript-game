const express = require('express');
const app = express();
const path = require('path');

const port = process.env.PORT || 3000;

app.set('view engine','ejs');

//load assets static
app.use('/static',express.static(path.join(__dirname, 'public')))
app.use('/assets',express.static(path.join(__dirname, 'public/assets')))

//home route
app.get('/',(req,res)=>{
    res.render('base', {title : "Login System"});

})

app.listen(port, ()=>{console.log("Listening on port 3000")})