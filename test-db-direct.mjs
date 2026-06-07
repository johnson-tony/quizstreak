import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// The "Standard" URI that bypasses SRV lookup
const password = "Fw3jiwd9ijXFU6yW";
const MONGODB_URI = `mongodb://tonyjanson121_db_user:${password}@ac-95ns6h1-shard-00-00.b6qc9lw.mongodb.net:27017,ac-95ns6h1-shard-00-01.b6qc9lw.mongodb.net:27017,ac-95ns6h1-shard-00-02.b6qc9lw.mongodb.net:27017/quizstreak?ssl=true&replicaSet=atlas-95ns6h-shard-0&authSource=admin&retryWrites=true&w=majority`;

async function testConnection() {
  console.log('Attempting to connect via Standard Connection String (Direct Nodes)...');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connection successful via Direct Nodes!');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed even with Direct Nodes!');
    console.error(error);
    process.exit(1);
  }
}

testConnection();
