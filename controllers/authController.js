const user = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const register = async (req, res) => {
    try {
        const { username, email, password, contacts } = req.body;

        // verify exist user
        const userExist = await user.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "Email already registered!" });
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // saving to database
        const newUser = new user({ username, email, password: hashPassword });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully!" })

    } catch (error) {
        res.status(500).json({ message: "Server Error!", error: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // finding user
        const foundUser = await user.findOne({ email });
        if (!foundUser) {
            return res.status(404).json({ message: "Invalid Credentials!" });
        }

        // comparing password
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials!" });
        }

        // generate token
        const token = jwt.sign(
            { userId: foundUser._id, username: foundUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // parsing token
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login Successful", username: foundUser.username, userId: foundUser._id, token: token });
    } catch (error) {
        res.status(500).json({ message: "Server Error!", error: error.message })
    }
}

module.exports = { register, login }