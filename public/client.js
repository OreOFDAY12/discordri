const loginContainer = document.getElementById('login-container');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const userList = document.getElementById('user-list');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let ws;

loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        connectWebSocket(username);
    }
});

function connectWebSocket(username) {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'login', username: username }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'onlineUsers') {
            updateUserList(data.users);
        } else if (data.type === 'message') {
            addMessage(data.username, data.text);
        }
    };

    ws.onclose = () => {
        console.log('Desconectado do servidor');
    };
}

function updateUserList(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        userList.appendChild(li);
    });
}

function addMessage(username, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const usernameElement = document.createElement('span');
    usernameElement.classList.add('username');
    usernameElement.textContent = username;

    const textElement = document.createElement('span');
    textElement.classList.add('text');
    textElement.textContent = text;

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (text && ws) {
        ws.send(JSON.stringify({ type: 'message', text: text }));
        messageInput.value = '';
    }
}
