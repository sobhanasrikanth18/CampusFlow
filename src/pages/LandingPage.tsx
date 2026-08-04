import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  QrCode,
  Mail,
  Users,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Building2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { loginAsRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500 selection:text-white overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            CF
          </div>
          <span className="font-extrabold text-xl tracking-tight">
            Campus<span className="text-blue-400">Flow</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <button
            onClick={() => loginAsRole('student')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            Live Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> B.Tech Capstone Project Demonstration
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Smart Campus & Hostel <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Management System
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Digitizing student outpasses, hostel leave approvals, visitor management, and QR-based gate verification with automated parent email notifications.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => loginAsRole('student')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base transition shadow-xl shadow-blue-500/25 flex items-center gap-2"
            >
              Explore Student Outpass <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => loginAsRole('security')}
              className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-base transition flex items-center gap-2"
            >
              <QrCode className="w-5 h-5 text-emerald-400" /> Test Security Gate Scanner
            </button>
          </div>
        </motion.div>

        {/* Workflow Diagram */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Digital Multi-Tier Approval Workflow
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { title: '1. Student', desc: 'Applies Outpass', color: 'text-blue-400' },
              { title: '2. Mentor', desc: 'Reviews & Approves', color: 'text-indigo-400' },
              { title: '3. HOD', desc: 'Final Sign-off', color: 'text-purple-400' },
              { title: '4. QR Pass', desc: 'Secure Code Gen', color: 'text-emerald-400' },
              { title: '5. Security', desc: 'Gate Scan Verification', color: 'text-amber-400' },
              { title: '6. Parent Email', desc: 'Automated Dispatch', color: 'text-rose-400' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/40 transition"
              >
                <span className={`text-xs font-bold ${step.color}`}>{step.title}</span>
                <p className="text-xs text-slate-300 font-medium mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="mt-20">
          <h2 className="text-2xl font-bold text-slate-200 mb-8">
            6 Purpose-Built Role Dashboards
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              {
                role: 'student',
                title: 'Student Portal',
                desc: 'Apply outpasses, track leave approvals, download verified QR passes, and register visitors.',
                icon: GraduationCap,
                color: 'from-blue-500/20 to-indigo-500/10 text-blue-400',
              },
              {
                role: 'mentor',
                title: 'Mentor Console',
                desc: 'Review section student leave applications, check reasons, and forward to HOD.',
                icon: Users,
                color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400',
              },
              {
                role: 'hod',
                title: 'HOD Sign-Off',
                desc: 'Grant final digital approval for campus gate exits and monitor department analytics.',
                icon: Building2,
                color: 'from-purple-500/20 to-pink-500/10 text-purple-400',
              },
              {
                role: 'warden',
                title: 'Hostel Warden',
                desc: 'Approve weekend & vacation leaves, track room occupancy, and verify parent permissions.',
                icon: ShieldCheck,
                color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400',
              },
              {
                role: 'security',
                title: 'Security Gate Scanner',
                desc: 'Instant QR code scanning, pass validation, gate log recording, and parent email dispatch.',
                icon: Lock,
                color: 'from-amber-500/20 to-orange-500/10 text-amber-400',
              },
              {
                role: 'admin',
                title: 'System Admin',
                desc: 'Full administrative control over student accounts, faculty, hostels, and audit trails.',
                icon: Mail,
                color: 'from-rose-500/20 to-red-500/10 text-rose-400',
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.role}
                  onClick={() => loginAsRole(card.role as any)}
                  className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition group"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition">
                    {card.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">{card.desc}</p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-400 gap-1">
                    Launch Role Dashboard <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>CampusFlow Smart Campus System • Capstone Project Viva Presentation Ready</p>
      </footer>
    </div>
  );
};
