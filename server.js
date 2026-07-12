const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes.js');
const contactRoutes = require('./routes/contactRoutes.js');
const socketAuth = require('./middlewares/socketAuth.js');
const messageRoutes = require('./routes/messageRoutes.js');
const Message = require('./models/message.js');

dotenv.config();


const app = express();

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));


app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.render('index', { title: 'Simple Chat App' });
});
app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

io.use(socketAuth);
const onlineUsers = new Map(); // userId -> socket.id store karega

io.on('connection', (socket) => {
    console.log(`[Server] User connected ID: ${socket.id} Username: ${socket.username}`);
    onlineUsers.set(socket.userId, socket.id);

    socket.on('chat-message', (msg) => {

        const { text, toUserId } = msg;
        // console.log(`[Server] Message received: ${msg}`);
        console.log(`[Server] ${socket.username} -> ${toUserId}: ${text}`);

        const newMessage = new Message({
            from: socket.userId,
            to: toUserId,
            text: text
        });

        newMessage.save();

        const targetSocketId = onlineUsers.get(toUserId);

        console.log('Target Socket ID found:', targetSocketId); // YE LINE ADD KARO
        console.log('Current online users:', onlineUsers); // YE BHI ADD KARO


        const messagePayload = {
            user: socket.username,
            fromUserId: socket.userId,
            text: text
        };

        if (targetSocketId) {

            io.to(targetSocketId).emit('chat-message', messagePayload);
        }

        socket.emit('chat-message', messagePayload);

    });

    socket.on('disconnect', () => {
        console.log(`[Server] User disconnected: ${socket.id}`);
        onlineUsers.delete(socket.userId);
    });
});

connectDB();

const PORT = process.env.PORT;

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