var socket = io.connect("/lobby");
var pseudo = "guest" + Math.floor((Math.random() * 1000) + 1);
socket.emit('nouveau_client_lobby', pseudo);

socket.once('connect', function () {

  socket.on('nouveau_client_lobby', function(data) {
    $("#pseudo").attr("placeholder", data.pseudo)
    data.rooms.forEach(function (room) {
      if (room != 'lobby')
        $("#listRooms").append("<option>"+room+"</option>")
    })
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
