import React, { useEffect, useState } from 'react';
import { Outpass } from '../types';
import { OutpassTimeline, TimelineStage } from './OutpassTimeline';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Trash2, Calendar, Clock, MapPin, AlertCircle, FileText, Download } from 'lucide-react';

interface OutpassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  outpassId: string;
  onCanceled?: () => void;
}

export const OutpassDetailModal: React.FC<OutpassDetailModalProps> = ({
  isOpen,
  onClose,
  outpassId,
  onCanceled,
}) => {
  const [outpass, setOutpass] = useState<Outpass | null>(null);
  const [timeline, setTimeline] = useState<TimelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    if (!isOpen || !outpassId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/outpass/detail/${outpassId}`);
        const data = await res.json();
        if (data.success) {
          setOutpass(data.outpass);
          setTimeline(data.timeline || []);
        }
      } catch (err) {
        console.error('Error fetching outpass detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, outpassId]);

  if (!isOpen) return null;

  const handleCancelRequest = async () => {
    if (!outpassId) return;
    setIsCanceling(true);
    try {
      const res = await fetch(`/api/outpass/cancel/${outpassId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setCancelMessage('Outpass request canceled successfully.');
        setTimeout(() => {
          if (onCanceled) onCanceled();
          onClose();
        }, 1000);
      } else {
        setCancelMessage(data.message || 'Failed to cancel outpass');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Outpass Details</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {outpassId}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-tier approval workflow & security verification status
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cancelMessage && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              {cancelMessage}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading outpass details...</div>
          ) : outpass ? (
            <div className="mt-4 space-y-6">
              {/* Request Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Student Details
                  </span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{outpass.studentName}</p>
                  <p className="text-xs text-slate-500">{outpass.rollNumber} &bull; {outpass.department}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Destination & Reason
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {outpass.destination}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{outpass.reason}</p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Out Date & Time
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {outpass.outDate} at {outpass.outTime}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Expected Return Date & Time
                  </span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {outpass.inDate} at {outpass.inTime}
                  </p>
                </div>
              </div>

              {/* Approval Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Approval Timeline & Remarks
                </h4>
                <OutpassTimeline timeline={timeline} />
              </div>

              {/* QR Pass if Approved */}
              {(outpass.status === 'approved_hod' || outpass.status === 'used') && outpass.qrCode && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row items-center gap-4">
                  <img src={outpass.qrCode} alt="Outpass QR Code" className="w-24 h-24 bg-white p-2 rounded-xl shadow-md" />
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Verified Gate Pass QR Code</h4>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                      Present this QR code to campus security at Main Gate 01 for exit and re-entry verification.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                {outpass.status !== 'used' && (
                  <button
                    onClick={handleCancelRequest}
                    disabled={isCanceling}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isCanceling ? 'Canceling...' : 'Cancel Outpass Request'}
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="ml-auto px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
