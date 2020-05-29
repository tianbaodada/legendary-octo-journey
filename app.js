const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');

const sessionMiddleware = session({
  secret: 'fd639%(*&@(!ikqwq12#&wndlk',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600 * 1000 },
});

const SOCKETS = {};
const ROOMS = {};
const QUEUE = [];

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'build')));
// app.use(express.static(path.join(__dirname, 'public')));

function queueLine(socket) {
  if (QUEUE.length) {
    const peer = QUEUE[0];
    if (peer.request.sessionID !== socket.request.sessionID) {
      QUEUE.splice(0, 1);
      const roomId = `${socket.request.sessionID}#${peer.request.sessionID}`;

      peer.join(roomId);
      socket.join(roomId);

      ROOMS[peer.request.sessionID] = roomId;
      ROOMS[socket.request.sessionID] = roomId;

      io.to(roomId).emit('connectSuccess', roomId);
    }
  } else {
    QUEUE.push(socket);
  }
}

io.on('connection', (socket) => {
  SOCKETS[socket.request.sessionID] = socket;
  socket.on('chat start', () => {
    queueLine(socket);
  });

  socket.on('chat end', () => {
    const roomId = ROOMS[socket.request.sessionID];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat end');
      delete ROOMS[socket.request.sessionID];
      // const peerIds = roomId.split('#');
      // const peerId = peerIds[0] === socket.request.sessionID ? peerIds[1] : peerIds[0];
      // queueLine(SOCKETS[peerId]);
    }
  });

  socket.on('chat message', (msg) => {
    const roomId = ROOMS[socket.request.sessionID];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat message', msg);
    }
  });

  socket.on('disconnect', () => {
    const roomId = ROOMS[socket.request.sessionID];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat end');
      delete ROOMS[socket.request.sessionID];
    }
  });
});

http.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on http://localhost:3000');
});
