const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const { addContact, getContacts } = require('../controllers/contactController');


const Router = express.Router();

Router.post('/add', verifyToken, addContact);
Router.get('/', verifyToken, getContacts);

module.exports = Router;