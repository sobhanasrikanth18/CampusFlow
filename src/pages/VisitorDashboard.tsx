import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Visitor } from '../types';
import { VisitorRegistrationModal } from '../components/VisitorRegistrationModal';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  QrCode,
  Search,
  RefreshCw,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  LogIn,
  LogOut,
  Users,
  FileText,
  Plus,
} from 'lucide-react';

export const VisitorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'checked_in' | 'completed' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [activeQRModal, setActiveQRModal] = useState<{
    isOpen: boolean;
    passId: string;
    studentName: string;
    rollNumber: string;
    validity: string;
    qrCode?: string;
  }>({
    isOpen: false,
    passId: '',
    studentName: '',
    rollNumber: '',
    validity: '',
  });

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/visitor/list');
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors || []);
      }
    } catch (err) {
      console.error('Error fetching visitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [user]);

  // Filters
  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.visitorPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.studentRoll && v.studentRoll.toLowerCase().includes(searchQuery.toLowerCase())) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'checked_in') return v.status === 'checked_in';
    if (activeTab === 'completed') return v.status === 'completed';
    if (activeTab === 'approved') return v.status === 'approved' || v.status === 'registered' || v.status === 'pending';
    return true;
  });

  const checkedInCount = visitors.filter((v) => v.status === 'checked_in').length;
  const completedCount = visitors.filter((v) => v.status === 'completed').length;
  const activePassesCount = visitors.filter((v) => v.status === 'approved' || v.status === 'registered' || v.status === 'pending').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Visitor Access & Guest Pass Console
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Campus Visitor Desk
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Register guests, issue cryptographic QR passes, and track campus entrance audit logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Register New Visitor
          </button>

          <button
            onClick={fetchVisitors}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-purple-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Registered Guests"
          value={visitors.length}
          icon={Users}
          color="purple"
          change="Campus Visitor Passes"
          changeType="positive"
        />

        <StatsCard
          title="Currently Checked In"
          value={checkedInCount}
          icon={LogIn}
          color="amber"
          change={checkedInCount > 0 ? `${checkedInCount} guests inside campus` : 'No active guests inside'}
          changeType={checkedInCount > 0 ? 'neutral' : 'positive'}
        />

        <StatsCard
          title="Visits Completed"
          value={completedCount}
          icon={CheckCircle2}
          color="emerald"
          change="Checked Out at Gate"
          changeType="positive"
        />

        <StatsCard
          title="Active QR Passes"
          value={activePassesCount}
          icon={QrCode}
          color="indigo"
          change="Ready for Entrance"
          changeType="neutral"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registered Visitor History</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              View visitor credentials, host student info, gate entry status and QR passes
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitor, phone, host..."
              className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: `All Visitors (${visitors.length})` },
            { id: 'approved', label: `Active Passes (${activePassesCount})` },
            { id: 'checked_in', label: `Checked In (${checkedInCount})` },
            { id: 'completed', label: `Completed (${completedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Professional Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Visitor Info</th>
                <th className="py-3 px-4">Student Host</th>
                <th className="py-3 px-4">Purpose & Date</th>
                <th className="py-3 px-4">Gate Status</th>
                <th className="py-3 px-4 text-right">QR Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredVisitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No visitor records matching current filter.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((v) => (
                  <motion.tr
                    key={v.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Visitor Info */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{v.visitorName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{v.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                          {v.relation || 'Guest'}
                        </span>
                        <a
                          href={`tel:${v.visitorPhone}`}
                          className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                        >
                          <Phone className="w-3 h-3" /> {v.visitorPhone}
                        </a>
                      </div>
                    </td>

                    {/* Student Host */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{v.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{v.studentRoll}</p>
                    </td>

                    {/* Purpose & Date */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{v.purpose}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-purple-500" /> Visit Date: {v.visitDate}
                      </p>
                    </td>

                    {/* Gate Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={v.status} />
                      {v.checkInTime && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono font-bold">
                          Checked In: {new Date(v.checkInTime).toLocaleTimeString()}
                        </p>
                      )}
                      {v.checkOutTime && (
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          Checked Out: {new Date(v.checkOutTime).toLocaleTimeString()}
                        </p>
                      )}
                    </td>

                    {/* QR Pass */}
                    <td className="py-4 px-4 text-right">
                      {v.qrCode ? (
                        <button
                          onClick={() =>
                            setActiveQRModal({
                              isOpen: true,
                              passId: v.id,
                              studentName: `Guest: ${v.visitorName}`,
                              rollNumber: `Host: ${v.studentRoll}`,
                              validity: `Visit Date: ${v.visitDate}`,
                              qrCode: v.qrCode,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 ml-auto transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          View QR Pass
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">No QR</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Registration Modal */}
      {user && (
        <VisitorRegistrationModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          studentId={user.id}
          onSuccess={() => fetchVisitors()}
        />
      )}

      {/* View QR Pass Modal */}
      <QRModal
        isOpen={activeQRModal.isOpen}
        onClose={() => setActiveQRModal({ ...activeQRModal, isOpen: false })}
        passId={activeQRModal.passId}
        studentName={activeQRModal.studentName}
        rollNumber={activeQRModal.rollNumber}
        validity={activeQRModal.validity}
        qrCode={activeQRModal.qrCode}
      />
    </div>
  );
};
