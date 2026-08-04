/**
 * @file Outpass.ts
 * @description Mongoose Schema definition for Student Outpass Workflow
 * Covers digital approval lifecycle: Student -> Mentor Approval -> HOD Approval -> QR Generation -> Gate Scan
 */

/*
  Sample Mongoose Schema:

  import mongoose, { Schema, Document } from 'mongoose';

  export interface IOutpass extends Document {
    studentId: Schema.Types.ObjectId;
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
    status: 'pending_mentor' | 'approved_mentor' | 'rejected_mentor' | 'approved_hod' | 'rejected_hod' | 'used' | 'expired';
    mentorRemarks?: string;
    hodRemarks?: string;
    qrCode?: string;
    exitTime?: Date;
    entryTime?: Date;
    parentNotificationSent: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  const OutpassSchema: Schema = new Schema(
    {
      studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
      status: {
        type: String,
        enum: [
          'pending_mentor',
          'approved_mentor',
          'rejected_mentor',
          'approved_hod',
          'rejected_hod',
          'used',
          'expired'
        ],
        default: 'pending_mentor'
      },
      mentorRemarks: { type: String },
      hodRemarks: { type: String },
      qrCode: { type: String },
      exitTime: { type: Date },
      entryTime: { type: Date },
      parentNotificationSent: { type: Boolean, default: false }
    },
    { timestamps: true }
  );

  export default mongoose.models.Outpass || mongoose.model<IOutpass>('Outpass', OutpassSchema);
*/

export const OUTPASS_STAGES = {
  STEP_1: 'Student Appled',
  STEP_2: 'Mentor Approval Pending',
  STEP_3: 'HOD Approval Pending',
  STEP_4: 'QR Code Generated',
  STEP_5: 'Gate Verification & Exit',
  STEP_6: 'Return Gate Check-in'
};
