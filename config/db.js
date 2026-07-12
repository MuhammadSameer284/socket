const mongoose = require('mongoose');

const connectDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`DB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log('Connection Error!', {error: error.message});
    }
}

module.exports = connectDB;