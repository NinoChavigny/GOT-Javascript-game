const WebSocketServer  = require('ws');
const server = require("./server")

const wss = new WebSocketServer({ server:server.server });

wss.on('connection', function connection(ws) {
    console.log('test');
  ws.on('message', function message(data) {
    console.log('received: %s', data);
  });

  ws.send('something');
});