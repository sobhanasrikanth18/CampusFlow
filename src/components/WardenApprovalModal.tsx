import React, { useState } from 'react';
import { HostelLeave } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Home, QrCode, Download, Phone, MessageSquare, AlertCircle } from 'lucide-react';

interface WardenApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: HostelLeave & {
    studentDetails?: {
      name: string;
      rollNumber: string;
      department: string;
      year: string;
      section: string;
      hostelBlock: string;
      roomNumber: string;
      parentName: string;
      parentPhone: string;
    };
  };
  onActionCompleted: () => void;
}

export const WardenApprovalModal: React.FC<WardenApprovalModalProps> = ({
  isOpen,
  onClose,
  leave,
  onActionCompleted,
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(leave?.qrCode || null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !leave) return null;

  const student = leave.studentDetails || {
    name: leave.studentName,
    rollNumber: leave.rollNumber,
    department: 'Computer Science',
    year: '3rd Year',
    section: 'A',
    hostelBlock: leave.hostelBlock || 'A-Block (Boys)',
    roomNumber: leave.roomNumber || 'A-101',
    parentName: 'Parent / Guardian',
    parentPhone: leave.parentPhone || '+91 98765 43210',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = action === 'approve' ? `/api/hostel/approve/${leave.id}` : `/api/hostel/reject/${leave.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks: remarks || (action === 'approve' ? 'Approved by Hostel Warden after guardian verification.' : 'Rejected by Warden.'),
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (action === 'approve' && data.qrCode) {
          setGeneratedQR(data.qrCode);
          setIsSuccess(true);
        } else {
          onActionCompleted();
          onClose();
        }
      } else {
        setErrorMessage(data.message || 'Failed to complete warden review');
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hostel Warden Authorization</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {leave.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Grant hostel leave sign-off, verify guardian contact, and issue QR pass
              </p>
            </div>
            <button
              onClick={() => {
                if (isSuccess) onActionCompleted();
                onClose();
              }}
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

          {/* Success Animated Screen */}
          {isSuccess && generatedQR ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Hostel Leave Approved & QR Generated!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hostel leave pass QR code has been generated, signed by Warden, and saved to MongoDB Atlas.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto">
                <img src={generatedQR} alt="Hostel Leave QR Pass" className="w-44 h-44 mx-auto bg-white p-2 rounded-xl shadow-md" />
                <p className="text-[11px] font-mono text-slate-500 mt-2 font-bold">{leave.id} &bull; {student.rollNumber}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={generatedQR}
                  download={`HostelLeave-QR-${leave.id}.png`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Leave QR Pass
                </a>
                <button
                  onClick={() => {
                    onActionCompleted();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Request Metadata Card */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
                  <span className="px-2 py-0.5 rounded-md font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Room {student.roomNumber} ({student.hostelBlock})
                  </span>
                </div>
                <p className="text-slate-500">
                  Leave Type: <strong className="text-emerald-700 dark:text-emerald-300 uppercase">{leave.leaveType} LEAVE</strong>
                </p>
                <p className="text-slate-500">
                  Reason: <strong className="text-slate-800 dark:text-slate-200">{leave.reason}</strong>
                </p>
                <p className="text-slate-500">
                  Leave Dates: <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.startDate} &rarr; {leave.endDate}</span>
                </p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-500">Guardian Contact:</span>
                  <a href={`tel:${student.parentPhone}`} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {student.parentPhone}
                  </a>
                </div>
              </div>

              {/* Form Decision */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Warden Review Decision
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
                      Approve & Issue Pass
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
                      Reject Application
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Warden Review Remarks / Notes
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={
                        action === 'approve'
                          ? 'e.g. Approved after phone confirmation with parent.'
                          : 'e.g. Rejected due to upcoming internal exam dates.'
                      }
                      rows={3}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                    {isSubmitting ? 'Processing...' : action === 'approve' ? 'Confirm Approval & Generate QR' : 'Confirm Warden Rejection'}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
