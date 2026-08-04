import React from 'react';
import { User } from '../types';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Phone,
  Mail,
  Home,
  GraduationCap,
  QrCode,
  Edit3,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';

interface StudentProfileCardProps {
  user: User;
  mentorName?: string;
  mentorEmail?: string;
  hasApprovedOutpass?: boolean;
  onEditProfile: () => void;
  onViewQR: () => void;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({
  user,
  mentorName = 'Dr. Vikram Reddy',
  mentorEmail = 'vikram.mentor@campusflow.edu',
  hasApprovedOutpass = false,
  onEditProfile,
  onViewQR,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl p-6"
    >
      {/* Decorative gradient blur background */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" title="Active Student" />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {user.rollNumber || '2310030001'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              {user.department || 'Computer Science'} &bull; {user.year || '3rd Year'} ({user.section || 'A'})
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-stretch sm:justify-end">
          <button
            onClick={onEditProfile}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Edit3 className="w-4 h-4 text-indigo-500" />
            Edit Profile
          </button>
          
          {hasApprovedOutpass && (
            <button
              onClick={onViewQR}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              Active QR Outpass
            </button>
          )}
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
        {/* Hostel Information */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            HOSTEL RESIDENCE
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {user.hostelBlock || 'A-Block (Boys)'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Room No: <span className="font-semibold text-slate-700 dark:text-slate-300">{user.roomNumber || 'A-101'}</span>
          </p>
        </div>

        {/* Assigned Mentor Info */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <UserCheck className="w-4 h-4 text-indigo-500" />
            FACULTY MENTOR
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{mentorName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{mentorEmail}</p>
        </div>

        {/* Guardian Contact Info */}
        <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            GUARDIAN CONTACT
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.parentName || 'Parent / Guardian'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <Phone className="w-3 h-3 text-slate-400" /> {user.parentPhone || '+91 98765 43210'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
