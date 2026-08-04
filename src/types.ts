// CampusFlow Shared TypeScript Interfaces & Types

export type UserRole = 'student' | 'mentor' | 'hod' | 'warden' | 'security' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  rollNumber?: string;
  department?: string;
  year?: string;
  section?: string;
  hostelBlock?: string;
  roomNumber?: string;
  mentorId?: string;
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
  avatarUrl?: string;
}

export type OutpassStatus = 'pending_mentor' | 'approved_mentor' | 'rejected_mentor' | 'approved_hod' | 'rejected_hod' | 'used' | 'expired';

export interface Outpass {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: string;
  section: string;
  reason: string;
  outDate: string;
  outTime: string;
  inDate: string;
  inTime: string;
  destination: string;
  status: OutpassStatus;
  mentorRemarks?: string;
  hodRemarks?: string;
  qrCode?: string;
  exitTime?: string;
  entryTime?: string;
  createdAt: string;
  parentNotificationSent: boolean;
}

export type HostelLeaveStatus = 'pending_warden' | 'approved' | 'rejected' | 'checked_out' | 'returned' | 'used';

export interface HostelLeave {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  hostelBlock: string;
  roomNumber: string;
  leaveType: 'weekend' | 'emergency' | 'vacation' | 'medical';
  reason: string;
  startDate: string;
  endDate: string;
  parentPermissionVerified: boolean;
  parentPhone: string;
  status: HostelLeaveStatus;
  wardenRemarks?: string;
  qrCode?: string;
  createdAt: string;
}

export type VisitorStatus = 'registered' | 'approved' | 'pending' | 'checked_in' | 'checked_out' | 'completed';

export interface Visitor {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  visitorName: string;
  visitorPhone: string;
  relation: string;
  purpose: string;
  visitDate: string;
  idProofNumber: string;
  status: VisitorStatus;
  qrCode?: string;
  checkInTime?: string;
  checkOutTime?: string;
  createdAt: string;
}

export interface GateLog {
  id: string;
  passId: string;
  passType: 'outpass' | 'hostel_leave' | 'visitor';
  personName: string;
  personRole: string;
  rollOrId: string;
  action: 'EXIT' | 'ENTRY' | 'VISITOR_ENTRY' | 'VISITOR_EXIT';
  timestamp: string;
  securityOfficer: string;
  gateNumber: string;
}

export interface ParentNotification {
  id: string;
  studentName: string;
  rollNumber: string;
  parentEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  type: 'OUTPASS_EXIT' | 'OUTPASS_ENTRY' | 'HOSTEL_LEAVE';
}

export interface SystemStats {
  totalStudents: number;
  pendingOutpasses: number;
  approvedOutpasses: number;
  todayExits: number;
  todayVisitors: number;
  hostelStudentsOnLeave: number;
  recentActivity: GateLog[];
}
