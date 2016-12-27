var socket = io.connect("/" + $("#id_chat").text());
var pseudo = $("#pseudo").text();
if (pseudo == null || pseudo == "")
  pseudo = "guest" + Math.floor((Math.random() * 1000) + 1);
socket.emit('nouveau_client', pseudo);
document.title = pseudo + ' - ' + document.title;

socket.once('connect', function () {

  socket.on('connected', function (res) {
    for (var i = 0; i < res.messages.length; i++) {
      insereMessage(res.messages[i].pseudo, res.messages[i].text);
    }
  });

  socket.on('message', function(data) {
    insereMessage(data.pseudo, data.message)
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
  socket.emit('message', message);
  insereMessage(pseudo, message);
  chatButton.prop("disabled", true);
  $('#message').val('').focus();
  return false;
});

function insereMessage(pseudo, message) {
  $('#chat').append('<p><b>' + pseudo + ':</b> ' + message + '</p>');
  var elem = document.getElementById('chat');
  elem.scrollTop = elem.scrollHeight;
}

var chatInput = $("#message");
var chatButton = $("#send_message");
chatButton.prop("disabled", true);
chatInput.on("input", function() {
  chatButton.prop("disabled", $(this).val().trim().length == 0);
});
