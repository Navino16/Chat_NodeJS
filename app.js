dd

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var ent = require('ent');
var io = require('socket.io').listen(server);
var url = require('url');
var querystring = require('querystring');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.render('index.ejs', {full: "none"});
})
.get('/index.html', function(req, res) {
    var param_index = querystring.parse(url.parse(req.url).query);
    if (param_index.error == "full")
      res.render('index.ejs', {full: ""});
    else
      res.render('index.ejs', {full: "none"});
})
.get('/chat.html', function(req, res) {
    var params = querystring.parse(url.parse(req.url).query);
    if (isInList(params.id))
      res.render('chat.ejs', {id: params.id, pseudo: params.pseudo});
    else
      res.redirect("/");
})
.use(function(req, res){
  res.redirect('/');
});


var rooms = ["lobby","salon_1", "salon_2", "salon_3", "salon_4"];
var sentences = {
	lobby: 'Bienvenue à tous !',
	salon_1: 'Bienvenue dans le salon 1 !',
	salon_2: 'Bienvenue dans le salon 2 !',
	salon_3: 'Bienvenue dans le salon 3 !',
  salon_4: 'Bienvenue dans le salon 4 !'
};
var messages = {};
var clients = {};

rooms.forEach(function (room) {
  messages[room] = [];
  clients[room] = {};
  clients[room].client = [];
  clients[room].max = 20;
  clients[room].curent = 0;
  io.of("/" + room).on("connection", function (socket, pseudo) {

    socket.emit('connected', { title: sentences[room], messages: messages[room] });

    socket.on("nouveau_client", function (pseudo) {
      clients[room].curent++;
      if (clients[room].curent <= clients[room].max) {
        pseudo = ent.encode(pseudo);
        socket.pseudo = pseudo;
        socket.broadcast.emit("nouveau_client", pseudo);
        var tmp = {pseudo: pseudo, socket: socket};
        clients[room].client.push(tmp);
        listClient();
        var users = getListClients();
        io.of("/lobby").emit("nouveau_client_lobby", {rooms: rooms, users: users});
      }
      else {
        socket.emit("room_full");
      }
    });

    socket.on("message", function (data) {
      var message = {
        time: ent.encode(data.time),
        pseudo: socket.pseudo,
        text: ent.encode(data.message)
      };
      messages[room].push(message);
      socket.broadcast.emit("message", message)
    });

    socket.on('disconnect', function() {
      //console.log(socket.pseudo + ' disconnected on room ' + room + '!');
      for (var i = 0; i < clients[room].client.length; i++) {
        if (clients[room].client[i].socket === socket)
          break;
      }
      clients[room].client.splice(i, 1);
      if (socket.pseudo != null)
        socket.broadcast.emit("client_leave", socket.pseudo);
      clients[room].curent--;
      listClient();
      var users = getListClients();
      io.of("/lobby").emit("nouveau_client_lobby", {rooms: rooms, users: users});
    });

   socket.on("nouveau_client_lobby", function (pseudo) {
     pseudo = ent.encode(pseudo);
     socket.pseudo = pseudo;
     var users = getListClients();
     socket.emit("nouveau_client_lobby", {rooms: rooms, users: users});
     var tmp = {pseudo: pseudo, socket: socket};
     clients[room].client.push(tmp);
     clients[room].curent++;
     listClient();
   });
  });
});

function listClient() {
  console.log('\033c');
  for (var i = 0; i < rooms.length; i++) {
    var room = rooms[i];
    if (room == "lobby")
    console.log(clients[room].curent + "/∞");
    else
      console.log(clients[room].curent + "/" + clients[room].max);
    console.log("Clients on " + room + ":");
    for (var j = 0; j < clients[room].client.length; j++) {
      console.log(clients[room].client[j].pseudo);
    }
    console.log("\n");
  }
}
function isInList(id) {
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i] == id)
      return true;
  }
  return false;
}

function getListClients() {
  var list = {};
  for (var i = 1; i < rooms.length; i++) {
    var room = rooms[i];
    list[room] = [];
    list[room][0] = clients[room].curent + "/" + clients[room].max;
    for (var j = 0; j < clients[room].client.length; j++) {
      list[room][j + 1] = clients[room].client[j].pseudo;
    }
  }
  return list;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

server.listen(8080, "127.0.0.1");
