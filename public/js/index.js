var socket = io.connect("/lobby");
var pseudo = "guest" + Math.floor((Math.random() * 1000) + 1);
$("#pseudo").attr("placeholder", pseudo)
socket.emit('nouveau_client_lobby', pseudo);

socket.once('connect', function () {

  socket.on('connected', function (res) {
    $(".title").append(res.title);
  });

  socket.on('nouveau_client_lobby', function(data) {
    var x = 1;
    $("#listRooms").find("option").remove().end();
    data.rooms.forEach(function (room) {
      if (room != 'lobby') {
        $("#room" + x).find("em").remove().end();
        $("#users_room" + x).find("p").remove().end();
        $("#listRooms").append("<option>"+room+"</option>");
        $("#room" + x).append("<em class='left'>" + room + "</em><em class='right'>" + data.users[room][0] + "</em>");
        for (var i = 1; i < data.users[room].length; i++) {
          $("#users_room" + x).append("<p>" + data.users[room][i] + "</p>");
        }
        x++;
      }
    });
  });

  socket.on('disconnect', function () {
    socket.emit('disconnected');
  });
});

socket.on('reconnect', function () {
  socket.emit('nouveau_client_lobby', pseudo);
});

$("#form_user").submit(function () {
  pseudo = $("#pseudo").val();
  if (pseudo == "")
    pseudo = $("#pseudo").attr("placeholder");
  var room = $("#listRooms").find(":selected").text();
  console.log(room);
  document.location.href = "http://localhost:8080/chat.html?id=" + room + "&pseudo=" + pseudo;
  return false;
})
