
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve os arquivos estáticos da pasta 'public'
app.use(express.static('public'));

let onlineUsers = [];

wss.on('connection', (ws) => {
  let username = '';

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'login') {
      username = data.username;
      if (!onlineUsers.some(user => user.username === username)) {
        onlineUsers.push({ username });
        broadcastOnlineUsers();
      }
    } else if (data.type === 'message') {
      broadcastMessage({ username: username, text: data.text });
    }
  });

  ws.on('close', () => {
    onlineUsers = onlineUsers.filter(user => user.username !== username);
    broadcastOnlineUsers();
  });
});

function broadcastOnlineUsers() {
  const message = JSON.stringify({ type: 'onlineUsers', users: onlineUsers });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastMessage(message) {
  const data = JSON.stringify({ type: 'message', ...message });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
