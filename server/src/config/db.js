const mongoose = require('mongoose');

const connectDB = async () => {
  let mongoURI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudmed_ai').trim();

  // Strip accidental quotes or prefix from Render dashboard copy-paste
  if ((mongoURI.startsWith('"') && mongoURI.endsWith('"')) || (mongoURI.startsWith("'") && mongoURI.endsWith("'"))) {
    mongoURI = mongoURI.slice(1, -1).trim();
  }
  if (mongoURI.startsWith('MONGO_URI=')) {
    mongoURI = mongoURI.replace(/^MONGO_URI=/, '').trim();
  }
  if (mongoURI.startsWith('export MONGO_URI=')) {
    mongoURI = mongoURI.replace(/^export MONGO_URI=/, '').trim();
  }
  // Strip quotes again if they were inside key=value
  if ((mongoURI.startsWith('"') && mongoURI.endsWith('"')) || (mongoURI.startsWith("'") && mongoURI.endsWith("'"))) {
    mongoURI = mongoURI.slice(1, -1).trim();
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      dbName: 'cloudmed_ai',
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    const preview = mongoURI.length > 20 ? `${mongoURI.substring(0, 15)}...` : mongoURI;
    console.error(`[MongoDB URI Check] Value received starts with: "${preview}"`);
    console.error('Make sure your local MongoDB service is running, or specify a valid MONGO_URI for MongoDB Atlas.');
    process.exit(1);
  }
};

module.exports = connectDB;
