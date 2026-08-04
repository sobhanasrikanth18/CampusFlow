import React, { useState } from 'react';
import { Outpass } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, QrCode, Download, ShieldCheck, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface HODApprovalModalProps {
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
      parentPhone: string;
    };
  };
  onActionCompleted: () => void;
}

export const HODApprovalModal: React.FC<HODApprovalModalProps> = ({
  isOpen,
  onClose,
  outpass,
  onActionCompleted,
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(outpass?.qrCode || null);
  const [isSuccess, setIsSuccess] = useState(false);
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const endpoint = action === 'approve' ? `/api/hod/approve/${outpass.id}` : `/api/hod/reject/${outpass.id}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remarks: remarks || (action === 'approve' ? 'Final Approval Granted by Head of Department' : 'Rejected by HOD.'),
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
        setErrorMessage(data.message || 'Failed to complete HOD sign-off');
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">HOD Final Authorization</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {outpass.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Grant final approval to generate & store gate exit QR pass in MongoDB
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
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Outpass Approved & QR Generated!</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Official Gate Pass QR code has been generated, signed, and stored in MongoDB Atlas for student exit.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-xs mx-auto">
                <img src={generatedQR} alt="Generated QR Pass" className="w-44 h-44 mx-auto bg-white p-2 rounded-xl shadow-md" />
                <p className="text-[11px] font-mono text-slate-500 mt-2 font-bold">{outpass.id} &bull; {student.rollNumber}</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={generatedQR}
                  download={`Outpass-QR-${outpass.id}.png`}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Official QR Pass
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
                  <span className="px-2 py-0.5 rounded-md font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    {student.rollNumber}
                  </span>
                </div>
                <p className="text-slate-500">
                  Mentor Remarks: <strong className="text-emerald-600 dark:text-emerald-400">&ldquo;{outpass.mentorRemarks || 'Approved by Mentor'}&rdquo;</strong>
                </p>
                <p className="text-slate-500">
                  Destination: <strong className="text-slate-800 dark:text-slate-200">{outpass.destination}</strong>
                </p>
                <p className="text-slate-500">
                  Out/Return: <span className="font-semibold text-slate-700 dark:text-slate-300">{outpass.outDate} {outpass.outTime} &rarr; {outpass.inDate} {outpass.inTime}</span>
                </p>
              </div>

              {/* Form Decision */}
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    HOD Final Decision
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAction('approve')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        action === 'approve'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Approve & Issue QR
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
                    HOD Remarks / Sign-Off Notes
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={
                        action === 'approve'
                          ? 'e.g. Final Approval Granted by Head of Department.'
                          : 'e.g. Rejected due to scheduling conflict.'
                      }
                      rows={3}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                      action === 'approve' ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/25'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : action === 'approve' ? 'Authorize & Generate QR' : 'Confirm HOD Rejection'}
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
