import bcrypt from 'bcryptjs';
import { User, Outpass, HostelLeave, Visitor, GateLog, ParentNotification } from '../types.js';
import { studentUsers } from './studentsData.js';

// Pre-seeded Staff Users for Demo/Viva Presentation
export const staffUsers: User[] = [
  {
    id: 'usr_mentor_1',
    name: 'Dr. Vikram Reddy',
    email: 'vikram.mentor@campusflow.edu',
    role: 'mentor',
    passwordHash: bcrypt.hashSync('mentor123', 10),
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_hod_1',
    name: 'Prof. K. S. Murthy',
    email: 'hod.cse@campusflow.edu',
    role: 'hod',
    passwordHash: bcrypt.hashSync('hod123', 10),
    department: 'Computer Science',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_warden_1',
    name: 'Suresh Kumar',
    email: 'warden.boys@campusflow.edu',
    role: 'warden',
    passwordHash: bcrypt.hashSync('warden123', 10),
    hostelBlock: 'A-Block (Boys)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_security_1',
    name: 'Officer Ram Singh',
    email: 'security.gate1@campusflow.edu',
    role: 'security',
    passwordHash: bcrypt.hashSync('security123', 10),
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_admin_1',
    name: 'Admin Controller',
    email: 'admin@campusflow.edu',
    role: 'admin',
    passwordHash: bcrypt.hashSync('admin123', 10),
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
];

// Combine staff users and parsed 696 student users
export const initialUsers: User[] = [
  ...staffUsers,
  ...studentUsers,
];

export const initialOutpasses: Outpass[] = [];

export const initialHostelLeaves: HostelLeave[] = [];

export const initialVisitors: Visitor[] = [];

export const initialGateLogs: GateLog[] = [];

export const initialNotifications: ParentNotification[] = [];

// In-Memory Database Controller State
class CampusDB {
  users: User[] = [...initialUsers];
  outpasses: Outpass[] = [...initialOutpasses];
  hostelLeaves: HostelLeave[] = [...initialHostelLeaves];
  visitors: Visitor[] = [...initialVisitors];
  gateLogs: GateLog[] = [...initialGateLogs];
  notifications: ParentNotification[] = [...initialNotifications];

  // Reset database state to seeds if requested
  reset() {
    this.users = [...initialUsers];
    this.outpasses = [...initialOutpasses];
    this.hostelLeaves = [...initialHostelLeaves];
    this.visitors = [...initialVisitors];
    this.gateLogs = [...initialGateLogs];
    this.notifications = [...initialNotifications];
  }
}

export const db = new CampusDB();

