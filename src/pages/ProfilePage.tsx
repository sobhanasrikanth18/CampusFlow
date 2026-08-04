import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Building2, Home, ShieldCheck, GraduationCap } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={user?.avatarUrl}
            alt={user?.name}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-blue-500/30 shadow-xl"
          />

          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
                {user?.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>

            {user?.rollNumber && (
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Roll Number: <span className="font-mono text-blue-500">{user.rollNumber}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic / Role Information */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" /> Academic Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user?.department || 'Computer Science'}</span>
            </div>
            {user?.year && (
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Year / Section:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.year} ({user.section})</span>
              </div>
            )}
            {user?.hostelBlock && (
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Hostel Room:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{user.hostelBlock} - {user.roomNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Parent / Emergency Contact */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Parent & Emergency Contacts
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Parent Name:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user?.parentName || 'Ramesh Sharma'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Parent Email:</span>
              <span className="font-mono text-emerald-500">{user?.parentEmail || 'ramesh.sharma@gmail.com'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Parent Phone:</span>
              <span className="font-mono text-slate-900 dark:text-white">{user?.parentPhone || '+91 98765 43210'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
