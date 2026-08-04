import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, CheckCircle2, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { ParentNotification } from '../types';

interface ParentEmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentEmailDrawer: React.FC<ParentEmailDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/parent');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-y-0 right-0 max-w-full flex pl-10"
          >
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Parent Email Logs
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Automated gate alert dispatch monitor
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={fetchNotifications}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      No automated parent emails sent yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Scan a valid QR Code at Security Gate to trigger automated parent email dispatch!
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {notif.type}
                        </span>
                        <div className="flex items-center text-xs text-slate-400 space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mt-2.5">
                        {notif.subject}
                      </h4>

                      <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 font-mono leading-relaxed">
                        {notif.body}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
                        <span>To: <strong className="text-slate-700 dark:text-slate-300">{notif.parentEmail}</strong></span>
                        <span className="text-emerald-500 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
