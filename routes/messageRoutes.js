const express = require('express');
const verifyToken = require('../middlewares/authMiddleware.js');
const { getChatHistory } = require('../controllers/messageController');

const router = express.Router();

router.get('/:userId', verifyToken, getChatHistory);

module.exports = router;