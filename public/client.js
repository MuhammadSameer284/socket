const socket = io();

const username = prompt("Enter your name:") || "Anonymous";

const form = document.getElementById('chatForm');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim() === '') return;

    const data = { user: username, text: input.value };
    socket.emit('chat-message', data);
    input.value = '';
});

socket.on('chat-message', (data) => {
    const div = document.createElement('div');
    div.classList.add('message');

    // check if this message was sent by me or someone else
    if (data.user === username) {
        div.classList.add('own-message');
    } else {
        div.classList.add('other-message');
    }

    div.innerHTML = `<span class="sender">${data.user}</span><p>${data.text}</p>`;
    messages.appendChild(div);
});