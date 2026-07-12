const user = require('../models/user');

// Naya contact add karna
const addContact = async (req, res) => {
    try {
        const { contactEmail } = req.body;
        const myUserId = req.user.userId; // verifyToken se mila

        // jis banday ko add karna hai, usay dhoondo
        const contactUser = await user.findOne({ email: contactEmail });

        if (!contactUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (contactUser._id.toString() === myUserId) {
            return res.status(400).json({ message: "You can't add yourself!" });
        }

        // apna profile nikalo
        const me = await user.findById(myUserId);

        // check karo pehle se contact to nahi
        if (me.contacts.includes(contactUser._id)) {
            return res.status(400).json({ message: "Already in contacts!" });
        }

        // contact add karo
        me.contacts.push(contactUser._id);
        await me.save();

        res.status(200).json({ message: "Contact added successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
};

// Apni contacts list dekhna
const getContacts = async (req, res) => {
    try {
        const myUserId = req.user.userId;

        const me = await user.findById(myUserId).populate('contacts', 'username email');

        res.status(200).json({ contacts: me.contacts });

    } catch (error) {
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
};

module.exports = { addContact, getContacts };