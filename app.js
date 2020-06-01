const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const session = require('express-session');
const moment = require('moment');

const port = process.env.PORT || 3000;

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

function enQueue(socket) {
  if (QUEUE.length) {
    const { sessionID: ssId } = socket.request;

    const ppIdx = QUEUE.findIndex(v => v.request.sessionID !== ssId);

    if (ppIdx > -1) {
      const [peer] = QUEUE.splice(ppIdx, 1);
      const { sessionID: ppId } = peer.request;
      const roomId = `${ssId}#${ppId}`;

      peer.join(roomId);
      socket.join(roomId);

      ROOMS[ppId] = roomId;
      ROOMS[ssId] = roomId;
      MESSAGES[roomId] = [];

      io.to(roomId).emit('connectSuccess');
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
        const Rmsg = msg.map((value) => {
          const inbound = value.ssId === ssId ? false : true;
          return {inbound, msg: value.msg, date: value.date};
        })
        socket.emit('chat history', Rmsg);
      }
    }
  }

  socket.on('chat start', () => {
    enQueue(socket);
  });

  socket.on('chat end', () => {
    const roomId = ROOMS[ssId];
    if (roomId) {
      socket.broadcast.to(roomId).emit('chat end');

      socket.leave(roomId);
      const peerIds = roomId.split('#');
      const ppId = peerIds[0] === ssId ? peerIds[1] : peerIds[0];
      SOCKETS[ppId].leave(roomId)
      
      //只要其中一方按下離開, 刪除該room及對話紀錄
      delete ROOMS[ssId];
      delete ROOMS[ppId];
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

  socket.on('disconnect', () => {
    const { sessionID: ssId } = socket.request;

    // 在排隊期間按下重整或關閉, 須重新排隊
    const ssIdx = QUEUE.findIndex(v => ssId === v.request.sessionID);
    if (ssIdx > -1) {
      QUEUE.splice(ssIdx, 1);
    }

    // 離開但不刪除room, 重新連接時再將其加入
    const roomId = ROOMS[ssId];
    if (roomId) {
      socket.leave(roomId);
    }
  });
});

http.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log('Example app listening on http://localhost:3000');
});
