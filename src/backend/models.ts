import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, OutpassStatus, HostelLeaveStatus, VisitorStatus } from '../types.js';

// User Schema
export interface IUserDoc extends Document {
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

const UserSchema = new Schema<IUserDoc>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  passwordHash: String,
  rollNumber: String,
  department: String,
  year: String,
  section: String,
  hostelBlock: String,
  roomNumber: String,
  mentorId: String,
  parentName: String,
  parentEmail: String,
  parentPhone: String,
  avatarUrl: String,
}, { timestamps: true });

// Outpass Schema
export interface IOutpassDoc extends Document {
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
  createdAt: string;
  exitTime?: string;
  returnTime?: string;
  parentNotificationSent?: boolean;
}

const OutpassSchema = new Schema<IOutpassDoc>({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  department: { type: String, required: true },
  year: { type: String, required: true },
  section: { type: String, required: true },
  reason: { type: String, required: true },
  outDate: { type: String, required: true },
  outTime: { type: String, required: true },
  inDate: { type: String, required: true },
  inTime: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, required: true },
  mentorRemarks: String,
  hodRemarks: String,
  qrCode: String,
  createdAt: { type: String, required: true },
  exitTime: String,
  returnTime: String,
  parentNotificationSent: { type: Boolean, default: false },
}, { timestamps: true });

// Hostel Leave Schema
export interface IHostelLeaveDoc extends Document {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  hostelBlock: string;
  roomNumber: string;
  leaveType: 'weekend' | 'vacation' | 'emergency';
  reason: string;
  startDate: string;
  endDate: string;
  parentPermissionVerified: boolean;
  parentPhone: string;
  status: HostelLeaveStatus;
  wardenRemarks?: string;
  createdAt: string;
}

const HostelLeaveSchema = new Schema<IHostelLeaveDoc>({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  hostelBlock: { type: String, required: true },
  roomNumber: { type: String, required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  parentPermissionVerified: { type: Boolean, default: false },
  parentPhone: { type: String, required: true },
  status: { type: String, required: true },
  wardenRemarks: String,
  createdAt: { type: String, required: true },
}, { timestamps: true });

// Visitor Schema
export interface IVisitorDoc extends Document {
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
  checkInTime?: string;
  checkOutTime?: string;
  qrCode?: string;
  createdAt: string;
}

const VisitorSchema = new Schema<IVisitorDoc>({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentRoll: { type: String, required: true },
  visitorName: { type: String, required: true },
  visitorPhone: { type: String, required: true },
  relation: { type: String, required: true },
  purpose: { type: String, required: true },
  visitDate: { type: String, required: true },
  idProofNumber: { type: String, required: true },
  status: { type: String, required: true },
  checkInTime: String,
  checkOutTime: String,
  qrCode: String,
  createdAt: { type: String, required: true },
}, { timestamps: true });

// Gate Log Schema
export interface IGateLogDoc extends Document {
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

const GateLogSchema = new Schema<IGateLogDoc>({
  id: { type: String, required: true, unique: true },
  passId: { type: String, required: true },
  passType: { type: String, required: true },
  personName: { type: String, required: true },
  personRole: { type: String, required: true },
  rollOrId: { type: String, required: true },
  action: { type: String, required: true },
  timestamp: { type: String, required: true },
  securityOfficer: { type: String, required: true },
  gateNumber: { type: String, required: true },
}, { timestamps: true });

// Parent Notification Schema
export interface IParentNotificationDoc extends Document {
  id: string;
  studentName: string;
  rollNumber: string;
  parentEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  type: string;
}

const ParentNotificationSchema = new Schema<IParentNotificationDoc>({
  id: { type: String, required: true, unique: true },
  studentName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  parentEmail: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  timestamp: { type: String, required: true },
  type: { type: String, required: true },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUserDoc>('User', UserSchema);
export const OutpassModel = mongoose.models.Outpass || mongoose.model<IOutpassDoc>('Outpass', OutpassSchema);
export const HostelLeaveModel = mongoose.models.HostelLeave || mongoose.model<IHostelLeaveDoc>('HostelLeave', HostelLeaveSchema);
export const VisitorModel = mongoose.models.Visitor || mongoose.model<IVisitorDoc>('Visitor', VisitorSchema);
export const GateLogModel = mongoose.models.GateLog || mongoose.model<IGateLogDoc>('GateLog', GateLogSchema);
export const ParentNotificationModel = mongoose.models.ParentNotification || mongoose.model<IParentNotificationDoc>('ParentNotification', ParentNotificationSchema);
