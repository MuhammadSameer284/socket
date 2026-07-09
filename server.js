const express = require('express');
const http = require('http');
const { title } = require('process');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: 'Simple Chat App' });
});

io.on('connection', (socket) => {
    console.log(`[Server] User connected: ${socket.id}`);

    socket.on('chat-message', (msg)=>{
        // console.log(`[Server] Message received: ${msg}`);
        console.log(`[Server] ${msg.user}: ${msg.text}`);
        io.emit('chat-message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`[Server] User disconnected: ${socket.id}`);
    });
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`[Ready] Server running on port ${PORT}`);
});

// whole concept

// Aap browser mein type karte ho, Send dabatay ho
// client.js → socket.emit('chat-message', ...) → message server ko jata hai
// server.js mein socket.on('chat-message', ...) usay pakadta hai
// Server io.emit('chat-message', ...) se sabko wapis bhejta hai
// Har connected browser ka client.js → socket.on('chat-message', ...) chalta hai
// Har browser apni screen par naya <p> add kar deta hai

// Isi wajah se do tabs khol kar test karne par dono jagah message dikhta hai — sirf ek jagah nahi.