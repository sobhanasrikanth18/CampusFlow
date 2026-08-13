import mongoose from 'mongoose';
import dns from 'dns';

if (process.env.NODE_ENV !== 'production' || process.env.CUSTOM_DNS === 'true') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {}
}

import {
  UserModel,
  OutpassModel,
  HostelLeaveModel,
  VisitorModel,
  GateLogModel,
  ParentNotificationModel,
} from './models.js';
import {
  initialUsers,
  initialOutpasses,
  initialHostelLeaves,
  initialVisitors,
  initialGateLogs,
  initialNotifications,
  db,
} from './db.js';

let isMongoConnected = false;

function fixMongoUri(uri: string) {
  if (!uri) return '';
  let fixed = uri.trim();
  if ((fixed.startsWith('"') && fixed.endsWith('"')) || (fixed.startsWith("'") && fixed.endsWith("'"))) {
    fixed = fixed.slice(1, -1).trim();
  }
  const match = fixed.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):(.+)@([^@]+\.[^@]+.*)$/);
  if (match) {
    const protocol = match[1];
    const username = match[2];
    const rawPassword = match[3];
    const hostAndQuery = match[4];
    let decodedPassword = rawPassword;
    try {
      decodedPassword = decodeURIComponent(rawPassword);
    } catch (e) {
      decodedPassword = rawPassword;
    }
    const encodedPassword = encodeURIComponent(decodedPassword);
    fixed = `${protocol}${username}:${encodedPassword}@${hostAndQuery}`;
  }
  if (fixed.match(/mongodb\.net\/?(\?.*)?$/)) {
    fixed = fixed.replace(/mongodb\.net\/?(\?.*)?$/, 'mongodb.net/campusflow$1');
  }
  if (!fixed.includes('authSource=')) {
    fixed += fixed.includes('?') ? '&authSource=admin' : '?authSource=admin';
  }
  return fixed;
}

export async function initMongo() {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || '';
  const mongoUri = fixMongoUri(rawUri);

  if (!mongoUri) {
    console.log('[CampusFlow DB] No MONGODB_URI set. Using in-memory demo store.');
    return false;
  }

  try {
    console.log('[CampusFlow DB] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('[CampusFlow DB] Successfully connected to MongoDB Atlas!');

    // Seed database if empty
    await seedMongoIfEmpty();

    // Hydrate in-memory db from MongoDB Atlas for fast local access
    await hydrateInMemoryDbFromMongo();

    return true;
  } catch (error: any) {
    console.error('[CampusFlow DB] MongoDB Atlas Connection Notice:', error.message || error);
    console.log('[CampusFlow DB] Falling back to in-memory store for uninterrupted service.');
    isMongoConnected = false;
    return false;
  }
}

export function getIsMongoConnected() {
  return isMongoConnected;
}

async function seedMongoIfEmpty() {
  if (!isMongoConnected) return;

  try {
    // Ensure staff users exist
    for (const staff of initialUsers.filter(u => u.role !== 'student')) {
      await (UserModel as any).findOneAndUpdate({ id: staff.id }, staff, { upsert: true });
    }

    const studentCount = await UserModel.countDocuments({ role: 'student' });
    if (studentCount < 600) {
      console.log('[CampusFlow DB] Seeding 696 student records to MongoDB Atlas...');
      await UserModel.deleteMany({ role: 'student' });
      const studentsToInsert = initialUsers.filter(u => u.role === 'student');
      await (UserModel as any).insertMany(studentsToInsert);
      console.log('[CampusFlow DB] Successfully populated 696 students in MongoDB Atlas!');
    }

    const opCount = await OutpassModel.countDocuments();
    if (opCount === 0) {
      console.log('[CampusFlow DB] Seeding initial Outpasses to MongoDB Atlas...');
      await (OutpassModel as any).insertMany(initialOutpasses);
    }

    const hlCount = await HostelLeaveModel.countDocuments();
    if (hlCount === 0) {
      console.log('[CampusFlow DB] Seeding initial Hostel Leaves to MongoDB Atlas...');
      await (HostelLeaveModel as any).insertMany(initialHostelLeaves);
    }

    const visCount = await VisitorModel.countDocuments();
    if (visCount === 0) {
      console.log('[CampusFlow DB] Seeding initial Visitors to MongoDB Atlas...');
      await (VisitorModel as any).insertMany(initialVisitors);
    }

    const gateCount = await GateLogModel.countDocuments();
    if (gateCount === 0) {
      console.log('[CampusFlow DB] Seeding initial Gate Logs to MongoDB Atlas...');
      await (GateLogModel as any).insertMany(initialGateLogs);
    }

    const notifCount = await ParentNotificationModel.countDocuments();
    if (notifCount === 0) {
      console.log('[CampusFlow DB] Seeding initial Parent Notifications to MongoDB Atlas...');
      await (ParentNotificationModel as any).insertMany(initialNotifications);
    }
  } catch (err) {
    console.error('[CampusFlow DB] Error seeding MongoDB Atlas:', err);
  }
}

export async function hydrateInMemoryDbFromMongo() {
  if (!isMongoConnected) return;

  try {
    const users = await UserModel.find().lean();
    if (users.length > 0) {
      db.users = users.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        rollNumber: u.rollNumber,
        department: u.department,
        year: u.year,
        section: u.section,
        hostelBlock: u.hostelBlock,
        roomNumber: u.roomNumber,
        mentorId: u.mentorId,
        parentName: u.parentName,
        parentEmail: u.parentEmail,
        parentPhone: u.parentPhone,
        avatarUrl: u.avatarUrl,
      }));
    }

    const outpasses = await OutpassModel.find().lean();
    if (outpasses.length > 0) {
      db.outpasses = outpasses.map((o: any) => ({
        id: o.id,
        studentId: o.studentId,
        studentName: o.studentName,
        rollNumber: o.rollNumber,
        department: o.department,
        year: o.year,
        section: o.section,
        reason: o.reason,
        outDate: o.outDate,
        outTime: o.outTime,
        inDate: o.inDate,
        inTime: o.inTime,
        destination: o.destination,
        status: o.status,
        mentorRemarks: o.mentorRemarks,
        hodRemarks: o.hodRemarks,
        qrCode: o.qrCode,
        createdAt: o.createdAt,
        exitTime: o.exitTime,
        entryTime: o.entryTime,
        parentNotificationSent: o.parentNotificationSent,
      }));
    }

    const leaves = await HostelLeaveModel.find().lean();
    if (leaves.length > 0) {
      db.hostelLeaves = leaves.map((l: any) => ({
        id: l.id,
        studentId: l.studentId,
        studentName: l.studentName,
        rollNumber: l.rollNumber,
        hostelBlock: l.hostelBlock,
        roomNumber: l.roomNumber,
        leaveType: l.leaveType,
        reason: l.reason,
        startDate: l.startDate,
        endDate: l.endDate,
        parentPermissionVerified: l.parentPermissionVerified,
        parentPhone: l.parentPhone,
        status: l.status,
        wardenRemarks: l.wardenRemarks,
        createdAt: l.createdAt,
        qrCode: l.qrCode,
      }));
    }

    const visitors = await VisitorModel.find().lean();
    if (visitors.length > 0) {
      db.visitors = visitors.map((v: any) => ({
        id: v.id,
        studentId: v.studentId,
        studentName: v.studentName,
        studentRoll: v.studentRoll,
        visitorName: v.visitorName,
        visitorPhone: v.visitorPhone,
        relation: v.relation,
        purpose: v.purpose,
        visitDate: v.visitDate,
        idProofNumber: v.idProofNumber,
        status: v.status,
        checkInTime: v.checkInTime,
        checkOutTime: v.checkOutTime,
        qrCode: v.qrCode,
        createdAt: v.createdAt,
      }));
    }

    const gateLogs = await GateLogModel.find().lean();
    if (gateLogs.length > 0) {
      db.gateLogs = gateLogs.map((g: any) => ({
        id: g.id,
        passId: g.passId,
        passType: g.passType,
        personName: g.personName,
        personRole: g.personRole,
        rollOrId: g.rollOrId,
        action: g.action,
        timestamp: g.timestamp,
        securityOfficer: g.securityOfficer,
        gateNumber: g.gateNumber,
      }));
    }

    const notifs = await ParentNotificationModel.find().lean();
    if (notifs.length > 0) {
      db.notifications = notifs.map((n: any) => ({
        id: n.id,
        studentName: n.studentName,
        rollNumber: n.rollNumber,
        parentEmail: n.parentEmail,
        subject: n.subject,
        body: n.body,
        timestamp: n.timestamp,
        type: n.type,
      }));
    }
  } catch (err) {
    console.error('[CampusFlow DB] Error hydrating memory db from Mongo:', err);
  }
}

