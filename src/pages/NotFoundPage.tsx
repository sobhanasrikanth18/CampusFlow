import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center p-6 font-sans">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested campus route does not exist or requires higher role clearance.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Campus Dashboard
        </Link>
      </div>
    </div>
  );
};
