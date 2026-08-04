import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

function fixMongoUri(uri) {
  if (!uri) return '';
  let fixed = uri;
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+\.[^@]+.*)$/);
  if (match) {
    const protocol = match[1];
    const username = match[2];
    const rawPassword = match[3];
    const hostAndQuery = match[4];
    const encodedPassword = encodeURIComponent(rawPassword);
    fixed = `${protocol}${username}:${encodedPassword}@${hostAndQuery}`;
  }
  // If no database name specified before query string or end, add /campusflow
  if (fixed.match(/mongodb\.net\/?(\?.*)?$/)) {
    fixed = fixed.replace(/mongodb\.net\/?(\?.*)?$/, 'mongodb.net/campusflow$1');
  }
  if (!fixed.includes('authSource=')) {
    fixed += fixed.includes('?') ? '&authSource=admin' : '?authSource=admin';
  }
  return fixed;
}

const argUri = process.argv[2];
const envUri = process.env.MONGODB_URI || process.env.MONGO_URI;

let rawUri = argUri || envUri || '';
let mongoUri = fixMongoUri(rawUri);

if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
  console.error('\x1b[31m[CampusFlow Error] Invalid or missing MongoDB connection URL!\x1b[0m');
  console.error('\nPlease pass your actual MongoDB Atlas connection string starting with "mongodb://" or "mongodb+srv://".');
  console.error('\nExample usage:');
  console.error('  \x1b[36mnode scripts/seed_mongodb.js "mongodb+srv://username:password@cluster.mongodb.net/campusflow"\x1b[0m\n');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  rollNumber: { type: String },
  department: { type: String },
  year: { type: String },
  section: { type: String },
  hostelBlock: { type: String },
  roomNumber: { type: String },
  mentorId: { type: String },
  parentName: { type: String },
  parentEmail: { type: String },
  parentPhone: { type: String },
  avatarUrl: { type: String },
});

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

async function seed() {
  try {
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log('\x1b[32m[CampusFlow DB] Connected to MongoDB Atlas successfully!\x1b[0m');

    const datasetPath = path.join(process.cwd(), 'students_dataset.json');
    const studentsData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    console.log(`[CampusFlow DB] Clearing old student records from 'users' collection...`);
    await UserModel.deleteMany({ role: 'student' });

    console.log(`[CampusFlow DB] Inserting ${studentsData.length} student records...`);
    const result = await UserModel.insertMany(studentsData);
    console.log(`\x1b[32m[CampusFlow DB] Successfully seeded ${result.length} student records into MongoDB Atlas!\x1b[0m`);

    await mongoose.disconnect();
    console.log('[CampusFlow DB] Connection closed.');
  } catch (err) {
    console.error('\x1b[31m[CampusFlow DB] Error seeding MongoDB:\x1b[0m', err.message || err);
    process.exit(1);
  }
}

seed();
