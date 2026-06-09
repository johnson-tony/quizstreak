import mongoose from 'mongoose';

const cluster = 'cluster0.b6qc9lw.mongodb.net';
const users = ['tonyjanson121_db_user', 'tonyjanson121'];
const passwords = ['9DDANLWqRH1tFDrS', 'Fw3jiwd9ijXFU6yW', 'John@123'];

async function testAll() {
  for (const user of users) {
    for (const pass of passwords) {
      const uris = [
        `mongodb+srv://${user}:${encodeURIComponent(pass)}@${cluster}/quizstreak?retryWrites=true&w=majority`,
        `mongodb+srv://${user}:${encodeURIComponent(pass)}@${cluster}/?appName=Cluster0`
      ];
      
      for (const uri of uris) {
        console.log(`Testing: ${user} : ${pass} (${uri.includes('appName') ? 'with appName' : 'with dbName'})`);
        try {
          await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
          console.log('✅ SUCCESS!');
          console.log('URI:', uri);
          process.exit(0);
        } catch (e) {
          console.log(`❌ Failed: ${e.message.substring(0, 50)}...`);
        }
      }
    }
  }
}

testAll();
