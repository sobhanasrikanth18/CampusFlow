import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  Home,
  UserPlus,
  QrCode,
  Users,
  Settings,
  User,
  LogOut,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { label: 'Apply Outpass', path: '/student/outpass', icon: FileCheck2 },
          { label: 'Hostel Leave', path: '/student/hostel', icon: Home },
          { label: 'Register Visitor', path: '/student/visitor', icon: UserPlus },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      case 'mentor':
        return [
          { label: 'Pending Outpasses', path: '/mentor', icon: ClipboardList },
          { label: 'Approved Logs', path: '/mentor/history', icon: FileCheck2 },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      case 'hod':
        return [
          { label: 'HOD Overview', path: '/hod', icon: LayoutDashboard },
          { label: 'Final Approvals', path: '/hod/approvals', icon: FileCheck2 },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      case 'warden':
        return [
          { label: 'Hostel Dashboard', path: '/warden', icon: Home },
          { label: 'Leave Requests', path: '/warden/leaves', icon: ClipboardList },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      case 'security':
        return [
          { label: 'Gate QR Scanner', path: '/security', icon: QrCode },
          { label: 'Gate Activity Logs', path: '/security/logs', icon: ShieldAlert },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      case 'admin':
        return [
          { label: 'System Overview', path: '/admin', icon: LayoutDashboard },
          { label: 'User Directory', path: '/admin/users', icon: Users },
          { label: 'Settings', path: '/admin/settings', icon: Settings },
          { label: 'Profile', path: '/profile', icon: User },
        ];
      default:
        return [{ label: 'Dashboard', path: '/', icon: LayoutDashboard }];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] transition-colors">
      <div className="space-y-6">
        {/* Role Badge Indicator */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <p className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
            Active Workspace
          </p>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5 capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {user?.role} Portal
          </p>
          {user?.department && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {user.department}
            </p>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
