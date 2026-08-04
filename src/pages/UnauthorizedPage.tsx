import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types';

interface UnauthorizedPageProps {
  allowedRoles?: UserRole[];
  currentRole?: UserRole;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({
  allowedRoles = [],
  currentRole = 'student',
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center text-center p-6 font-sans">
      <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Animated Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-rose-500/20 dark:bg-rose-500/10 animate-ping opacity-75" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <ShieldX className="w-10 h-10" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Lock className="w-3.5 h-3.5" /> ERROR 403: ACCESS DENIED
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Role Authorization Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            You are logged in as <strong className="text-slate-900 dark:text-white uppercase font-mono">{currentRole}</strong>. 
            You do not have administrative clearance to access this dashboard or page.
          </p>
        </div>

        {/* Role Breakdown Badge */}
        {allowedRoles.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left space-y-2 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Authorized Roles for this Route:
            </p>
            <div className="flex flex-wrap gap-2">
              {allowedRoles.map((role) => (
                <span
                  key={role}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-bold uppercase border border-blue-500/20"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(`/${currentRole}`)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Go to {currentRole.toUpperCase()} Dashboard
          </button>
          
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            Switch Account Role
          </Link>
        </div>
      </div>
    </div>
  );
};
