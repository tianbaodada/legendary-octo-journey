let room = '';
let connected = false;

const socket = io();

$(function () {

  $('form').submit(function(e) {
    if (connected) {
      socket.emit('chat message', $('#m').val());
      $('#messages').append($('<li>').text($('#m').val()));
      $('#m').val('');
    }
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('connectSuccess', function(roomId){
    connected = true;
    room = roomId;
    $('#information strong').text(`A user is connected, ${roomId}`);
    $('#messages').empty();
  });

  socket.on('chat end', function(){
    if (connected) {
      connected = false;
      $('#information strong').text(`按下開始`);
    }
  });
});

function start() {
  if (!connected) {
    socket.emit('chat start');
    $('#messages').empty();
    $('#information strong').text(`waiting for a connection`);
  }
}

function changePerson() {
  if (connected) {
    connected = false;
    socket.emit('chat end');
    $('#messages').empty();
    $('#information strong').text(`按下開始`);
  }
}