const Message = require('../models/message');

const getChatHistory = async (req, res) => {
    try {
        const myUserId = req.user.userId;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { from: myUserId, to: otherUserId },
                { from: otherUserId, to: myUserId }
            ]
        }).sort({ createdAt: 1 }); // purane se naye order mein

        res.status(200).json({ messages });

    } catch (error) {
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
};

module.exports = { getChatHistory };