import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun,
  Moon,
  Mail,
  Database,
} from 'lucide-react';
import { ParentEmailDrawer } from './ParentEmailDrawer';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isEmailDrawerOpen, setIsEmailDrawerOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ mongoConnected: boolean; mode: string }>({
    mongoConnected: false,
    mode: 'Checking DB status...',
  });

  useEffect(() => {
    fetch('/api/system/db-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDbStatus({
            mongoConnected: data.mongoConnected,
            mode: data.mode,
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              CF
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  Campus<span className="text-blue-600 dark:text-blue-400">Flow</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-full uppercase tracking-wider">
                  Smart Campus
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                <Database className={`w-3 h-3 ${dbStatus.mongoConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>{dbStatus.mongoConnected ? 'MongoDB Atlas Online' : 'In-Memory DB Active'}</span>
              </div>
            </div>
          </div>

          {/* Active Workspace Badge (Strict Role Access) */}
          {user && (
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize font-sans">
                {user.role === 'student' && 'Student Portal'}
                {user.role === 'mentor' && 'Faculty Mentor Portal'}
                {user.role === 'hod' && 'HOD Portal'}
                {user.role === 'warden' && 'Hostel Warden Portal'}
                {user.role === 'security' && 'Security Gate Officer'}
                {user.role === 'admin' && 'System Admin Portal'}
                {!['student', 'mentor', 'hod', 'warden', 'security', 'admin'].includes(user.role) && `${user.role} Portal`}
              </span>
            </div>
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Parent Email Log Drawer Trigger */}
            <button
              onClick={() => setIsEmailDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              title="Parent Email Dispatch Logs"
            >
              <Mail className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Profile Avatar */}
            {user && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono">
                    {user.role}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ParentEmailDrawer isOpen={isEmailDrawerOpen} onClose={() => setIsEmailDrawerOpen(false)} />
    </>
  );
};
