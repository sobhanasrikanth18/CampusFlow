import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserRole } from '../types';
import {
  GraduationCap,
  UserCheck,
  Building2,
  Shield,
  Lock,
  UserCog,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  User,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');

    if (role === 'student') {
      setIdentifier('');
      setPassword('');
    } else if (role === 'mentor') {
      setIdentifier('vikram.mentor@campusflow.edu');
      setPassword('mentor123');
    } else if (role === 'hod') {
      setIdentifier('hod.cse@campusflow.edu');
      setPassword('hod123');
    } else if (role === 'warden') {
      setIdentifier('warden.boys@campusflow.edu');
      setPassword('warden123');
    } else if (role === 'security') {
      setIdentifier('security.gate1@campusflow.edu');
      setPassword('security123');
    } else if (role === 'admin') {
      setIdentifier('admin@campusflow.edu');
      setPassword('admin123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const res = await login({
      identifier: identifier.trim(),
      email: identifier.trim(),
      password: password,
      role: selectedRole,
    });

    setIsSubmitting(false);

    if (res.success && res.user) {
      navigate(`/${res.user.role}`);
    } else {
      setErrorMessage(res.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const roleConfigs: { role: UserRole; label: string; icon: any; placeholder: string; defaultIdent: string }[] = [
    {
      role: 'student',
      label: 'Student',
      icon: GraduationCap,
      placeholder: 'Enter Roll Number (e.g. 2300033711) or Email',
      defaultIdent: '2300033711',
    },
    {
      role: 'mentor',
      label: 'Mentor',
      icon: UserCheck,
      placeholder: 'vikram.mentor@campusflow.edu',
      defaultIdent: 'vikram.mentor@campusflow.edu',
    },
    {
      role: 'hod',
      label: 'HOD',
      icon: Building2,
      placeholder: 'hod.cse@campusflow.edu',
      defaultIdent: 'hod.cse@campusflow.edu',
    },
    {
      role: 'warden',
      label: 'Warden',
      icon: Shield,
      placeholder: 'warden.boys@campusflow.edu',
      defaultIdent: 'warden.boys@campusflow.edu',
    },
    {
      role: 'security',
      label: 'Security',
      icon: Lock,
      placeholder: 'security.gate1@campusflow.edu',
      defaultIdent: 'security.gate1@campusflow.edu',
    },
    {
      role: 'admin',
      label: 'Admin',
      icon: UserCog,
      placeholder: 'admin@campusflow.edu',
      defaultIdent: 'admin@campusflow.edu',
    },
  ];

  const currentConfig = roleConfigs.find((r) => r.role === selectedRole) || roleConfigs[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Top Right Theme Switcher Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-xs font-bold active:scale-95 cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}</span>
        </button>
      </div>

      {/* Dynamic Light Ambient Background Illumination */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-200/40 via-indigo-100/40 to-sky-200/40 dark:from-blue-600/20 dark:via-indigo-600/15 dark:to-purple-600/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-300/20 dark:bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Grid Overlay Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px] opacity-40 dark:opacity-10 pointer-events-none" />

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Premium Card */}
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.08)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-7 relative overflow-hidden transition-colors">
          {/* Top Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500" />

          {/* College Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center space-x-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25 ring-2 ring-white dark:ring-slate-800">
                CF
              </div>
              <div className="text-left">
                <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white block leading-tight">
                  KLH<span className="text-blue-600 dark:text-blue-400"> CampusFlow</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                  Smart Access & Outpass Portal
                </span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight pt-1">
              University Portal Login
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Secure Single Sign-On for Students, Faculty & Campus Security
            </p>
          </div>

          {/* Role Segmented Switcher Control */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Select User Role
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800">
              {roleConfigs.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => handleRoleSelect(item.role)}
                    className={`relative py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRoleBg"
                        className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="text-[10px] relative z-10 truncate capitalize">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message Toast */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {selectedRole === 'student' ? 'Student Roll Number or Official Email' : 'Account Email Address'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={currentConfig.placeholder}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  Default: {selectedRole === 'student' ? 'password123' : selectedRole === 'mentor' ? 'mentor123' : selectedRole === 'hod' ? 'hod123' : selectedRole === 'warden' ? 'warden123' : selectedRole === 'security' ? 'security123' : 'admin123'}
                </span>
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400 dark:text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Remember account session</span>
              </label>
              <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2.5 active:scale-[0.98] mt-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating User...</span>
                </div>
              ) : (
                <>
                  <span>Sign In as <strong className="capitalize">{selectedRole}</strong></span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Seal Footer */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-1">
            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official KLH University Encrypted SSO Portal
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