// Write helper functions to sync MongoDB Atlas
export async function syncUserToMongo(user: any) {
  if (!isMongoConnected) return;
  try {
    await (UserModel as any).findOneAndUpdate({ id: user.id }, user, { upsert: true });
  } catch (e) {
    console.error('Mongo sync error user:', e);
  }
}

export async function syncOutpassToMongo(outpass: any) {
  if (!isMongoConnected) return;
  try {
    await (OutpassModel as any).findOneAndUpdate({ id: outpass.id }, outpass, { upsert: true });
  } catch (e) {
    console.error('Mongo sync error outpass:', e);
  }
}

export async function deleteOutpassFromMongo(outpassId: string) {
  if (!isMongoConnected) return;
  try {
    await (OutpassModel as any).deleteOne({ id: outpassId });
  } catch (e) {
    console.error('Mongo delete error outpass:', e);
  }
}

export async function syncHostelLeaveToMongo(leave: any) {
  if (!isMongoConnected) return;
  try {
    await (HostelLeaveModel as any).findOneAndUpdate({ id: leave.id }, leave, { upsert: true });
  } catch (e) {
    console.error('Mongo sync error leave:', e);
  }
}

export async function syncVisitorToMongo(visitor: any) {
  if (!isMongoConnected) return;
  try {
    await (VisitorModel as any).findOneAndUpdate({ id: visitor.id }, visitor, { upsert: true });
  } catch (e) {
    console.error('Mongo sync error visitor:', e);
  }
}

export async function syncGateLogToMongo(log: any) {
  if (!isMongoConnected) return;
  try {
    await (GateLogModel as any).create(log);
  } catch (e) {
    console.error('Mongo sync error gate log:', e);
  }
}

export async function syncNotificationToMongo(notif: any) {
  if (!isMongoConnected) return;
  try {
    await (ParentNotificationModel as any).create(notif);
  } catch (e) {
    console.error('Mongo sync error notification:', e);
  }
}
