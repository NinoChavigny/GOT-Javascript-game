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
const { info } = require('console');

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

wss.on('connection', function connection(ws, req) {
  console.log('A new client Connected!');
  console.log(req.url);

  if(req.url == "/"){
  query = `SELECT * FROM rooms`;

  database.query(query, function (error, data) {

    if (data.length > 0) {
      let result = Object.values(JSON.parse(JSON.stringify(data)));
      ///console.log(result);
      ws.send(JSON.stringify(result));
    }
  }); }













  ws.on('message', function message(data) {
    const cleandata = data.toString();
    const dataparsed = JSON.parse(cleandata)
    console.log(dataparsed)

    var members = [];
    var roomid = ''; var uid = '';







    ///JOINING SYSTEM
    if (dataparsed[0] == 'join') {

      roomid = dataparsed[1];
      uid = dataparsed[2];


      query = `SELECT * FROM rooms where room_id=${roomid}`;
      queryfinal = `SELECT * FROM rooms`;

      database.query(query, function (error, data2) {

        if (data2.length > 0) {
              let result = Object.values(JSON.parse(JSON.stringify(data2)));
              ///console.log("test result", JSON.parse(result[0]["room_members_id"]));
              members = JSON.parse(result[0]["room_members_id"]);
              ///console.log("members1", members);
        
          if(members.length < 4){
            members.push(uid);
            string_tab = JSON.stringify(members);

            if(members.length == 4){
              querystart = `UPDATE rooms SET room_members_id = '${string_tab}', game_info = '{"started": 1}' WHERE room_id = '${roomid}'`
              database.query(querystart);
              }
            else{
              queryadd = `UPDATE rooms SET room_members_id = '${string_tab}' WHERE room_id = '${roomid}'`;
            database.query(queryadd);
            }}

        database.query(queryfinal, function (error, data3) {

          if (data3.length > 0) {
            let result = Object.values(JSON.parse(JSON.stringify(data3)));
            wss.clients.forEach(ws => {
              ws.send(JSON.stringify(result));
              var current_members = [];
              var new_members = [];
            })
          }
        });
        }

        
      });



    }






    ///CREATING SYSTEM
    if (dataparsed[0] == 'create') {
      uid = dataparsed[1];
      roomname = dataparsed[2];
      
      
      createquery = `INSERT INTO rooms (room_name, room_members_id, game_info) VALUES ('${roomname}', JSON_ARRAY('${uid}'), '{"started": 0}')`;
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

      });};

    ///LEAVING SYSTEM 
    if (dataparsed[0] == 'leave') {

      roomid = dataparsed[1];
      uid = dataparsed[2];
      temp = 0;


      query = `SELECT * FROM rooms where room_id=${roomid}`;
      queryfinal = `SELECT * FROM rooms`;

      database.query(query, function (error, data2) {

        if (data2.length > 0) {
              let result = Object.values(JSON.parse(JSON.stringify(data2)));
              members = JSON.parse(result[0]["room_members_id"]);
              for(i = 0; i < members.length; i++) {
                if(members[i] == uid){temp = i; break;}}
              }

        members.splice(temp, 1);

        if(members.length != 0){
        string_tab = JSON.stringify(members);


        queryadd = `UPDATE rooms SET room_members_id = '${string_tab}' WHERE room_id = '${roomid}'`;

        database.query(queryadd);
        database.query(queryfinal, function (error, data3) {

          if (data3.length > 0) {
            let result = Object.values(JSON.parse(JSON.stringify(data3)));
            wss.clients.forEach(ws => {
              ws.send(JSON.stringify(result));
              var current_members = [];
              var new_members = [];
            })
          }
        });


        }
        else{
          querydel = `DELETE FROM rooms WHERE room_id = '${roomid}'`;

        database.query(querydel);
        database.query(queryfinal, function (error, data3) {

          if (data3.length > 0) {
            let result = Object.values(JSON.parse(JSON.stringify(data3)));
            wss.clients.forEach(ws => {
              ws.send(JSON.stringify(result));
              var current_members = [];
              var new_members = [];
            })
          }
        });



        }

        
        });

        
      };

    ///start playing
    if (dataparsed[0] == 'playing') {

        uid = dataparsed[2];
        roomid = dataparsed[1];

        queryplaying = `SELECT * FROM rooms where room_id=${roomid}`;

        database.query(queryplaying, function (error, data) {

          if (data.length > 0) {
            let result = Object.values(JSON.parse(JSON.stringify(data)));
            members = JSON.parse(result[0]["room_members_id"]);
            infos = JSON.parse(result[0]["game_info"]);
            data_send = {"msg": "infos", "members": members.length, "info": infos}

            ws.send(JSON.stringify(data_send));
          }




        });












    }







    ///CONECTION WEBSOCKET ID SETUP
    if (dataparsed[0] == 'connection') {

      uid = dataparsed[1];
      
      ws.id = uid;
  }











});


  });
      
      










server.listen(port, () => { console.log("Listening on port 3000") })

module.exports.server = server;