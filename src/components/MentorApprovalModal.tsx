import React, { useState } from 'react';
import { Outpass } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Phone, Mail, UserCheck, MessageSquare, AlertCircle } from 'lucide-react';

interface MentorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  outpass: Outpass & {
    studentDetails?: {
      name: string;
      rollNumber: string;
      department: string;
      year: string;
      section: string;
      hostelBlock: string;
      roomNumber: string;
      parentName: string;
      parentEmail: string;
      parentPhone: string;
      avatarUrl?: string;
    };
  };
  initialAction?: 'approve' | 'reject';
  onActionCompleted: () => void;
}

export const MentorApprovalModal: React.FC<MentorApprovalModalProps> = ({
  isOpen,
  onClose,
  outpass,
  initialAction = 'approve',
  onActionCompleted,
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>(initialAction);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !outpass) return null;

  const student = outpass.studentDetails || {
    name: outpass.studentName,
    rollNumber: outpass.rollNumber,
    department: outpass.department,
    year: outpass.year,
    section: outpass.section,
    hostelBlock: 'A-Block (Boys)',
    roomNumber: 'A-101',
    parentName: 'Parent / Guardian',
    parentEmail: 'parent@example.com',
    parentPhone: '+91 98765 43210',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = action === 'approve' ? `/api/mentor/approve/${outpass.id}` : `/api/mentor/reject/${outpass.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks: remarks || (action === 'approve' ? 'Approved by Section Mentor after verification.' : 'Rejected by Section Mentor.'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        onActionCompleted();
        onClose();
      } else {
        setErrorMessage(data.message || 'Failed to complete review action');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error during processing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mentor Decision Review</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {outpass.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review outpass request details and submit mentor authorization decision
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              {errorMessage}
            </div>
          )}

          {/* Student & Guardian Info Card */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</h4>
                <p className="text-xs text-slate-500">{student.rollNumber} &bull; {student.department} ({student.section})</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {student.hostelBlock} - {student.roomNumber}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Guardian: <strong className="text-slate-800 dark:text-slate-200">{student.parentName}</strong></span>
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${student.parentPhone}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:underline"
                >
                  <Phone className="w-3 h-3 text-emerald-500" /> {student.parentPhone}
                </a>
                <a
                  href={`mailto:${student.parentEmail}`}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold hover:underline"
                >
                  <Mail className="w-3 h-3 text-indigo-500" /> Email
                </a>
              </div>
            </div>
          </div>

          {/* Outpass Reason & Destination */}
          <div className="mt-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1">
            <p className="text-slate-500 dark:text-slate-400">
              Destination: <strong className="text-slate-800 dark:text-slate-200">{outpass.destination}</strong>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Reason: <strong className="text-slate-800 dark:text-slate-200">{outpass.reason}</strong>
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Timing: <span className="font-semibold">{outpass.outDate} {outpass.outTime} &rarr; {outpass.inDate} {outpass.inTime}</span>
            </p>
          </div>

          {/* Form Decision */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Review Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction('approve')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    action === 'approve'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Request
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    action === 'reject'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Mentor Review Remarks / Notes
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    action === 'approve'
                      ? 'e.g. Approved after phone confirmation with parent.'
                      : 'e.g. Rejected due to attendance shortfall or incomplete details.'
                  }
                  rows={3}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                  action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
                }`}
              >
                {isSubmitting ? 'Submitting...' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
