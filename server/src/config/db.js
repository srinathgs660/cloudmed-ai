const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudmed_ai';

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      dbName: 'cloudmed_ai',
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    console.error('Make sure your local MongoDB service is running, or specify a valid MONGO_URI for MongoDB Atlas.');
    process.exit(1);
  }
};

module.exports = connectDB;
