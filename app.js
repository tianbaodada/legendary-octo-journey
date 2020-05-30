const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');
const moment = require('moment');

const sessionMiddleware = session({
  secret: 'fd639%(*&@(!ikqwq12#&wndlk',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600 * 1000 },
});

const SOCKETS = {};
const ROOMS = {};
const MESSAGES = {};
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
    const { sessionID: ssId } = socket.request;
    const { sessionID: ppId } = peer.request;
    
    if (ppId !== ssId) {
      QUEUE.splice(0, 1);
      const roomId = `${ssId}#${ppId}`;

      peer.join(roomId);
      socket.join(roomId);

      ROOMS[ppId] = roomId;
      ROOMS[ssId] = roomId;
      MESSAGES[roomId] = [];

      io.to(roomId).emit('connectSuccess', roomId);
    }
  } else {
    QUEUE.push(socket);
  }
}

io.on('connection', (socket) => {
  const { sessionID: ssId } = socket.request;

  // 先確認ssId是否曾經連接過, 第一次連接時存入SOCKETS
  if (!SOCKETS[ssId]) {
    SOCKETS[ssId] = socket;
  } else {
    // 若不是第一次連接, 嘗試尋找之前加入過的room
    const roomId = ROOMS[ssId];
    if (roomId) {
      socket.join(roomId);
      const msg = MESSAGES[roomId];
      // 若有找到曾加入的room, 將該room的對話紀錄傳給前端
      if (msg) {
        const Rmsg = msg.map((value,index,array) => {
          const sender = value.ssId === ssId ? 'me' : 'him';
          return {sender, ...value};
        })
        socket.emit('chat history', Rmsg);
      }
    }
  }

  socket.on('chat start', () => {
    queueLine(socket);
  });

  socket.on('chat end', () => {
    const roomId = ROOMS[ssId];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat end');

      //只要其中一方按下離開, 刪除該room及對話紀錄
      delete ROOMS[ssId];
      delete MESSAGES[roomId];

      // 其中一方離開時, 讓另一方自動連接下一個使用者
      // const peerIds = roomId.split('#');
      // const peerId = peerIds[0] === ssId ? peerIds[1] : peerIds[0];
      // queueLine(SOCKETS[peerId]);
    }
  });

  socket.on('chat message', (msg) => {
    const roomId = ROOMS[ssId];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat message', msg);
      
      // 對話時將歷史訊息存入MESSAGES
      if(!MESSAGES[roomId]) MESSAGES[roomId] = [];
      MESSAGES[roomId].push({ssId, msg, date: moment()});
    } else {
      // 異常狀態, 該對話直接結束, 使用者須重新連接
      socket.emit('chat end');
    }
  });

  socket.on('disconnect', () => {});
});

http.listen(3000, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on http://localhost:3000');
});
