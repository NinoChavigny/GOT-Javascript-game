const express = require('express');
const router = require('./router');
const http = require('http');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const {v4: uuidv4 } = require("uuid");
const WebSocket  = require('ws');
var database = require('./database');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine','ejs');



//load assets static
app.use('/static',express.static(path.join(__dirname, 'public')))
app.use('/assets',express.static(path.join(__dirname, 'public/assets')))

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}))

//home route
app.get('/',(req,res)=>{
    res.render('base', {title : "Login Page"});

})

app.use('/route', router);

const wss = new WebSocket.Server({ server:server });

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');
  ws.send('Welcome New Client!');


  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

});

server.listen(port, ()=>{console.log("Listening on port 3000")})

module.exports.server = server;