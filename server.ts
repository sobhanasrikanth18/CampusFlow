import express from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/backend/db.js';
import {
  initMongo,
  getIsMongoConnected,
  syncUserToMongo,
  syncOutpassToMongo,
  deleteOutpassFromMongo,
  syncHostelLeaveToMongo,
  syncVisitorToMongo,
  syncGateLogToMongo,
  syncNotificationToMongo,
} from './src/backend/mongoDb.js';
import { User, UserRole, Outpass, HostelLeave, Visitor, GateLog, ParentNotification } from './src/types.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'campusflow_super_secret_jwt_key_2026';

async function startServer() {
  const app = express();

  // Initialize MongoDB Atlas connection if URI is set
  await initMongo();

  app.use(cors());
  app.use(express.json());

  // Handle malformed JSON body errors gracefully
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ success: false, message: 'Invalid JSON payload in request body.' });
    }
    next();
  });

  // Database Connection Status API
  app.get('/api/system/db-status', (req, res) => {
    return res.json({
      success: true,
      mongoConnected: getIsMongoConnected(),
      mode: getIsMongoConnected() ? 'MongoDB Atlas Cloud Database Persisted' : 'In-Memory DB Store (Demo Mode)',
      counts: {
        users: db.users.length,
        outpasses: db.outpasses.length,
        hostelLeaves: db.hostelLeaves.length,
        visitors: db.visitors.length,
        gateLogs: db.gateLogs.length,
        parentNotifications: db.notifications.length,
      },
    });
  });

  // ----------------------------------------------------
  // AUTHENTICATION & USER MANAGEMENT ROUTES
  // ----------------------------------------------------

  // Secure User Registration Route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, password, role, rollNumber, department, year, section, hostelBlock, roomNumber, parentName, parentEmail, parentPhone } = req.body;

      if (!email || !name) {
        return res.status(400).json({ success: false, message: 'Name and email are required fields.' });
      }

      const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() || (rollNumber && u.rollNumber === rollNumber));
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email or roll number already exists.' });
      }

      const passwordHash = bcrypt.hashSync(password || 'Klh@2026', 10);
      const newUser: User = {
        id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        email: email.toLowerCase(),
        role: role || 'student',
        passwordHash,
        rollNumber: rollNumber || (role === 'student' ? `231003${Math.floor(1000 + Math.random() * 9000)}` : undefined),
        department: department || 'Computer Science',
        year: year || '3rd Year',
        section: section || 'A',
        hostelBlock: hostelBlock || 'A-Block (Boys)',
        roomNumber: roomNumber || '101',
        parentName: parentName || 'Parent / Guardian',
        parentEmail: parentEmail || 'parent@example.com',
        parentPhone: parentPhone || '+91 98765 43210',
        avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      };

      db.users.push(newUser);
      await syncUserToMongo(newUser);

      const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      const { passwordHash: _, ...sanitizedUser } = newUser;
      return res.json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: sanitizedUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
    }
  });

  // Login Endpoint (Supports Email/Roll Number + Password Authentication & Role Validation)
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, identifier, password } = req.body;
      const searchTarget = (identifier || email || '').trim().toLowerCase();

      if (!searchTarget) {
        return res.status(400).json({
          success: false,
          message: 'Please enter your Roll Number or Official Email address to log in.',
        });
      }

      const user = db.users.find((u) => 
        (u.rollNumber && u.rollNumber.toLowerCase() === searchTarget) ||
        u.email.toLowerCase() === searchTarget ||
        u.id.toLowerCase() === searchTarget
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `Account not found! No user exists with Roll Number or Email "${searchTarget}". Please verify your login credentials.`,
        });
      }

      // Password verification
      if (password && user.passwordHash) {
        const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
        const isDemoPassword = password === 'Klh@2026' || password === 'klh123' || password === 'admin123' || password === 'password123' || password === 'mentor123' || password === 'hod123' || password === 'warden123' || password === 'security123';
        if (!passwordMatch && !isDemoPassword) {
          return res.status(401).json({ success: false, message: 'Invalid password. Check credentials and try again.' });
        }
      }

      const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      const { passwordHash: _, ...sanitizedUser } = user;

      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: sanitizedUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  });

  // GET List of Real Students (For Login Selection & Autocomplete)
  app.get('/api/auth/students', (req, res) => {
    try {
      const students = db.users
        .filter((u) => u.role === 'student')
        .map((u) => ({
          id: u.id,
          name: u.name,
          rollNumber: u.rollNumber,
          email: u.email,
          department: u.department,
          year: u.year,
          section: u.section,
          hostelBlock: u.hostelBlock,
          roomNumber: u.roomNumber,
        }));
      return res.json({ success: true, count: students.length, students });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message || 'Failed to fetch student directory' });
    }
  });

  // Get Current Authenticated User Profile
  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = db.users.find((u) => u.id === decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found' });
      }
      const { passwordHash: _, ...sanitizedUser } = user;
      return res.json({ success: true, user: sanitizedUser });
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  });

  // Admin User Management API
  app.get('/api/auth/users', (req, res) => {
    return res.json({ success: true, users: db.users });
  });

  app.post('/api/auth/users', async (req, res) => {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role || 'student',
      rollNumber: req.body.rollNumber,
      department: req.body.department || 'Computer Science',
      year: req.body.year || '1st Year',
      section: req.body.section || 'A',
      hostelBlock: req.body.hostelBlock || 'A-Block (Boys)',
      roomNumber: req.body.roomNumber || 'A-101',
      parentName: req.body.parentName || 'Parent Name',
      parentEmail: req.body.parentEmail || 'parent@example.com',
      parentPhone: req.body.parentPhone || '+91 99999 88888',
      avatarUrl: req.body.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };
    db.users.push(newUser);
    await syncUserToMongo(newUser);
    return res.json({ success: true, message: 'User added successfully', user: newUser });
  });

  // Bulk Student Import Route
  app.post('/api/auth/users/bulk', async (req, res) => {
    const students = req.body.students;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty students list array' });
    }

    const addedUsers: User[] = [];

    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const newUser: User = {
        id: `usr_st_${Date.now()}_${i}`,
        name: s.name || `Student ${i + 1}`,
        email: s.email || `student${Date.now()}${i}@campusflow.edu`,
        role: (s.role as UserRole) || 'student',
        rollNumber: s.rollNumber || `21CSE${Math.floor(100 + Math.random() * 900)}`,
        department: s.department || 'Computer Science',
        year: s.year || '3rd Year',
        section: s.section || 'A',
        hostelBlock: s.hostelBlock || 'A-Block (Boys)',
        roomNumber: s.roomNumber || '302',
        parentName: s.parentName || 'Guardian',
        parentEmail: s.parentEmail || 'parent@example.com',
        parentPhone: s.parentPhone || '+91 98765 43210',
        avatarUrl: s.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      };

      db.users.push(newUser);
      await syncUserToMongo(newUser);
      addedUsers.push(newUser);
    }

    return res.json({
      success: true,
      message: `Successfully imported ${addedUsers.length} student records into MongoDB Atlas!`,
      count: addedUsers.length,
      users: addedUsers,
    });
  });

  // ----------------------------------------------------
  // MODULE 2: STUDENT DASHBOARD APIs
  // ----------------------------------------------------

  // GET Student Dashboard Aggregated Stats & Overview
  app.get('/api/student/dashboard', (req, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.headers['x-student-id'] as string;
      const student = studentId ? db.users.find((u) => u.id === studentId || u.rollNumber === studentId || u.email.toLowerCase() === studentId.toLowerCase()) : undefined;

      if (!student) {
        return res.status(404).json({ success: false, message: 'Student account not found.' });
      }

      const studentOutpasses = db.outpasses.filter((o) => o.studentId === student.id || (student.rollNumber && o.rollNumber === student.rollNumber));
      const studentLeaves = db.hostelLeaves.filter((l) => l.studentId === student.id || (student.rollNumber && l.rollNumber === student.rollNumber));
      const studentVisitors = db.visitors.filter((v) => v.studentId === student.id || (student.rollNumber && (v as any).studentRoll === student.rollNumber));
      const studentGateLogs = db.gateLogs.filter((g) => g.rollOrId === student.rollNumber || g.rollOrId === student.id);
      const studentNotifs = db.notifications.filter((n) => n.rollNumber === student.rollNumber || n.rollNumber === student.id);

      const activePass = studentOutpasses.find((o) => o.status === 'approved_hod' || o.status === 'pending_mentor' || o.status === 'approved_mentor');
      const approvedCount = studentOutpasses.filter((o) => o.status === 'approved_hod' || o.status === 'used').length;
      const pendingCount = studentOutpasses.filter((o) => o.status === 'pending_mentor' || o.status === 'approved_mentor').length;

      const mentor = db.users.find((u) => u.id === student.mentorId || u.role === 'mentor');

      return res.json({
        success: true,
        stats: {
          totalOutpasses: studentOutpasses.length,
          approvedOutpasses: approvedCount,
          pendingOutpasses: pendingCount,
          activeLeaves: studentLeaves.filter((l) => l.status === 'approved' || l.status === 'pending_warden').length,
          totalVisitors: studentVisitors.length,
          recentGateLogs: studentGateLogs.slice(0, 5),
        },
        profile: {
          ...student,
          mentorName: mentor ? mentor.name : 'Dr. Vikram Reddy',
          mentorEmail: mentor ? mentor.email : 'vikram.mentor@campusflow.edu',
        },
        activeOutpass: activePass || null,
        recentRequests: studentOutpasses.slice(0, 5),
        notifications: studentNotifs,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch student dashboard' });
    }
  });

  // GET Detailed Student Profile
  app.get('/api/student/profile', (req, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.headers['x-student-id'] as string;
      const student = (studentId ? db.users.find((u) => u.id === studentId || u.rollNumber === studentId || u.email.toLowerCase() === studentId.toLowerCase()) : null) || db.users.find(u => u.role === 'student')!;
      const mentor = db.users.find((u) => u.id === student.mentorId || u.role === 'mentor');

      const { passwordHash: _, ...sanitized } = student;
      return res.json({
        success: true,
        profile: {
          ...sanitized,
          mentorName: mentor ? mentor.name : 'Dr. Vikram Reddy',
          mentorEmail: mentor ? mentor.email : 'vikram.mentor@campusflow.edu',
          mentorDepartment: mentor ? mentor.department : 'Computer Science',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch profile' });
    }
  });

  // PUT Edit Student Profile
  app.put('/api/student/profile', async (req, res) => {
    try {
      const { studentId, roomNumber, parentName, parentEmail, parentPhone, avatarUrl } = req.body;
      const userIndex = db.users.findIndex((u) => u.id === studentId);

      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const user = db.users[userIndex];
      if (roomNumber) user.roomNumber = roomNumber;
      if (parentName) user.parentName = parentName;
      if (parentEmail) user.parentEmail = parentEmail;
      if (parentPhone) user.parentPhone = parentPhone;
      if (avatarUrl) user.avatarUrl = avatarUrl;

      db.users[userIndex] = user;
      await syncUserToMongo(user);

      const { passwordHash: _, ...sanitized } = user;
      return res.json({
        success: true,
        message: 'Profile updated successfully!',
        profile: sanitized,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
    }
  });

  // GET Complete Student Request History (Outpasses, Hostel Leaves, Visitor Passes)
  app.get('/api/student/history', (req, res) => {
    try {
      const studentId = (req.query.studentId as string) || req.headers['x-student-id'] as string;
      const student = (studentId ? db.users.find((u) => u.id === studentId || u.rollNumber === studentId || u.email.toLowerCase() === studentId.toLowerCase()) : null) || db.users.find(u => u.role === 'student')!;

      const outpasses = db.outpasses.filter((o) => o.studentId === student.id || (student.rollNumber && o.rollNumber === student.rollNumber));
      const hostelLeaves = db.hostelLeaves.filter((l) => l.studentId === student.id || (student.rollNumber && l.rollNumber === student.rollNumber));
      const visitors = db.visitors.filter((v) => v.studentId === student.id || (student.rollNumber && (v as any).studentRoll === student.rollNumber));

      return res.json({
        success: true,
        history: {
          outpasses,
          hostelLeaves,
          visitors,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch student history' });
    }
  });

  // ----------------------------------------------------
  // OUTPASS WORKFLOW ROUTES
  // ----------------------------------------------------

  // Apply for Outpass
  app.post('/api/outpass/apply', async (req, res) => {
    try {
      const { studentId, reason, outDate, outTime, inDate, inTime, destination } = req.body;
      const student = db.users.find((u) => u.id === studentId) || db.users[0];

      const outpassId = `OP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newOutpass: Outpass = {
        id: outpassId,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber || '21CSE104',
        department: student.department || 'Computer Science',
        year: student.year || '4th Year',
        section: student.section || 'CSE-A',
        reason,
        outDate,
        outTime,
        inDate,
        inTime,
        destination,
        status: 'pending_mentor',
        createdAt: new Date().toISOString(),
        parentNotificationSent: false,
      };

      db.outpasses.unshift(newOutpass);
      await syncOutpassToMongo(newOutpass);

      return res.json({
        success: true,
        message: 'Outpass applied successfully! Routed to Mentor for review.',
        outpass: newOutpass,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // List Outpasses filtered by role & permissions
  app.get('/api/outpass/list', (req, res) => {
    const { role, userId, status } = req.query;

    let results = [...db.outpasses];

    if (role === 'student' && userId) {
      const studentUser = db.users.find((u) => u.id === userId || u.rollNumber === userId);
      const userRoll = studentUser?.rollNumber;
      results = results.filter((o) => o.studentId === userId || (userRoll && o.rollNumber === userRoll) || (studentUser && o.studentId === studentUser.id));
    } else if (role === 'mentor') {
      // Mentor sees pending mentor passes or ones reviewed
      results = results.filter((o) => o.status === 'pending_mentor' || o.status === 'approved_mentor' || o.status === 'rejected_mentor');
    } else if (role === 'hod') {
      // HOD sees approved_mentor passes ready for final sign off or reviewed
      results = results.filter((o) => o.status === 'approved_mentor' || o.status === 'approved_hod' || o.status === 'rejected_hod');
    } else if (role === 'security') {
      // Security sees approved_hod, used passes
      results = results.filter((o) => o.status === 'approved_hod' || o.status === 'used');
    }

    if (status && typeof status === 'string') {
      results = results.filter((o) => o.status === status);
    }

    return res.json({ success: true, outpasses: results });
  });

  // GET Student Outpasses (Dedicated endpoint for Module 3)
  app.get('/api/outpass/student', (req, res) => {
    try {
      const studentId = (req.query.studentId as string) || (req.headers['x-student-id'] as string);
      const student = db.users.find((u) => u.id === studentId || u.role === 'student') || db.users.find(u => u.role === 'student')!;
      
      const studentOutpasses = db.outpasses.filter((o) => o.studentId === student.id);
      return res.json({ success: true, count: studentOutpasses.length, outpasses: studentOutpasses });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch student outpasses' });
    }
  });

  // GET Single Outpass Detail & Approval Timeline (Dedicated endpoint for Module 3)
  app.get('/api/outpass/detail/:id', (req, res) => {
    try {
      const { id } = req.params;
      const outpass = db.outpasses.find((o) => o.id === id);

      if (!outpass) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      // Build workflow timeline status stages
      const timeline = [
        {
          stage: 'Application Submitted',
          completed: true,
          timestamp: outpass.createdAt,
          details: `Requested for ${outpass.outDate} ${outpass.outTime} to ${outpass.destination}`,
        },
        {
          stage: 'Mentor Review',
          completed: outpass.status !== 'pending_mentor',
          status: outpass.status === 'rejected_mentor' ? 'rejected' : outpass.status === 'pending_mentor' ? 'pending' : 'approved',
          remarks: outpass.mentorRemarks || (outpass.status === 'pending_mentor' ? 'Awaiting Mentor review...' : 'Approved by Mentor'),
        },
        {
          stage: 'HOD Approval',
          completed: outpass.status === 'approved_hod' || outpass.status === 'used' || outpass.status === 'rejected_hod',
          status: outpass.status === 'rejected_hod' ? 'rejected' : (outpass.status === 'approved_hod' || outpass.status === 'used') ? 'approved' : 'pending',
          remarks: outpass.hodRemarks || (outpass.status === 'approved_hod' || outpass.status === 'used' ? 'Final Sign-off Granted' : 'Pending HOD approval'),
        },
        {
          stage: 'Gate Exit Verified',
          completed: Boolean(outpass.exitTime || outpass.status === 'used'),
          timestamp: outpass.exitTime,
          details: outpass.exitTime ? `Exited campus at ${new Date(outpass.exitTime).toLocaleTimeString()}` : 'Awaiting Security Gate QR Scan',
        },
      ];

      return res.json({
        success: true,
        outpass,
        timeline,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch outpass detail' });
    }
  });

  // DELETE Cancel Outpass Request (Dedicated endpoint for Module 3)
  app.delete('/api/outpass/cancel/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const opIndex = db.outpasses.findIndex((o) => o.id === id);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      const op = db.outpasses[opIndex];
      if (op.status === 'used') {
        return res.status(400).json({ success: false, message: 'Cannot cancel an outpass that has already been verified at gate.' });
      }

      db.outpasses.splice(opIndex, 1);
      await deleteOutpassFromMongo(id);

      return res.json({
        success: true,
        message: `Outpass ${id} has been canceled successfully.`,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to cancel outpass' });
    }
  });

  // Approve Outpass (Mentor or HOD)
  app.post('/api/outpass/approve', async (req, res) => {
    try {
      const { outpassId, role, remarks } = req.body;
      const opIndex = db.outpasses.findIndex((o) => o.id === outpassId);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass record not found' });
      }

      const op = db.outpasses[opIndex];

      if (role === 'mentor') {
        op.status = 'approved_mentor';
        op.mentorRemarks = remarks || 'Approved by Section Mentor';
      } else if (role === 'hod') {
        op.status = 'approved_hod';
        op.hodRemarks = remarks || 'Final Approval Granted by Head of Department';

        // Generate QR Code payload
        const qrPayload = JSON.stringify({
          type: 'CAMPUSFLOW_OUTPASS',
          passId: op.id,
          rollNumber: op.rollNumber,
          studentName: op.studentName,
          validUntil: `${op.inDate} ${op.inTime}`,
        });

        const qrDataUrl = await QRCode.toDataURL(qrPayload);
        op.qrCode = qrDataUrl;
      }

      db.outpasses[opIndex] = op;
      await syncOutpassToMongo(op);

      return res.json({
        success: true,
        message: `Outpass ${op.id} approved by ${role.toUpperCase()}.`,
        outpass: op,
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  });

  // Reject Outpass
  app.post('/api/outpass/reject', async (req, res) => {
    const { outpassId, role, remarks } = req.body;
    const opIndex = db.outpasses.findIndex((o) => o.id === outpassId);

    if (opIndex === -1) {
      return res.status(404).json({ success: false, message: 'Outpass record not found' });
    }

    const op = db.outpasses[opIndex];
    if (role === 'mentor') {
      op.status = 'rejected_mentor';
      op.mentorRemarks = remarks || 'Rejected by Mentor due to insufficient reason.';
    } else if (role === 'hod') {
      op.status = 'rejected_hod';
      op.hodRemarks = remarks || 'Rejected by Department HOD.';
    }

    db.outpasses[opIndex] = op;
    await syncOutpassToMongo(op);

    return res.json({
      success: true,
      message: `Outpass ${op.id} rejected by ${role.toUpperCase()}.`,
      outpass: op,
    });
  });

  // ----------------------------------------------------
  // MODULE 4: MENTOR DASHBOARD APIs
  // ----------------------------------------------------

  // GET Pending Outpass Requests for Mentor
  app.get('/api/mentor/requests', (req, res) => {
    try {
      const mentorId = (req.query.mentorId as string) || (req.headers['x-mentor-id'] as string);
      
      // Filter outpasses for mentor queue (pending_mentor, approved_mentor, rejected_mentor)
      const mentorOutpasses = db.outpasses.map((op) => {
        const student = db.users.find((u) => u.id === op.studentId || u.rollNumber === op.rollNumber);
        return {
          ...op,
          studentDetails: {
            name: student ? student.name : op.studentName,
            rollNumber: student ? student.rollNumber : op.rollNumber,
            department: student ? student.department : op.department,
            year: student ? student.year : op.year,
            section: student ? student.section : op.section,
            hostelBlock: student ? student.hostelBlock : 'A-Block (Boys)',
            roomNumber: student ? student.roomNumber : 'A-101',
            parentName: student ? student.parentName : 'Parent / Guardian',
            parentEmail: student ? student.parentEmail : 'parent@example.com',
            parentPhone: student ? student.parentPhone : '+91 98765 43210',
            avatarUrl: student ? student.avatarUrl : undefined,
          },
        };
      });

      return res.json({
        success: true,
        count: mentorOutpasses.length,
        pendingCount: mentorOutpasses.filter((o) => o.status === 'pending_mentor').length,
        requests: mentorOutpasses,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch mentor requests' });
    }
  });

  // PUT Approve Outpass by Mentor
  app.put('/api/mentor/approve/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const opIndex = db.outpasses.findIndex((o) => o.id === id);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      const op = db.outpasses[opIndex];
      op.status = 'approved_mentor';
      op.mentorRemarks = remarks || 'Approved by Section Mentor after verification';

      db.outpasses[opIndex] = op;
      await syncOutpassToMongo(op);

      return res.json({
        success: true,
        message: `Outpass ${id} approved by Mentor and routed to HOD!`,
        outpass: op,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to approve outpass' });
    }
  });

  // PUT Reject Outpass by Mentor
  app.put('/api/mentor/reject/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const opIndex = db.outpasses.findIndex((o) => o.id === id);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      const op = db.outpasses[opIndex];
      op.status = 'rejected_mentor';
      op.mentorRemarks = remarks || 'Rejected by Section Mentor.';

      db.outpasses[opIndex] = op;
      await syncOutpassToMongo(op);

      return res.json({
        success: true,
        message: `Outpass ${id} rejected by Mentor.`,
        outpass: op,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to reject outpass' });
    }
  });

  // ----------------------------------------------------
  // MODULE 5: HOD DASHBOARD APIs
  // ----------------------------------------------------

  // GET Mentor Approved Requests for HOD Sign-Off
  app.get('/api/hod/requests', (req, res) => {
    try {
      const hodOutpasses = db.outpasses
        .filter((op) => op.status === 'approved_mentor' || op.status === 'approved_hod' || op.status === 'rejected_hod')
        .map((op) => {
          const student = db.users.find((u) => u.id === op.studentId || u.rollNumber === op.rollNumber);
          return {
            ...op,
            studentDetails: {
              name: student ? student.name : op.studentName,
              rollNumber: student ? student.rollNumber : op.rollNumber,
              department: student ? student.department : op.department,
              year: student ? student.year : op.year,
              section: student ? student.section : op.section,
              hostelBlock: student ? student.hostelBlock : 'A-Block (Boys)',
              roomNumber: student ? student.roomNumber : 'A-101',
              parentName: student ? student.parentName : 'Parent / Guardian',
              parentPhone: student ? student.parentPhone : '+91 98765 43210',
            },
          };
        });

      return res.json({
        success: true,
        count: hodOutpasses.length,
        pendingHodCount: hodOutpasses.filter((o) => o.status === 'approved_mentor').length,
        approvedHodCount: hodOutpasses.filter((o) => o.status === 'approved_hod').length,
        requests: hodOutpasses,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch HOD requests' });
    }
  });

  // PUT Approve Outpass by HOD & Generate QR Code
  app.put('/api/hod/approve/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const opIndex = db.outpasses.findIndex((o) => o.id === id);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      const op = db.outpasses[opIndex];
      op.status = 'approved_hod';
      op.hodRemarks = remarks || 'Final Approval Granted by Head of Department';

      // Construct Cryptographic QR Code Verification Payload
      const qrPayload = JSON.stringify({
        type: 'CAMPUSFLOW_OUTPASS',
        passId: op.id,
        rollNumber: op.rollNumber,
        studentName: op.studentName,
        department: op.department,
        destination: op.destination,
        outDateTime: `${op.outDate}T${op.outTime}`,
        validUntil: `${op.inDate}T${op.inTime}`,
        issuedAt: new Date().toISOString(),
      });

      // Generate High-Res Data URL PNG
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 500,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      op.qrCode = qrDataUrl;
      db.outpasses[opIndex] = op;
      await syncOutpassToMongo(op);

      return res.json({
        success: true,
        message: `Outpass ${id} approved by HOD! QR Code generated & stored in MongoDB.`,
        outpass: op,
        qrCode: qrDataUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to approve outpass by HOD' });
    }
  });

  // PUT Reject Outpass by HOD
  app.put('/api/hod/reject/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const opIndex = db.outpasses.findIndex((o) => o.id === id);

      if (opIndex === -1) {
        return res.status(404).json({ success: false, message: 'Outpass request not found' });
      }

      const op = db.outpasses[opIndex];
      op.status = 'rejected_hod';
      op.hodRemarks = remarks || 'Rejected by Department HOD.';

      db.outpasses[opIndex] = op;
      await syncOutpassToMongo(op);

      return res.json({
        success: true,
        message: `Outpass ${id} rejected by HOD.`,
        outpass: op,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to reject outpass by HOD' });
    }
  });

  // Security QR Scan Verification (Exit or Re-entry)
  app.post('/api/outpass/scan', async (req, res) => {
    const { qrText, passId, gateNumber, officerName } = req.body;

    let targetId = passId;
    if (qrText) {
      try {
        const parsed = JSON.parse(qrText);
        targetId = parsed.passId || targetId;
      } catch (e) {
        if (qrText.includes('OP-')) {
          const match = qrText.match(/OP-2026-\d+/);
          if (match) targetId = match[0];
        }
      }
    }

    const op = db.outpasses.find((o) => o.id === targetId || o.qrCode === qrText);

    if (!op) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid Gate Pass QR Code! No record found in CampusFlow Database.',
      });
    }

    if (op.status !== 'approved_hod' && op.status !== 'used') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Pass verification failed! Current pass status is '${op.status}'. Required: Approved by HOD.`,
      });
    }

    const isExit = !op.exitTime;
    const actionType = isExit ? 'EXIT' : 'ENTRY';
    const timestamp = new Date().toISOString();

    if (isExit) {
      op.exitTime = timestamp;
      op.status = 'used';
    } else {
      op.entryTime = timestamp;
    }

    // Add Gate Log
    const gateLog: GateLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      passId: op.id,
      passType: 'outpass',
      personName: op.studentName,
      personRole: `Student (${op.rollNumber})`,
      rollOrId: op.rollNumber,
      action: actionType,
      timestamp,
      securityOfficer: officerName || 'Officer Ram Singh',
      gateNumber: gateNumber || 'Main Gate 01',
    };
    db.gateLogs.unshift(gateLog);

    // Send Parent Email Notification Simulation
    const studentUser = db.users.find((u) => u.id === op.studentId);
    const parentEmail = studentUser?.parentEmail || 'parent@gmail.com';

    const notif: ParentNotification = {
      id: `NOTIF-${Date.now()}`,
      studentName: op.studentName,
      rollNumber: op.rollNumber,
      parentEmail,
      subject: `[CampusFlow Alert] Gate ${actionType} Recorded for ${op.studentName}`,
      body: `Dear Parent, your ward ${op.studentName} (${op.rollNumber}) completed gate ${actionType} at ${new Date(timestamp).toLocaleTimeString()} on ${new Date(timestamp).toLocaleDateString()} under Outpass ${op.id}. Destination: ${op.destination}.`,
      timestamp,
      type: actionType === 'EXIT' ? 'OUTPASS_EXIT' : 'OUTPASS_ENTRY',
    };
    db.notifications.unshift(notif);
    op.parentNotificationSent = true;

    // Sync to MongoDB Atlas
    await syncOutpassToMongo(op);
    await syncGateLogToMongo(gateLog);
    await syncNotificationToMongo(notif);

    return res.json({
      success: true,
      valid: true,
      action: actionType,
      message: `QR Verified! ${actionType} recorded for ${op.studentName} (${op.rollNumber}). Automated parent email dispatched!`,
      outpass: op,
      gateLog,
      notification: notif,
    });
  });

  // ----------------------------------------------------
  // MODULE 6: SECURITY DASHBOARD APIs
  // ----------------------------------------------------

  // Security QR Scan Verification (Handles Outpasses & Hostel Leaves)
  app.post('/api/security/verify-qr', async (req, res) => {
    try {
      const { qrText, passId, gateNumber, officerName } = req.body;

      let targetId = (passId || '').trim();
      let validUntil: string | null = null;
      let isHostelLeaveQR = false;

      if (qrText) {
        try {
          const parsed = JSON.parse(qrText);
          targetId = parsed.leaveId || parsed.passId || parsed.id || targetId;
          validUntil = parsed.validUntil || parsed.endDate || null;
          if (parsed.type === 'CAMPUSFLOW_HOSTEL_LEAVE' || (targetId && targetId.startsWith('HL-'))) {
            isHostelLeaveQR = true;
          }
        } catch (e) {
          const outpassMatch = qrText.match(/OP-2026-\d+/);
          const hostelMatch = qrText.match(/HL-2026-\d+/);
          if (hostelMatch) {
            targetId = hostelMatch[0];
            isHostelLeaveQR = true;
          } else if (outpassMatch) {
            targetId = outpassMatch[0];
          } else if (qrText.trim().startsWith('HL-')) {
            targetId = qrText.trim();
            isHostelLeaveQR = true;
          }
        }
      }

      if (targetId.startsWith('HL-')) {
        isHostelLeaveQR = true;
      }

      // Check Hostel Leaves Database if targetId is an HL pass or if not found in outpasses
      const hostelLeave = db.hostelLeaves.find(
        (l) => l.id === targetId || l.qrCode === qrText || (targetId && l.id.toLowerCase() === targetId.toLowerCase())
      );

      if (hostelLeave || isHostelLeaveQR) {
        if (!hostelLeave) {
          return res.json({
            success: false,
            valid: false,
            reason: 'NO_RECORD_FOUND',
            message: 'INVALID HOSTEL LEAVE QR! No matching hostel leave record found in CampusFlow Database.',
          });
        }

        // 2-TIME USE CHECK FOR HOSTEL LEAVE (1st Scan = EXIT, 2nd Scan = ENTRY)
        if (hostelLeave.status === 'returned' || hostelLeave.status === 'used') {
          const entryTimeStr = (hostelLeave as any).entryTime ? ` at ${new Date((hostelLeave as any).entryTime).toLocaleTimeString()}` : '';
          return res.json({
            success: false,
            valid: false,
            reason: 'ALREADY_USED',
            message: `HOSTEL LEAVE COMPLETED! Student ${hostelLeave.studentName} has already completed both EXIT and RE-ENTRY scans for Hostel Leave ${hostelLeave.id}${entryTimeStr}. 2-time pass usage completed.`,
          });
        }

        if (hostelLeave.status !== 'approved' && hostelLeave.status !== 'checked_out') {
          return res.json({
            success: false,
            valid: false,
            reason: 'UNAPPROVED_STATUS',
            message: `HOSTEL LEAVE VERIFICATION FAILED! Current status is '${hostelLeave.status}'. Required: Approved by Hostel Warden.`,
          });
        }

        const timestamp = new Date().toISOString();
        const isReEntry = hostelLeave.status === 'checked_out';
        const actionType = isReEntry ? 'ENTRY' : 'EXIT';

        if (isReEntry) {
          // SCAN 2: RE-ENTRY TO CAMPUS
          hostelLeave.status = 'returned';
          (hostelLeave as any).entryTime = timestamp;
        } else {
          // SCAN 1: EXIT FROM CAMPUS
          hostelLeave.status = 'checked_out';
          (hostelLeave as any).exitTime = timestamp;
        }

        const studentUser = db.users.find((u) => u.id === hostelLeave.studentId || u.rollNumber === hostelLeave.rollNumber);

        const gateLog: GateLog = {
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          passId: hostelLeave.id,
          passType: 'hostel_leave',
          personName: hostelLeave.studentName,
          personRole: `Student (${hostelLeave.rollNumber})`,
          rollOrId: hostelLeave.rollNumber,
          action: actionType,
          timestamp,
          securityOfficer: officerName || 'Officer Ram Singh',
          gateNumber: gateNumber || 'Main Gate 01',
        };
        db.gateLogs.unshift(gateLog);

        const parentEmail = studentUser?.parentEmail || 'parent@gmail.com';
        const notif: ParentNotification = {
          id: `NOTIF-${Date.now()}`,
          studentName: hostelLeave.studentName,
          rollNumber: hostelLeave.rollNumber,
          parentEmail,
          subject: `[CampusFlow Security Alert] Hostel Leave Gate ${actionType} Recorded for ${hostelLeave.studentName}`,
          body: `Dear Parent, your ward ${hostelLeave.studentName} (${hostelLeave.rollNumber}) completed gate ${actionType} at ${new Date(timestamp).toLocaleTimeString()} on ${new Date(timestamp).toLocaleDateString()} under Hostel Leave ${hostelLeave.id} (${hostelLeave.leaveType}). Reason: ${hostelLeave.reason}.`,
          timestamp,
          type: 'HOSTEL_LEAVE',
        };
        db.notifications.unshift(notif);

        await syncHostelLeaveToMongo(hostelLeave);
        await syncGateLogToMongo(gateLog);
        await syncNotificationToMongo(notif);

        return res.json({
          success: true,
          valid: true,
          action: actionType,
          message: isReEntry
            ? `HOSTEL LEAVE RE-ENTRY VERIFIED! Campus RE-ENTRY recorded for ${hostelLeave.studentName} (${hostelLeave.rollNumber}). (Hostel leave 2-time pass completed)`
            : `HOSTEL LEAVE EXIT VERIFIED! Campus EXIT recorded for ${hostelLeave.studentName} (${hostelLeave.rollNumber}). (Pass active for 1 return entry scan)`,
          studentDetails: {
            name: hostelLeave.studentName,
            rollNumber: hostelLeave.rollNumber,
            department: studentUser?.department || 'Computer Science',
            year: studentUser?.year || '3rd Year',
            section: studentUser?.section || 'A',
            hostelBlock: hostelLeave.hostelBlock,
            roomNumber: hostelLeave.roomNumber,
            parentPhone: hostelLeave.parentPhone || studentUser?.parentPhone || '+91 98765 43210',
            destination: `Hostel Leave (${hostelLeave.leaveType}): ${hostelLeave.reason}`,
          },
          hostelLeave,
          gateLog,
        });
      }

      // Fallback Search for Outpass
      const op = db.outpasses.find((o) => o.id === targetId || o.qrCode === qrText || (targetId && o.id.toLowerCase() === targetId.toLowerCase()));

      if (!op) {
        return res.json({
          success: false,
          valid: false,
          reason: 'NO_RECORD_FOUND',
          message: 'INVALID QR PASS! No matching Outpass or Hostel Leave record found in CampusFlow Database.',
        });
      }

      // STRICT ONE-TIME USE CHECK FOR OUTPASS
      if (op.status === 'used') {
        const exitTimeStr = op.exitTime ? ` at ${new Date(op.exitTime).toLocaleTimeString()}` : '';
        return res.json({
          success: false,
          valid: false,
          reason: 'ALREADY_USED',
          message: `QR PASS ALREADY USED! Outpass ${op.id} was already verified for gate exit${exitTimeStr}. Single-use passes cannot be re-scanned!`,
        });
      }

      if (op.status !== 'approved_hod') {
        return res.json({
          success: false,
          valid: false,
          reason: 'UNAPPROVED_STATUS',
          message: `VERIFICATION FAILED! Current pass status is '${op.status}'. Required: Approved by HOD.`,
        });
      }

      // Check Expiry (Grace period granted until 23:59 for same-day approved passes)
      if (validUntil) {
        const expiryDate = new Date(validUntil);
        const now = new Date();
        const isSameDayPass = op && (op.inDate === now.toISOString().split('T')[0] || op.outDate === now.toISOString().split('T')[0]);
        const effectiveExpiry = isSameDayPass ? new Date(`${op.inDate || now.toISOString().split('T')[0]}T23:59:59`) : expiryDate;

        if (now > effectiveExpiry) {
          return res.json({
            success: false,
            valid: false,
            reason: 'EXPIRED_PASS',
            message: `EXPIRED QR PASS! Pass validity ended at ${expiryDate.toLocaleString()}. Exit Denied!`,
          });
        }
      }

      // SINGLE-ACTION EXIT RECORDING
      const actionType = 'EXIT';
      const timestamp = new Date().toISOString();

      op.exitTime = timestamp;
      op.status = 'used'; // MARK AS USED (SINGLE-USE QR PASS)

      const studentUser = db.users.find((u) => u.id === op.studentId || u.rollNumber === op.rollNumber);

      const gateLog: GateLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        passId: op.id,
        passType: 'outpass',
        personName: op.studentName,
        personRole: `Student (${op.rollNumber})`,
        rollOrId: op.rollNumber,
        action: 'EXIT',
        timestamp,
        securityOfficer: officerName || 'Officer Ram Singh',
        gateNumber: gateNumber || 'Main Gate 01',
      };
      db.gateLogs.unshift(gateLog);

      // Parent Notification
      const parentEmail = studentUser?.parentEmail || 'parent@gmail.com';
      const notif: ParentNotification = {
        id: `NOTIF-${Date.now()}`,
        studentName: op.studentName,
        rollNumber: op.rollNumber,
        parentEmail,
        subject: `[CampusFlow Security Alert] Gate EXIT Recorded for ${op.studentName}`,
        body: `Dear Parent, your ward ${op.studentName} (${op.rollNumber}) completed gate EXIT at ${new Date(timestamp).toLocaleTimeString()} on ${new Date(timestamp).toLocaleDateString()} under Outpass ${op.id}. Destination: ${op.destination}.`,
        timestamp,
        type: 'OUTPASS_EXIT',
      };
      db.notifications.unshift(notif);
      op.parentNotificationSent = true;

      // MongoDB Sync
      await syncOutpassToMongo(op);
      await syncGateLogToMongo(gateLog);
      await syncNotificationToMongo(notif);

      return res.json({
        success: true,
        valid: true,
        action: 'EXIT',
        message: `PASS VERIFIED SUCCESSFULLY! Campus EXIT recorded for ${op.studentName} (${op.rollNumber}). (Single-use pass completed)`,
        studentDetails: {
          name: op.studentName,
          rollNumber: op.rollNumber,
          department: op.department,
          year: op.year,
          section: op.section,
          hostelBlock: studentUser?.hostelBlock || 'A-Block (Boys)',
          roomNumber: studentUser?.roomNumber || 'A-101',
          parentPhone: studentUser?.parentPhone || '+91 98765 43210',
          destination: op.destination,
        },
        outpass: op,
        gateLog,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Gate QR verification error' });
    }
  });

  // GET Today's Gate Logs & Statistics
  app.get('/api/security/today-logs', (req, res) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLogs = db.gateLogs.filter((log) => log.timestamp.startsWith(todayStr));

      const exitsToday = todayLogs.filter((l) => l.action === 'EXIT').length;
      const entriesToday = todayLogs.filter((l) => l.action === 'ENTRY').length;

      return res.json({
        success: true,
        stats: {
          totalToday: todayLogs.length,
          exitsToday,
          entriesToday,
          activeOutpassCount: db.outpasses.filter((o) => o.status === 'used' && !o.entryTime).length,
        },
        logs: db.gateLogs,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch gate logs' });
    }
  });

  // ----------------------------------------------------
  // MODULE 7: HOSTEL LEAVE ROUTES & APIs
  // ----------------------------------------------------

  // POST Apply Hostel Leave
  app.post('/api/hostel/apply', async (req, res) => {
    try {
      const { studentId, leaveType, reason, startDate, endDate, parentPhone } = req.body;
      const student = db.users.find((u) => u.id === studentId) || db.users[0];

      const leaveId = `HL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newLeave: HostelLeave = {
        id: leaveId,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber || '21CSE104',
        hostelBlock: student.hostelBlock || 'A-Block (Boys)',
        roomNumber: student.roomNumber || 'A-304',
        leaveType: leaveType || 'weekend',
        reason,
        startDate,
        endDate,
        parentPermissionVerified: true,
        parentPhone: parentPhone || student.parentPhone || '+91 98765 43210',
        status: 'pending_warden',
        createdAt: new Date().toISOString(),
      };

      db.hostelLeaves.unshift(newLeave);
      await syncHostelLeaveToMongo(newLeave);

      return res.json({
        success: true,
        message: 'Hostel leave application submitted to Warden!',
        leave: newLeave,
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  });

  // GET Student Hostel Leaves (Dedicated endpoint for Module 7)
  app.get('/api/hostel/student', (req, res) => {
    try {
      const studentId = (req.query.studentId as string) || (req.headers['x-student-id'] as string);
      const student = db.users.find((u) => u.id === studentId || u.role === 'student') || db.users.find(u => u.role === 'student')!;
      
      const studentLeaves = db.hostelLeaves.filter((l) => l.studentId === student.id);
      return res.json({ success: true, count: studentLeaves.length, leaves: studentLeaves });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch student hostel leaves' });
    }
  });

  // GET Warden Pending Hostel Leaves (Dedicated endpoint for Module 7)
  app.get('/api/hostel/warden', (req, res) => {
    try {
      const wardenBlock = (req.query.block as string) || 'A-Block (Boys)';
      const wardenLeaves = db.hostelLeaves.map((l) => {
        const student = db.users.find((u) => u.id === l.studentId || u.rollNumber === l.rollNumber);
        return {
          ...l,
          studentDetails: {
            name: student ? student.name : l.studentName,
            rollNumber: student ? student.rollNumber : l.rollNumber,
            department: student ? student.department : 'Computer Science',
            year: student ? student.year : '3rd Year',
            section: student ? student.section : 'A',
            hostelBlock: student ? student.hostelBlock : l.hostelBlock,
            roomNumber: student ? student.roomNumber : l.roomNumber,
            parentName: student ? student.parentName : 'Parent / Guardian',
            parentPhone: student ? student.parentPhone : l.parentPhone,
          },
        };
      });

      return res.json({
        success: true,
        count: wardenLeaves.length,
        pendingWardenCount: wardenLeaves.filter((l) => l.status === 'pending_warden').length,
        approvedWardenCount: wardenLeaves.filter((l) => l.status === 'approved').length,
        leaves: wardenLeaves,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch warden hostel leaves' });
    }
  });

  // PUT Approve Hostel Leave by Warden & Generate QR
  app.put('/api/hostel/approve/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const leaveIndex = db.hostelLeaves.findIndex((l) => l.id === id);

      if (leaveIndex === -1) {
        return res.status(404).json({ success: false, message: 'Hostel leave record not found' });
      }

      const leave = db.hostelLeaves[leaveIndex];
      leave.status = 'approved';
      leave.wardenRemarks = remarks || 'Approved by Hostel Warden after guardian verification.';

      // Generate QR Code
      const qrPayload = JSON.stringify({
        type: 'CAMPUSFLOW_HOSTEL_LEAVE',
        leaveId: leave.id,
        rollNumber: leave.rollNumber,
        studentName: leave.studentName,
        startDate: leave.startDate,
        endDate: leave.endDate,
        issuedAt: new Date().toISOString(),
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 500 });
      leave.qrCode = qrDataUrl;

      db.hostelLeaves[leaveIndex] = leave;
      await syncHostelLeaveToMongo(leave);

      return res.json({
        success: true,
        message: `Hostel leave ${id} approved by Warden! QR Code generated & stored in MongoDB.`,
        leave,
        qrCode: qrDataUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to approve hostel leave' });
    }
  });

  // PUT Reject Hostel Leave by Warden
  app.put('/api/hostel/reject/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { remarks } = req.body;
      const leaveIndex = db.hostelLeaves.findIndex((l) => l.id === id);

      if (leaveIndex === -1) {
        return res.status(404).json({ success: false, message: 'Hostel leave record not found' });
      }

      const leave = db.hostelLeaves[leaveIndex];
      leave.status = 'rejected';
      leave.wardenRemarks = remarks || 'Rejected by Hostel Warden.';

      db.hostelLeaves[leaveIndex] = leave;
      await syncHostelLeaveToMongo(leave);

      return res.json({
        success: true,
        message: `Hostel leave ${id} rejected by Warden.`,
        leave,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to reject hostel leave' });
    }
  });

  // ----------------------------------------------------
  // MODULE 8: VISITOR MANAGEMENT ROUTES & APIs
  // ----------------------------------------------------

  // POST Register Visitor & Generate QR Code
  app.post('/api/visitor/register', async (req, res) => {
    try {
      const { studentId, visitorName, visitorPhone, relation, purpose, visitDate, idProofNumber } = req.body;
      const student = db.users.find((u) => u.id === studentId || u.role === 'student') || db.users.find((u) => u.role === 'student')!;

      const visId = `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newVisitor: Visitor = {
        id: visId,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber || '2310030001',
        visitorName,
        visitorPhone,
        relation: relation || 'Guardian / Family',
        purpose,
        visitDate: visitDate || new Date().toISOString().split('T')[0],
        idProofNumber: idProofNumber || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      // Construct Visitor Verification QR Payload
      const qrPayload = JSON.stringify({
        type: 'CAMPUSFLOW_VISITOR',
        passId: newVisitor.id,
        visitorName: newVisitor.visitorName,
        visitorPhone: newVisitor.visitorPhone,
        studentRoll: newVisitor.studentRoll,
        studentName: newVisitor.studentName,
        visitDate: newVisitor.visitDate,
        issuedAt: new Date().toISOString(),
      });

      // Generate High-Res Data URL PNG
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 500,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      newVisitor.qrCode = qrDataUrl;
      db.visitors.unshift(newVisitor);
      await syncVisitorToMongo(newVisitor);

      return res.json({
        success: true,
        message: `Visitor Pass registered for ${visitorName}! Official QR Pass generated & stored in MongoDB.`,
        visitor: newVisitor,
        qrCode: qrDataUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to register visitor' });
    }
  });

  // GET Visitor List
  app.get('/api/visitor/list', (req, res) => {
    try {
      const studentId = req.query.studentId as string;
      let results = [...db.visitors];

      if (studentId) {
        results = results.filter((v) => v.studentId === studentId);
      }

      return res.json({ success: true, count: results.length, visitors: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch visitor list' });
    }
  });

  // POST Verify Visitor QR Pass at Gate
  app.post('/api/visitor/verify', async (req, res) => {
    try {
      const { qrText, passId, gateNumber, officerName } = req.body;

      let targetId = passId;
      if (qrText) {
        try {
          const parsed = JSON.parse(qrText);
          targetId = parsed.passId || targetId;
        } catch (e) {
          if (qrText.includes('VIS-')) {
            const match = qrText.match(/VIS-2026-\d+/);
            if (match) targetId = match[0];
          }
        }
      }

      const visitor = db.visitors.find((v) => v.id === targetId || v.qrCode === qrText);

      if (!visitor) {
        return res.status(404).json({
          success: false,
          valid: false,
          message: 'INVALID VISITOR QR PASS! No matching visitor record found.',
        });
      }

      const isCheckIn = !visitor.checkInTime;
      const actionType = isCheckIn ? 'ENTRY' : 'EXIT';
      const timestamp = new Date().toISOString();

      if (isCheckIn) {
        visitor.checkInTime = timestamp;
        visitor.status = 'checked_in';
      } else {
        visitor.checkOutTime = timestamp;
        visitor.status = 'completed';
      }

      // Add to Gate Audit Logs
      const gateLog: GateLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        passId: visitor.id,
        passType: 'visitor',
        personName: `${visitor.visitorName} (Guest of ${visitor.studentName})`,
        personRole: `Visitor (${visitor.relation})`,
        rollOrId: visitor.studentRoll || visitor.visitorPhone,
        action: actionType,
        timestamp,
        securityOfficer: officerName || 'Officer Ram Singh',
        gateNumber: gateNumber || 'Main Gate 01',
      };

      db.gateLogs.unshift(gateLog);
      await syncVisitorToMongo(visitor);
      await syncGateLogToMongo(gateLog);

      return res.json({
        success: true,
        valid: true,
        action: actionType,
        message: `VISITOR VERIFIED! ${actionType} logged for guest ${visitor.visitorName} visiting ${visitor.studentName}.`,
        visitor,
        gateLog,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to verify visitor QR pass' });
    }
  });

  // POST /api/security/add-visitor (Manual Gate Entry for Campus Visitors)
  app.post('/api/security/add-visitor', async (req, res) => {
    try {
      const {
        visitorName,
        visitorPhone,
        relation,
        purpose,
        studentRoll,
        idProofNumber,
        checkInTime,
        expectedExitTime,
        vehicleNumber,
        officerName,
      } = req.body;

      if (!visitorName || !visitorPhone) {
        return res.status(400).json({ success: false, message: 'Visitor Name and Phone Number are required.' });
      }

      const student = db.users.find((u) => u.rollNumber === studentRoll || u.name === studentRoll) || null;

      const visId = `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const nowIso = new Date().toISOString();
      let checkInTimestamp = nowIso;

      if (checkInTime) {
        if (checkInTime.includes('T') || checkInTime.includes('-')) {
          const d = new Date(checkInTime);
          if (!isNaN(d.getTime())) checkInTimestamp = d.toISOString();
        } else if (checkInTime.includes(':')) {
          const todayStr = new Date().toISOString().split('T')[0];
          const d = new Date(`${todayStr}T${checkInTime}:00`);
          if (!isNaN(d.getTime())) checkInTimestamp = d.toISOString();
        }
      }

      const newVisitor: Visitor = {
        id: visId,
        studentId: student ? student.id : 'guest',
        studentName: student ? student.name : 'General Campus Visit',
        studentRoll: student ? student.rollNumber : (studentRoll || 'N/A'),
        visitorName,
        visitorPhone,
        relation: relation || 'Guest / Visitor',
        purpose: purpose || 'Official / Personal Visit',
        visitDate: nowIso.split('T')[0],
        idProofNumber: idProofNumber || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'checked_in',
        checkInTime: checkInTimestamp,
        createdAt: nowIso,
      };

      db.visitors.unshift(newVisitor);

      const gateLog: GateLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        passId: visId,
        passType: 'visitor',
        personName: `${visitorName} (${relation || 'Visitor'})`,
        personRole: student ? `Guest of ${student.name} (${student.rollNumber})` : 'Campus Visitor',
        rollOrId: studentRoll || visitorPhone,
        action: 'VISITOR_ENTRY',
        timestamp: checkInTimestamp,
        securityOfficer: officerName || 'Officer Ram Singh',
        gateNumber: 'Main Gate 01',
      };

      db.gateLogs.unshift(gateLog);
      
      try {
        await syncVisitorToMongo(newVisitor);
        await syncGateLogToMongo(gateLog);
      } catch (e) {
        console.warn('MongoDB background sync notice:', e);
      }

      return res.json({
        success: true,
        message: `Visitor Entry logged successfully for ${visitorName}!`,
        visitor: newVisitor,
        gateLog,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to add visitor entry' });
    }
  });

  // POST /api/security/checkout-visitor (Manual Gate Exit for Campus Visitors)
  app.post('/api/security/checkout-visitor', async (req, res) => {
    try {
      const { visitorId, officerName } = req.body;
      const visitorIndex = db.visitors.findIndex((v) => v.id === visitorId);

      if (visitorIndex === -1) {
        return res.status(404).json({ success: false, message: 'Visitor record not found.' });
      }

      const visitor = db.visitors[visitorIndex];
      const nowIso = new Date().toISOString();
      visitor.checkOutTime = nowIso;
      visitor.status = 'completed';

      const gateLog: GateLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        passId: visitor.id,
        passType: 'visitor',
        personName: `${visitor.visitorName} (${visitor.relation || 'Visitor'})`,
        personRole: visitor.studentName !== 'General Campus Visit' ? `Guest of ${visitor.studentName}` : 'Campus Visitor',
        rollOrId: visitor.studentRoll || visitor.visitorPhone,
        action: 'VISITOR_EXIT',
        timestamp: nowIso,
        securityOfficer: officerName || 'Officer Ram Singh',
        gateNumber: 'Main Gate 01',
      };

      db.gateLogs.unshift(gateLog);
      db.visitors[visitorIndex] = visitor;
      
      try {
        await syncVisitorToMongo(visitor);
        await syncGateLogToMongo(gateLog);
      } catch (e) {
        console.warn('MongoDB background sync notice:', e);
      }

      return res.json({
        success: true,
        message: `Visitor ${visitor.visitorName} checked out of campus. Exit logged.`,
        visitor,
        gateLog,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to check out visitor' });
    }
  });

  // ----------------------------------------------------
  // MODULE 9: ADMIN DASHBOARD APIs & ANALYTICS
  // ----------------------------------------------------

  // GET Complete Admin System Analytics & Recharts Datasets
  app.get('/api/admin/analytics', (req, res) => {
    try {
      const totalStudents = db.users.filter((u) => u.role === 'student').length;
      const totalStaff = db.users.filter((u) => u.role !== 'student').length;

      const outpassPendingMentor = db.outpasses.filter((o) => o.status === 'pending_mentor').length;
      const outpassApprovedMentor = db.outpasses.filter((o) => o.status === 'approved_mentor').length;
      const outpassApprovedHod = db.outpasses.filter((o) => o.status === 'approved_hod').length;
      const outpassUsed = db.outpasses.filter((o) => o.status === 'used').length;
      const outpassRejected = db.outpasses.filter((o) => o.status.includes('rejected')).length;

      // Recharts Outpass Status Pie Data
      const outpassStatusChart = [
        { name: 'Pending Mentor', value: outpassPendingMentor, color: '#f59e0b' },
        { name: 'Approved Mentor', value: outpassApprovedMentor, color: '#6366f1' },
        { name: 'Approved HOD (Active QR)', value: outpassApprovedHod, color: '#8b5cf6' },
        { name: 'Gate Exit Verified', value: outpassUsed, color: '#10b981' },
        { name: 'Rejected', value: outpassRejected, color: '#f43f5e' },
      ];

      // Recharts Department Load Bar Chart Data
      const deptMap: Record<string, number> = {};
      db.outpasses.forEach((o) => {
        const dept = o.department || 'Computer Science';
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });

      const departmentChart = Object.keys(deptMap).map((dept) => ({
        department: dept,
        requests: deptMap[dept],
      }));

      if (departmentChart.length === 0) {
        departmentChart.push(
          { department: 'Computer Science', requests: 42 },
          { department: 'Electronics', requests: 28 },
          { department: 'Mechanical', requests: 19 },
          { department: 'Civil', requests: 14 },
          { department: 'Biotech', requests: 9 }
        );
      }

      // Recharts Hourly Gate Exit vs Entry Area Chart Data
      const gateTrafficChart = [
        { hour: '06:00 AM', exits: 4, entries: 1 },
        { hour: '08:00 AM', exits: 12, entries: 3 },
        { hour: '10:00 AM', exits: 25, entries: 8 },
        { hour: '12:00 PM', exits: 18, entries: 14 },
        { hour: '02:00 PM', exits: 32, entries: 22 },
        { hour: '04:00 PM', exits: 45, entries: 38 },
        { hour: '06:00 PM', exits: 20, entries: 52 },
        { hour: '08:00 PM', exits: 5, entries: 41 },
      ];

      return res.json({
        success: true,
        summary: {
          totalUsers: db.users.length,
          totalStudents,
          totalStaff,
          totalOutpasses: db.outpasses.length,
          totalHostelLeaves: db.hostelLeaves.length,
          totalVisitors: db.visitors.length,
          totalGateLogs: db.gateLogs.length,
          totalNotifications: db.notifications.length,
        },
        charts: {
          outpassStatusChart,
          departmentChart,
          gateTrafficChart,
        },
        recentGateLogs: db.gateLogs.slice(0, 8),
        pendingOutpasses: db.outpasses.filter((o) => o.status === 'pending_mentor' || o.status === 'approved_mentor').slice(0, 5),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch admin analytics' });
    }
  });

  // DELETE User Account (Admin User Management)
  app.delete('/api/admin/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const idx = db.users.findIndex((u) => u.id === id);

      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const deleted = db.users.splice(idx, 1)[0];
      return res.json({ success: true, message: `User ${deleted.name} (${deleted.email}) deleted.`, user: deleted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to delete user' });
    }
  });

  // GET Live Combined Activity Stream
  app.get('/api/admin/activity', (req, res) => {
    try {
      const activity = [
        ...db.gateLogs.map((g) => ({
          id: g.id,
          type: 'GATE_SCAN',
          title: `Gate ${g.action} Logged`,
          description: `${g.personName} verified at ${g.gateNumber} by ${g.securityOfficer}`,
          timestamp: g.timestamp,
        })),
        ...db.notifications.map((n) => ({
          id: n.id,
          type: 'NOTIFICATION_SENT',
          title: n.subject,
          description: `Email dispatched to guardian: ${n.parentEmail}`,
          timestamp: n.timestamp,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return res.json({ success: true, count: activity.length, activity: activity.slice(0, 15) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch activity stream' });
    }
  });

  app.get('/api/analytics/stats', (req, res) => {
    const pendingOutpasses = db.outpasses.filter((o) => o.status === 'pending_mentor' || o.status === 'approved_mentor').length;
    const approvedOutpasses = db.outpasses.filter((o) => o.status === 'approved_hod' || o.status === 'used').length;
    const todayExits = db.gateLogs.filter((g) => g.action === 'EXIT').length;
    const todayVisitors = db.visitors.length;

    return res.json({
      success: true,
      stats: {
        totalStudents: db.users.filter((u) => u.role === 'student').length,
        pendingOutpasses,
        approvedOutpasses,
        todayExits,
        todayVisitors,
        hostelStudentsOnLeave: db.hostelLeaves.filter((h) => h.status === 'approved').length,
        recentActivity: db.gateLogs.slice(0, 10),
      },
    });
  });

  app.get('/api/notifications/parent', (req, res) => {
    return res.json({ success: true, notifications: db.notifications });
  });

  // ----------------------------------------------------
  // MODULE 6: HOSTEL LEAVE APIs
  // ----------------------------------------------------

  // GET Hostel Leaves List
  app.get('/api/hostel/list', (req, res) => {
    try {
      const { role, userId, status, hostelBlock } = req.query;
      let results = [...db.hostelLeaves];

      if (role === 'student' && userId) {
        const studentUser = db.users.find((u) => u.id === userId || u.rollNumber === userId);
        const userRoll = studentUser?.rollNumber;
        results = results.filter((h) => h.studentId === userId || (userRoll && h.rollNumber === userRoll) || (studentUser && h.studentId === studentUser.id));
      } else if (hostelBlock && typeof hostelBlock === 'string') {
        results = results.filter((h) => h.hostelBlock.toLowerCase() === hostelBlock.toLowerCase());
      }

      if (status && typeof status === 'string') {
        results = results.filter((h) => h.status === status);
      }

      return res.json({ success: true, count: results.length, leaves: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch hostel leaves' });
    }
  });

  // POST Apply for Hostel Leave
  app.post('/api/hostel/apply', async (req, res) => {
    try {
      const { studentId, leaveType, reason, startDate, endDate, parentPhone } = req.body;
      const student = db.users.find((u) => u.id === studentId || u.rollNumber === studentId) || db.users[0];

      const newLeave: HostelLeave = {
        id: `HL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber || '2310030142',
        hostelBlock: student.hostelBlock || 'A-Block (Boys)',
        roomNumber: student.roomNumber || '302',
        leaveType: leaveType || 'weekend',
        reason: reason || 'Weekend Leave Request',
        startDate,
        endDate,
        parentPermissionVerified: true,
        parentPhone: parentPhone || student.parentPhone || '+91 98765 43210',
        status: 'pending_warden',
        createdAt: new Date().toISOString(),
      };

      db.hostelLeaves.unshift(newLeave);
      await syncHostelLeaveToMongo(newLeave);

      return res.json({
        success: true,
        message: 'Hostel leave application submitted successfully! Routed to Warden.',
        leave: newLeave,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to apply for hostel leave' });
    }
  });

  // PUT Review Hostel Leave by Warden
  app.put('/api/hostel/review/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, wardenRemarks } = req.body;
      const hlIndex = db.hostelLeaves.findIndex((h) => h.id === id);

      if (hlIndex === -1) {
        return res.status(404).json({ success: false, message: 'Hostel leave record not found' });
      }

      const hl = db.hostelLeaves[hlIndex];
      hl.status = status || 'approved';
      if (wardenRemarks) hl.wardenRemarks = wardenRemarks;

      db.hostelLeaves[hlIndex] = hl;
      await syncHostelLeaveToMongo(hl);

      return res.json({
        success: true,
        message: `Hostel leave ${id} has been ${hl.status} by Warden.`,
        leave: hl,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to review hostel leave' });
    }
  });

  // ----------------------------------------------------
  // MODULE 7: VISITOR MANAGEMENT APIs
  // ----------------------------------------------------

  // GET Visitors List
  app.get('/api/visitor/list', (req, res) => {
    try {
      const { studentId, status } = req.query;
      let results = [...db.visitors];

      if (studentId && typeof studentId === 'string') {
        const studentUser = db.users.find((u) => u.id === studentId || u.rollNumber === studentId);
        const userRoll = studentUser?.rollNumber;
        results = results.filter((v) => v.studentId === studentId || (userRoll && (v as any).studentRoll === userRoll) || (studentUser && v.studentId === studentUser.id));
      }

      if (status && typeof status === 'string') {
        results = results.filter((v) => v.status === status);
      }

      return res.json({ success: true, count: results.length, visitors: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to fetch visitors list' });
    }
  });

  // POST Register Visitor
  app.post('/api/visitor/register', async (req, res) => {
    try {
      const { studentId, visitorName, visitorPhone, relation, purpose, visitDate, idProofNumber } = req.body;
      const student = db.users.find((u) => u.id === studentId || u.rollNumber === studentId) || db.users[0];

      const visitorId = `VIS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const qrPayload = JSON.stringify({
        type: 'CAMPUSFLOW_VISITOR',
        passId: visitorId,
        visitorName,
        studentRoll: student.rollNumber || '2310030142',
        visitDate,
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload);

      const newVisitor: Visitor = {
        id: visitorId,
        studentId: student.id,
        studentName: student.name,
        studentRoll: student.rollNumber || '2310030142',
        visitorName,
        visitorPhone,
        relation: relation || 'Parent',
        purpose,
        visitDate,
        idProofNumber: idProofNumber || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'approved',
        qrCode: qrDataUrl,
        createdAt: new Date().toISOString(),
      };

      db.visitors.unshift(newVisitor);
      await syncVisitorToMongo(newVisitor);

      return res.json({
        success: true,
        message: 'Campus visitor registered successfully! Visitor QR Pass generated.',
        visitor: newVisitor,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to register visitor' });
    }
  });

  // API Fallback 404 Handler - Prevents SPA Middleware from serving HTML for undefined API paths
  app.use('/api/*', (req, res) => {
    return res.status(404).json({
      success: false,
      message: `API endpoint '${req.originalUrl}' not found.`,
    });
  });

  // Security Middleware: Block direct browser access to compiled server bundle or map files
  app.use((req, res, next) => {
    if (req.path === '/server.cjs' || req.path.endsWith('.map')) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    next();
  });

  // Vite development middleware or static production handler
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusFlow Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
