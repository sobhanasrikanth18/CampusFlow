/**
 * @file User.ts
 * @description Mongoose Schema definition for CampusFlow Users (Students, Mentors, HODs, Wardens, Security, Admin)
 * Perfect for B.Tech Capstone Project Viva Presentation
 */

/* 
  Sample Mongoose Schema (for MongoDB Atlas integration):

  import mongoose, { Schema, Document } from 'mongoose';

  export interface IUser extends Document {
    name: string;
    email: string;
    role: 'student' | 'mentor' | 'hod' | 'warden' | 'security' | 'admin';
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
    createdAt: Date;
    updatedAt: Date;
  }

  const UserSchema: Schema = new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      role: { 
        type: String, 
        required: true, 
        enum: ['student', 'mentor', 'hod', 'warden', 'security', 'admin'] 
      },
      rollNumber: { type: String },
      department: { type: String },
      year: { type: String },
      section: { type: String },
      hostelBlock: { type: String },
      roomNumber: { type: String },
      mentorId: { type: Schema.Types.ObjectId, ref: 'User' },
      parentName: { type: String },
      parentEmail: { type: String },
      parentPhone: { type: String },
      avatarUrl: { type: String },
    },
    { timestamps: true }
  );

  export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
*/

export const userRolePermissions = {
  student: ['apply_outpass', 'apply_hostel_leave', 'register_visitor', 'view_own_passes'],
  mentor: ['review_section_outpasses', 'approve_mentor_outpass', 'reject_mentor_outpass'],
  hod: ['review_department_outpasses', 'final_approve_outpass', 'view_dept_analytics'],
  warden: ['review_hostel_leaves', 'approve_hostel_leave', 'view_occupancy'],
  security: ['scan_qr_gate', 'manual_pass_verify', 'record_gate_entry_exit', 'view_gate_logs'],
  admin: ['manage_users', 'manage_departments', 'manage_hostels', 'view_system_audit_logs'],
};
