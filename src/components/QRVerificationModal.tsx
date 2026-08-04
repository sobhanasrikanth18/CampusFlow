import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ShieldCheck, ShieldAlert, User, Phone, MapPin, Clock, X, ArrowRight } from 'lucide-react';

interface QRVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    valid: boolean;
    action?: 'EXIT' | 'ENTRY';
    message: string;
    studentDetails?: {
      name: string;
      rollNumber: string;
      department: string;
      year: string;
      section: string;
      hostelBlock: string;
      roomNumber: string;
      parentPhone: string;
      destination: string;
    };
    outpassId?: string;
  } | null;
}

export const QRVerificationModal: React.FC<QRVerificationModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen || !result) return null;

  const isValid = result.valid;
  const student = result.studentDetails;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden p-6 ${
            isValid
              ? 'bg-gradient-to-b from-emerald-950/90 to-slate-900 border-emerald-500/50 text-white'
              : 'bg-gradient-to-b from-rose-950/90 to-slate-900 border-rose-500/50 text-white'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              {isValid ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              )}
              <h3 className="text-xl font-bold tracking-tight">
                {isValid ? `GATE ${result.action} VERIFIED` : 'PASS VERIFICATION FAILED'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="py-6 text-center space-y-4">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-2xl ${
                isValid
                  ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 ring-4 ring-rose-500/40'
              }`}
            >
              {isValid ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <XCircle className="w-12 h-12" />
              )}
            </div>

            <p className="text-sm font-medium leading-relaxed max-w-md mx-auto text-slate-200">
              {result.message}
            </p>

            {/* Student Details Card if Valid */}
            {isValid && student && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-left space-y-3"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div>
                    <h4 className="text-base font-bold text-white">{student.name}</h4>
                    <p className="text-xs text-emerald-300 font-mono">{student.rollNumber} &bull; {student.department}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    {student.hostelBlock} - {student.roomNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-400" /> {student.destination}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Guardian Contact</span>
                    <a
                      href={`tel:${student.parentPhone}`}
                      className="font-semibold text-emerald-300 flex items-center gap-1 mt-0.5 hover:underline"
                    >
                      <Phone className="w-3 h-3" /> {student.parentPhone}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                isValid
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30'
              }`}
            >
              {isValid ? 'Confirm & Close' : 'Dismiss Alert'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
