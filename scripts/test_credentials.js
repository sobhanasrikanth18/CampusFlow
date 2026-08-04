import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config();

const testUri = process.argv[2] || process.env.MONGODB_URI;

console.log('Testing MongoDB connection...');
console.log('Target URI:', testUri ? testUri.replace(/:([^@]+)@/, ':****@') : 'None');

if (!testUri) {
  console.log('No URI provided.');
  process.exit(1);
}

mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILED:', err.message);
    if (err.message.includes('bad auth')) {
      console.log('\n--- TROUBLESHOOTING BAD AUTH ---');
      console.log('1. Check MongoDB Atlas -> Security -> Database Access');
      console.log('2. Verify the username and password match EXACTLY (case-sensitive).');
      console.log('3. Ensure "Built-in Role" is set to "Read and write to any database".');
    }
    process.exit(1);
  });
