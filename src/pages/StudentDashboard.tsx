import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Outpass, HostelLeave, Visitor, ParentNotification, User } from '../types';
import { StudentProfileCard } from '../components/StudentProfileCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { NotificationPanel } from '../components/NotificationPanel';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Plus,
  Home,
  UserPlus,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  Search,
  Filter,
  Download,
  Building,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  X,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [hostelLeaves, setHostelLeaves] = useState<HostelLeave[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [dbMode, setDbMode] = useState<string>('MongoDB Atlas Cloud Database');
  const [isLoading, setIsLoading] = useState(true);

  // Tab & Search State
  const [activeTab, setActiveTab] = useState<'all' | 'outpass' | 'leave' | 'visitor'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isOutpassModalOpen, setIsOutpassModalOpen] = useState(false);
  const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotifPanelOpen, setIsNotifPanelOpen] = useState(false);

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

  // Form States
  const [reason, setReason] = useState('');
  const [destination, setDestination] = useState('');
  const [outDate, setOutDate] = useState(new Date().toISOString().split('T')[0]);
  const [outTime, setOutTime] = useState('14:00');
  const [inDate, setInDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState('19:00');

  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'weekend' | 'emergency' | 'vacation' | 'medical'>('weekend');
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]);

  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [relation, setRelation] = useState('Father');
  const [purpose, setPurpose] = useState('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (!user) return;
      const [dashRes, opRes, hlRes, visRes, dbStatusRes] = await Promise.all([
        fetch(`/api/student/dashboard?studentId=${user.id}`),
        fetch(`/api/outpass/list?role=student&userId=${user.id}`),
        fetch(`/api/hostel/list?role=student&userId=${user.id}`),
        fetch(`/api/visitor/list`),
        fetch('/api/system/db-status'),
      ]);

      const dashData = await dashRes.json();
      const opData = await opRes.json();
      const hlData = await hlRes.json();
      const visData = await visRes.json();
      const dbStatusData = await dbStatusRes.json();

      if (dashData.success && dashData.profile) {
        setProfile(dashData.profile);
        if (dashData.notifications) setNotifications(dashData.notifications);
      }
      if (opData.success) setOutpasses(opData.outpasses || []);
      if (hlData.success) setHostelLeaves(hlData.leaves || []);
      if (visData.success) {
        setVisitors((visData.visitors || []).filter((v: Visitor) => v.studentId === user.id || (user.rollNumber && v.studentRoll === user.rollNumber)));
      }
      if (dbStatusData.success) {
        setDbMode(dbStatusData.mode);
      }
    } catch (e) {
      console.error('Error loading student dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (location.pathname.endsWith('/outpass')) {
      setActiveTab('outpass');
      setIsOutpassModalOpen(true);
    } else if (location.pathname.endsWith('/hostel')) {
      setActiveTab('leave');
      setIsHostelModalOpen(true);
    } else if (location.pathname.endsWith('/visitor')) {
      setActiveTab('visitor');
      setIsVisitorModalOpen(true);
    }
  }, [location.pathname]);

  const handleApplyOutpass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/outpass/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile?.id || user?.id,
          reason,
          destination,
          outDate,
          outTime,
          inDate,
          inTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOutpassModalOpen(false);
        setReason('');
        setDestination('');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyHostelLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/hostel/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile?.id || user?.id,
          leaveType,
          reason: leaveReason,
          startDate,
          endDate,
          parentPhone: profile?.parentPhone || user?.parentPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsHostelModalOpen(false);
        setLeaveReason('');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/visitor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: profile?.id || user?.id,
          visitorName,
          visitorPhone,
          relation,
          purpose,
          visitDate: outDate,
          idProofNumber: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsVisitorModalOpen(false);
        setVisitorName('');
        setVisitorPhone('');
        setPurpose('');
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeStudent = profile || user;

  // Filter requests
  const filteredOutpasses = outpasses.filter(
    (o) =>
      o.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeaves = hostelLeaves.filter(
    (l) =>
      l.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVisitors = visitors.filter(
    (v) =>
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {activeStudent?.name.split(' ')[0]}! &apos;
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live MongoDB Atlas Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            CampusFlow Student Outpass, Hostel Leave & Visitor Access Portal
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNotifPanelOpen(true)}
            className="relative p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
            title="Activity Notifications"
          >
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {notifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsOutpassModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Apply Outpass
          </button>

          <button
            onClick={() => setIsHostelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <Home className="w-4 h-4 text-emerald-500" />
            Hostel Leave
          </button>
        </div>
      </div>

      {/* SECTION 1: Profile Card */}
      {activeStudent && (
        <StudentProfileCard
          user={activeStudent}
          mentorName={activeStudent.mentorName || 'Dr. Vikram Reddy'}
          mentorEmail={activeStudent.mentorEmail || 'vikram.mentor@campusflow.edu'}
          hasApprovedOutpass={Boolean(outpasses.find((o) => o.status === 'approved_hod'))}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onViewQR={() => {
            const approved = outpasses.find((o) => o.status === 'approved_hod');
            if (!approved) return;
            setActiveQRModal({
              isOpen: true,
              passId: approved.id,
              studentName: activeStudent.name,
              rollNumber: activeStudent.rollNumber || '',
              validity: `${approved.inDate} ${approved.inTime}`,
              qrCode: approved.qrCode,
            });
          }}
        />
      )}

      {/* SECTION 2: Quick Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Outpasses"
          value={outpasses.length}
          icon={FileCheck2}
          color="indigo"
          change={`${outpasses.filter((o) => o.status === 'approved_hod' || o.status === 'used').length} Approved`}
          changeType="positive"
        />

        <StatsCard
          title="Active Outpass Pass"
          value={outpasses.filter((o) => o.status === 'approved_hod' || o.status === 'pending_mentor').length}
          icon={Clock}
          color="amber"
          change={outpasses.some((o) => o.status === 'approved_hod') ? 'Ready to Exit Gate' : 'Pending Approvals'}
          changeType={outpasses.some((o) => o.status === 'approved_hod') ? 'positive' : 'neutral'}
        />

        <StatsCard
          title="Hostel Leaves"
          value={hostelLeaves.length}
          icon={Home}
          color="emerald"
          change={`${hostelLeaves.filter((h) => h.status === 'approved').length} Warden Approved`}
          changeType="positive"
        />

        <StatsCard
          title="Visitor Passes"
          value={visitors.length}
          icon={UserPlus}
          color="purple"
          change="Registered Guests"
          changeType="neutral"
        />
      </div>

      {/* SECTION 3: Recent Requests & History */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Request History & Approvals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Track Outpass requests, Hostel leave applications and Visitor entries
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchDashboardData}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: `All Requests (${outpasses.length + hostelLeaves.length + visitors.length})` },
            { id: 'outpass', label: `Outpasses (${outpasses.length})` },
            { id: 'leave', label: `Hostel Leaves (${hostelLeaves.length})` },
            { id: 'visitor', label: `Visitors (${visitors.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Outpasses List */}
        {(activeTab === 'all' || activeTab === 'outpass') && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Campus Outpasses
            </h4>
            {filteredOutpasses.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No Outpasses applied yet.</div>
            ) : (
              filteredOutpasses.map((op) => (
                <div
                  key={op.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{op.id}</span>
                      <StatusBadge status={op.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{op.reason}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {op.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {op.outDate} {op.outTime} &rarr; {op.inTime}
                      </span>
                    </div>
                  </div>

                  {op.status === 'approved_hod' && (
                    <button
                      onClick={() =>
                        setActiveQRModal({
                          isOpen: true,
                          passId: op.id,
                          studentName: op.studentName,
                          rollNumber: op.rollNumber,
                          validity: `${op.inDate} ${op.inTime}`,
                          qrCode: op.qrCode,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 self-start md:self-center"
                    >
                      <QrCode className="w-4 h-4" />
                      View QR Pass
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Hostel Leaves List */}
        {(activeTab === 'all' || activeTab === 'leave') && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Hostel Leave Applications
            </h4>
            {filteredLeaves.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No Hostel Leaves applied yet.</div>
            ) : (
              filteredLeaves.map((hl) => (
                <div
                  key={hl.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{hl.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {hl.leaveType}
                      </span>
                      <StatusBadge status={hl.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{hl.reason}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                      Leave Dates: <span className="font-semibold text-slate-700 dark:text-slate-300">{hl.startDate} &rarr; {hl.endDate}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Apply Outpass Modal */}
      {isOutpassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply for Outpass</h3>
              <button onClick={() => setIsOutpassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyOutpass} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason for Outpass</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Medical appointment, essential document work"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Destination Address</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. City Hospital, Sector 17"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Out Date & Time</label>
                  <input
                    type="date"
                    value={outDate}
                    onChange={(e) => setOutDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                  <input
                    type="time"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Return Date & Time</label>
                  <input
                    type="date"
                    value={inDate}
                    onChange={(e) => setInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                  <input
                    type="time"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOutpassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: Apply Hostel Leave */}
      {isHostelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply for Hostel Leave</h3>
              <button onClick={() => setIsHostelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyHostelLeave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="weekend">Weekend Leave</option>
                  <option value="emergency">Emergency Leave</option>
                  <option value="vacation">Vacation Leave</option>
                  <option value="medical">Medical Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Reason</label>
                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="Family occasion, medical rest, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsHostelModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25"
                >
                  Submit to Warden
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QR MODAL */}
      <QRModal
        isOpen={activeQRModal.isOpen}
        onClose={() => setActiveQRModal({ ...activeQRModal, isOpen: false })}
        passId={activeQRModal.passId}
        studentName={activeQRModal.studentName}
        rollNumber={activeQRModal.rollNumber}
        validity={activeQRModal.validity}
        qrCode={activeQRModal.qrCode}
      />

      {/* EDIT PROFILE MODAL */}
      {activeStudent && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={activeStudent}
          onProfileUpdated={(updated) => {
            setProfile(updated);
            fetchDashboardData();
          }}
        />
      )}

      {/* NOTIFICATION PANEL */}
      <NotificationPanel
        isOpen={isNotifPanelOpen}
        onClose={() => setIsNotifPanelOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};
