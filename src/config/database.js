const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('CRITICAL ERROR: MongoDB connection failed');
        console.error(`Error Message: ${error.message}`);
        console.error('Make sure MONGODB_URI is correctly set in Render environment variables.');
        process.exit(1);
    }
};

module.exports = { connectDB };
