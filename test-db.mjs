import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  console.log('Attempting to connect to MongoDB...');
  console.log('URI length:', MONGODB_URI.length);
  console.log('URI start:', MONGODB_URI.substring(0, 20));
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
      dbName: 'quizstreak',
    });
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
