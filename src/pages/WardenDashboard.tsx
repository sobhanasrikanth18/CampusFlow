import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HostelLeave } from '../types';
import { WardenApprovalModal } from '../components/WardenApprovalModal';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { QRModal } from '../components/QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  QrCode,
  Phone,
  Calendar,
  Check,
  X,
  Building,
  UserCheck,
} from 'lucide-react';

interface EnrichedHostelLeave extends HostelLeave {
  studentDetails?: {
    name: string;
    rollNumber: string;
    department: string;
    year: string;
    section: string;
    hostelBlock: string;
    roomNumber: string;
    parentName: string;
    parentPhone: string;
  };
}

export const WardenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<EnrichedHostelLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedLeave, setSelectedLeave] = useState<EnrichedHostelLeave | null>(null);
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

  const fetchWardenLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hostel/warden');
      const data = await res.json();
      if (data.success) {
        setLeaves(data.leaves || []);
      }
    } catch (err) {
      console.error('Error fetching warden leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardenLeaves();
  }, [user]);

  // Filtering
  const filteredLeaves = leaves.filter((l) => {
    const studentName = l.studentDetails?.name || l.studentName;
    const rollNumber = l.studentDetails?.rollNumber || l.rollNumber;
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.reason.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return l.status === 'pending_warden';
    if (activeTab === 'approved') return l.status === 'approved';
    if (activeTab === 'rejected') return l.status === 'rejected';
    return true;
  });

  const pendingCount = leaves.filter((l) => l.status === 'pending_warden').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hostel Warden Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> A-Block (Boys) Residence
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Hostel Leave Approvals, Guardian Verification & QR Pass Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWardenLeaves}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Warden Review"
          value={pendingCount}
          icon={Clock}
          color="amber"
          change={pendingCount > 0 ? `${pendingCount} applications pending` : 'Queue cleared'}
          changeType={pendingCount > 0 ? 'neutral' : 'positive'}
        />

        <StatsCard
          title="Approved Hostel Leaves"
          value={approvedCount}
          icon={CheckCircle2}
          color="emerald"
          change="Warden Sign-Off Granted"
          changeType="positive"
        />

        <StatsCard
          title="Rejected Applications"
          value={rejectedCount}
          icon={XCircle}
          color="rose"
          change="Process Terminated"
          changeType="negative"
        />

        <StatsCard
          title="Total Leave Applications"
          value={leaves.length}
          icon={Home}
          color="indigo"
          change="Hostel Block Records"
          changeType="positive"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hostel Residence Leave Queue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify student room number and guardian permission before issuing hostel leave pass.
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
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            { id: 'all', label: `All (${leaves.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
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
                <th className="py-3 px-4">Student & Residence</th>
                <th className="py-3 px-4">Leave Type & Reason</th>
                <th className="py-3 px-4">Leave Dates</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4">Status & QR</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No hostel leave applications matching current filter.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => {
                  const student = l.studentDetails || {
                    name: l.studentName,
                    rollNumber: l.rollNumber,
                    department: 'Computer Science',
                    year: '3rd Year',
                    section: 'A',
                    hostelBlock: l.hostelBlock || 'A-Block (Boys)',
                    roomNumber: l.roomNumber || 'A-101',
                    parentName: 'Parent / Guardian',
                    parentPhone: l.parentPhone || '+91 98765 43210',
                  };

                  return (
                    <motion.tr
                      key={l.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Student & Residence */}
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{student.rollNumber}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {student.hostelBlock} - Room {student.roomNumber}
                          </p>
                        </div>
                      </td>

                      {/* Leave Type & Reason */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {l.leaveType} leave
                        </span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
                          {l.reason}
                        </p>
                      </td>

                      {/* Leave Dates */}
                      <td className="py-4 px-4 font-mono text-slate-700 dark:text-slate-300 font-semibold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          {l.startDate} &rarr; {l.endDate}
                        </span>
                      </td>

                      {/* Guardian Contact */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{student.parentName}</p>
                        <a
                          href={`tel:${student.parentPhone}`}
                          className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-0.5"
                        >
                          <Phone className="w-3 h-3" /> {student.parentPhone}
                        </a>
                      </td>

                      {/* Status & QR */}
                      <td className="py-4 px-4">
                        <StatusBadge status={l.status} />
                        {l.qrCode && (
                          <div className="mt-1 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            <QrCode className="w-3 h-3" /> QR Stored
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {l.status === 'pending_warden' ? (
                          <button
                            onClick={() => setSelectedLeave(l)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 ml-auto transition-all"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Review & Issue Pass
                          </button>
                        ) : l.qrCode ? (
                          <button
                            onClick={() =>
                              setActiveQRModal({
                                isOpen: true,
                                passId: l.id,
                                studentName: l.studentName,
                                rollNumber: l.rollNumber,
                                validity: `${l.startDate} to ${l.endDate}`,
                                qrCode: l.qrCode,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 ml-auto transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            View QR Pass
                          </button>
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

      {/* Confirmation & QR Modal */}
      {selectedLeave && (
        <WardenApprovalModal
          isOpen={Boolean(selectedLeave)}
          onClose={() => setSelectedLeave(null)}
          leave={selectedLeave}
          onActionCompleted={() => fetchWardenLeaves()}
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
