const express = require('express');
const router = require('./router');
const http = require('http');
const path = require('path');
const bodyparser = require("body-parser");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const WebSocket = require('ws');
var database = require('./database');
const req = require('express/lib/request');
const { json } = require('express/lib/response');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');



//load assets static
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true
}))

//home route
app.get('/', (req, res) => {
  res.render('base', { title: "Login Page" });

})

app.use('/route', router);





const wss = new WebSocket.Server({ server: server });

wss.on('connection', function connection(ws) {
  console.log('A new client Connected!');

  query = `SELECT * FROM rooms`;

  database.query(query, function (error, data) {

    if (data.length > 0) {
      let result = Object.values(JSON.parse(JSON.stringify(data)));
      console.log(result);
      ws.send(JSON.stringify(result));
    }
  });













  ws.on('message', function message(data) {
    const cleandata = data.toString();
    const dataparsed = JSON.parse(cleandata)

    var members = [];
    var roomid = ''; var uid = '';







    ///JOINING SYSTEM
    if (dataparsed[0] == 'join') {

      roomid = dataparsed[1];
      uid = dataparsed[2];


      query = `SELECT * FROM rooms`;

      database.query(query, function (error, data2) {

        if (data2.length > 0) {
          let result = Object.values(JSON.parse(JSON.stringify(data2)));
          for (i = 0; i < result.length; i++) {
            if (result[i]["room_id"] == roomid) {
              console.log("test result", JSON.parse(result[i]["room_members_id"]));
              members = JSON.parse(result[i]["room_members_id"]);
              console.log("members1", members);

            }
          }
        }

        members.push(uid);
        console.log("members2", members);

        string_tab = JSON.stringify(members);


        queryadd = `UPDATE rooms SET room_members_id = '${string_tab}' WHERE room_id = '${roomid}'`;

        database.query(queryadd);
        database.query(query, function (error, data3) {

          if (data3.length > 0) {
            let result = Object.values(JSON.parse(JSON.stringify(data3)));
            wss.clients.forEach(ws => {
              ws.send(JSON.stringify(result));
              var current_members = [];
              var new_members = [];
            })
          }
        });
      });



    }






          ///CREATING SYSTEM
          if (dataparsed[0] == 'create') {
            uid = dataparsed[1];
            roomname = dataparsed[2];
      
      
            createquery = `INSERT INTO rooms (room_name, room_members_id) VALUES ('${roomname}', JSON_ARRAY('${uid}'))`;
            database.query(createquery, function (error, data3) {

              query = `SELECT * FROM rooms`;
              database.query(query, function (error, data3) {
        
                if (data3.length > 0) {
                  let result = Object.values(JSON.parse(JSON.stringify(data3)));
                  wss.clients.forEach(ws => {
                    ws.send(JSON.stringify(result));
                  })
                }
              });






            });
      
      
      
          }



  });

});










server.listen(port, () => { console.log("Listening on port 3000") })

module.exports.server = server;