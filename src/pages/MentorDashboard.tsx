import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outpass } from '../types';
import { MentorApprovalModal } from '../components/MentorApprovalModal';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';

interface EnrichedOutpass extends Outpass {
  studentDetails?: {
    name: string;
    rollNumber: string;
    department: string;
    year: string;
    section: string;
    hostelBlock: string;
    roomNumber: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    avatarUrl?: string;
  };
}

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EnrichedOutpass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedOutpass, setSelectedOutpass] = useState<EnrichedOutpass | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject'>('approve');

  const fetchMentorRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/requests?mentorId=${user?.id || 'usr_mentor_1'}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching mentor requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorRequests();
  }, [user]);

  // Filtering
  const filteredRequests = requests.filter((req) => {
    const studentName = req.studentDetails?.name || req.studentName;
    const rollNumber = req.studentDetails?.rollNumber || req.rollNumber;
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.destination.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return req.status === 'pending_mentor';
    if (activeTab === 'approved') return req.status === 'approved_mentor' || req.status === 'approved_hod' || req.status === 'used';
    if (activeTab === 'rejected') return req.status === 'rejected_mentor';
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending_mentor').length;
  const approvedCount = requests.filter((r) => r.status === 'approved_mentor' || r.status === 'approved_hod' || r.status === 'used').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected_mentor').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Faculty Mentor Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Computer Science Section A
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Section Student Outpass Approval & Guardian Verification Portal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMentorRequests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          change={pendingCount > 0 ? `${pendingCount} require action` : 'All cleared!'}
          changeType={pendingCount > 0 ? 'neutral' : 'positive'}
        />

        <StatsCard
          title="Approved by Mentor"
          value={approvedCount}
          icon={CheckCircle2}
          color="emerald"
          change="Routed to HOD Queue"
          changeType="positive"
        />

        <StatsCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          color="rose"
          change="Process Terminated"
          changeType="negative"
        />

        <StatsCard
          title="Total Requests"
          value={requests.length}
          icon={UserCheck}
          color="indigo"
          change="Section Applications"
          changeType="positive"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Section Outpass Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review student outpass details, verify guardian permission, and approve or reject.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, roll, ID..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'pending', label: `Pending Review (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
            { id: 'all', label: `All (${requests.length})` },
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

        {/* Professional Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">Residence</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Destination & Timing</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No outpass requests matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const student = req.studentDetails || {
                    name: req.studentName,
                    rollNumber: req.rollNumber,
                    department: req.department,
                    year: req.year,
                    section: req.section,
                    hostelBlock: 'A-Block (Boys)',
                    roomNumber: 'A-101',
                    parentName: 'Parent / Guardian',
                    parentEmail: 'parent@example.com',
                    parentPhone: '+91 98765 43210',
                  };

                  return (
                    <motion.tr
                      key={req.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Student Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={student.name}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {student.rollNumber} &bull; {student.section}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Residence */}
                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        <p>{student.hostelBlock}</p>
                        <p className="text-[11px] text-slate-500">Room: {student.roomNumber}</p>
                      </td>

                      {/* Guardian Contact */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${student.parentPhone}`}
                            className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                          >
                            <Phone className="w-3 h-3" /> {student.parentPhone}
                          </a>
                        </div>
                      </td>

                      {/* Destination & Timing */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {req.destination}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{req.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {req.outDate} {req.outTime} &rarr; {req.inTime}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                        {req.mentorRemarks && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic max-w-xs truncate">
                            &ldquo;{req.mentorRemarks}&rdquo;
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {req.status === 'pending_mentor' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedOutpass(req);
                                setModalAction('approve');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOutpass(req);
                                setModalAction('reject');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">Reviewed</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedOutpass && (
        <MentorApprovalModal
          isOpen={Boolean(selectedOutpass)}
          onClose={() => setSelectedOutpass(null)}
          outpass={selectedOutpass}
          initialAction={modalAction}
          onActionCompleted={() => fetchMentorRequests()}
        />
      )}
    </div>
  );
};
