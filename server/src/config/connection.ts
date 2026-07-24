import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const db = async (): Promise<typeof mongoose.connection> => {
  try {
    // Check process.env dynamically at runtime
    const connectionString = process.env.MONGODB_URI;

    if (!connectionString) {
      throw new Error('MONGODB_URI environment variable is missing!');
    }

    await mongoose.connect(connectionString);
    console.log('Database connected successfully.');
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed.');
  }
};

export default db;