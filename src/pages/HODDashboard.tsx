import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outpass } from '../types';
import { HODApprovalModal } from '../components/HODApprovalModal';
import { StatusBadge } from '../components/StatusBadge';
import { StatsCard } from '../components/StatsCard';
import { QRModal } from '../components/QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  QrCode,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Check,
  X,
  Eye,
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
    parentPhone: string;
  };
}

export const HODDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<EnrichedOutpass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedOutpass, setSelectedOutpass] = useState<EnrichedOutpass | null>(null);
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

  const fetchHODRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hod/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching HOD requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHODRequests();
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

    if (activeTab === 'pending') return req.status === 'approved_mentor';
    if (activeTab === 'approved') return req.status === 'approved_hod' || req.status === 'used';
    if (activeTab === 'rejected') return req.status === 'rejected_hod';
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'approved_mentor').length;
  const approvedCount = requests.filter((r) => r.status === 'approved_hod' || r.status === 'used').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected_hod').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Head of Department Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Department of Computer Science
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Final Outpass Authorization & Gate Pass QR Code Issuance Console
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHODRequests}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-purple-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Awaiting HOD Sign-Off"
          value={pendingCount}
          icon={Clock}
          color="amber"
          change={pendingCount > 0 ? `${pendingCount} mentor-approved passes` : 'Queue cleared'}
          changeType={pendingCount > 0 ? 'neutral' : 'positive'}
        />

        <StatsCard
          title="Approved & QR Issued"
          value={approvedCount}
          icon={QrCode}
          color="purple"
          change="Gate Passes Active"
          changeType="positive"
        />

        <StatsCard
          title="Rejected by HOD"
          value={rejectedCount}
          icon={XCircle}
          color="rose"
          change="Process Terminated"
          changeType="negative"
        />

        <StatsCard
          title="Total Handled"
          value={requests.length}
          icon={Sparkles}
          color="indigo"
          change="Department Applications"
          changeType="positive"
        />
      </div>

      {/* Main Table Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mentor-Approved Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review mentor remarks, grant final authorization, and issue downloadable QR gate passes.
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
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'pending', label: `Awaiting HOD Sign-Off (${pendingCount})` },
            { id: 'approved', label: `Approved & QR Issued (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
            { id: 'all', label: `All (${requests.length})` },
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

        {/* Professional Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">Mentor Sign-Off</th>
                <th className="py-3 px-4">Destination & Timing</th>
                <th className="py-3 px-4">Status & QR</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No applications matching current filter.
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
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {student.rollNumber} &bull; {student.department} ({student.section})
                          </p>
                        </div>
                      </td>

                      {/* Mentor Sign-Off */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Mentor Approved
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic line-clamp-2">
                          &ldquo;{req.mentorRemarks || 'Approved by Section Mentor'}&rdquo;
                        </p>
                      </td>

                      {/* Destination & Timing */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-purple-500 shrink-0" /> {req.destination}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{req.reason}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          {req.outDate} {req.outTime} &rarr; {req.inTime}
                        </p>
                      </td>

                      {/* Status & QR */}
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                        {req.qrCode && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-bold text-[11px]">
                            <QrCode className="w-3.5 h-3.5" />
                            QR Stored in Mongo
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        {req.status === 'approved_mentor' ? (
                          <button
                            onClick={() => setSelectedOutpass(req)}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 ml-auto transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Authorize & Issue QR
                          </button>
                        ) : req.qrCode ? (
                          <button
                            onClick={() =>
                              setActiveQRModal({
                                isOpen: true,
                                passId: req.id,
                                studentName: req.studentName,
                                rollNumber: req.rollNumber,
                                validity: `${req.inDate} ${req.inTime}`,
                                qrCode: req.qrCode,
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1 ml-auto transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            View Pass QR
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
      {selectedOutpass && (
        <HODApprovalModal
          isOpen={Boolean(selectedOutpass)}
          onClose={() => setSelectedOutpass(null)}
          outpass={selectedOutpass}
          onActionCompleted={() => fetchHODRequests()}
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
