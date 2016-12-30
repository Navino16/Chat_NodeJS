var socket = io.connect("/" + $("#id_chat").text());
var pseudo = $("#pseudo").text();
if (pseudo == null || pseudo == "")
  pseudo = "guest" + Math.floor((Math.random() * 1000) + 1);
socket.emit('nouveau_client', pseudo);
document.title = pseudo + ' - ' + document.title;

socket.once('connect', function () {

  socket.on('connected', function (res) {
    $(".title").append(res.title);
    for (var i = 0; i < res.messages.length; i++) {
      insereMessage(res.messages[i].pseudo, res.messages[i].text, res.messages[i].time);
    }
  });

  socket.on('message', function(data) {
    insereMessage(data.pseudo, data.text, data.time)
  });

  socket.on('nouveau_client', function(new_user) {
    $('#chat').append('<p><em><b>' + new_user + '</b> a rejoint le Chat !</em></p>');
    var elem = document.getElementById('chat');
    elem.scrollTop = elem.scrollHeight;
  });

  socket.on('client_leave', function(old_user) {
    $('#chat').append('<p><em><b>' + old_user + '</b> a quitté(e) le Chat !</em></p>');
    var elem = document.getElementById('chat');
    elem.scrollTop = elem.scrollHeight;
  });

  socket.on('disconnect', function () {
    socket.emit('disconnected');
  });

  socket.on('room_full', function() {
    document.location.href = "http://localhost:8080/index.html?error=full";
  });
});

socket.on('reconnect', function () {
  socket.emit('nouveau_client', pseudo);
});

$('#form_chat').submit(function () {
  var message = $('#message').val();
  var date = new Date();
  time = date.getHours() + ":" + date.getMinutes() + ":";
  if (date.getSeconds() < 10)
   time += "0" + date.getSeconds();
  else
   time += date.getSeconds();
  socket.emit('message', {message: message, time: time});
  insereMessage(pseudo, message, time);
  chatButton.prop("disabled", true);
  $('#message').val('').focus();
  return false;
});

function insereMessage(pseudo, message, time) {
  $('#chat').append('<p><i>' + time  + '</i>-<b>' + pseudo + ':</b> ' + message + '</p>');
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight;
}

var chatInput = $("#message");
var chatButton = $("#send_message");
chatButton.prop("disabled", true);
chatInput.on("input", function() {
  chatButton.prop("disabled", $(this).val().trim().length == 0);
});
