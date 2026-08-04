import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle, ShieldCheck, UserCheck, FileText, QrCode } from 'lucide-react';

export interface TimelineStage {
  stage: string;
  completed: boolean;
  status?: 'approved' | 'pending' | 'rejected';
  timestamp?: string;
  remarks?: string;
  details?: string;
}

interface OutpassTimelineProps {
  timeline: TimelineStage[];
}

export const OutpassTimeline: React.FC<OutpassTimelineProps> = ({ timeline }) => {
  return (
    <div className="py-4 space-y-6">
      <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
        {timeline.map((step, idx) => {
          const isApproved = step.status === 'approved' || step.completed;
          const isPending = step.status === 'pending';
          const isRejected = step.status === 'rejected';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="relative"
            >
              {/* Icon Marker */}
              <div
                className={`absolute -left-[35px] top-0 p-1.5 rounded-full border-2 bg-white dark:bg-slate-900 transition-all ${
                  isRejected
                    ? 'border-rose-500 text-rose-500 shadow-md shadow-rose-500/20'
                    : isApproved
                    ? 'border-emerald-500 text-emerald-500 shadow-md shadow-emerald-500/20'
                    : 'border-amber-500 text-amber-500 shadow-md shadow-amber-500/20'
                }`}
              >
                {isRejected ? (
                  <XCircle className="w-4 h-4" />
                ) : isApproved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4 animate-pulse" />
                )}
              </div>

              {/* Stage Title & Details */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {step.stage}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      isRejected
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : isApproved
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isRejected ? 'Rejected' : isApproved ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {step.remarks && (
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                    &ldquo;{step.remarks}&rdquo;
                  </p>
                )}

                {step.details && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {step.details}
                  </p>
                )}

                {step.timestamp && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
