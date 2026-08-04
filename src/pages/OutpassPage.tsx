import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Outpass } from '../types';
import { OutpassApplyForm } from '../components/OutpassApplyForm';
import { OutpassDetailModal } from '../components/OutpassDetailModal';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  Filter,
  XCircle,
} from 'lucide-react';

export const OutpassPage: React.FC = () => {
  const { user } = useAuth();
  const [outpasses, setOutpasses] = useState<Outpass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'used'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isApplyFormOpen, setIsApplyFormOpen] = useState(false);
  const [selectedOutpassId, setSelectedOutpassId] = useState<string | null>(null);

  const fetchOutpasses = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const res = await fetch(`/api/outpass/student?studentId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setOutpasses(data.outpasses || []);
      }
    } catch (err) {
      console.error('Error fetching outpasses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, [user]);

  // Filters
  const filteredOutpasses = outpasses.filter((op) => {
    const matchesSearch =
      op.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return op.status === 'pending_mentor';
    if (activeTab === 'approved') return op.status === 'approved_mentor' || op.status === 'approved_hod';
    if (activeTab === 'rejected') return op.status === 'rejected_mentor' || op.status === 'rejected_hod';
    if (activeTab === 'used') return op.status === 'used';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Apply Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Out-Pass Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Apply for campus exit permissions, track multi-tier approvals, and download QR gate passes
          </p>
        </div>

        <button
          onClick={() => setIsApplyFormOpen(!isApplyFormOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          {isApplyFormOpen ? 'Close Form' : 'Apply New Outpass'}
        </button>
      </div>

      {/* Embedded Form if Toggle Opened */}
      <AnimatePresence>
        {isApplyFormOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <OutpassApplyForm
              studentId={user.id}
              onSuccess={() => {
                setIsApplyFormOpen(false);
                fetchOutpasses();
              }}
              onCancel={() => setIsApplyFormOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Applied</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{outpasses.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {outpasses.filter((o) => o.status === 'pending_mentor').length}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">HOD Approved</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {outpasses.filter((o) => o.status === 'approved_hod' || o.status === 'used').length}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active QR Passes</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {outpasses.filter((o) => o.status === 'approved_hod').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter & Outpass Cards Section */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Outpass Applications</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click on any card to view detailed approval timeline and QR code
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search outpasses..."
                className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchOutpasses}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: `All (${outpasses.length})` },
            { id: 'pending', label: `Pending (${outpasses.filter((o) => o.status === 'pending_mentor').length})` },
            { id: 'approved', label: `Approved (${outpasses.filter((o) => o.status === 'approved_hod' || o.status === 'approved_mentor').length})` },
            { id: 'rejected', label: `Rejected (${outpasses.filter((o) => o.status === 'rejected_mentor' || o.status === 'rejected_hod').length})` },
            { id: 'used', label: `Used Gate (${outpasses.filter((o) => o.status === 'used').length})` },
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

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOutpasses.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400 text-xs">
              No outpasses matching current filter.
            </div>
          ) : (
            filteredOutpasses.map((op) => (
              <motion.div
                key={op.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedOutpassId(op.id)}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/40 shadow-sm cursor-pointer transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">{op.id}</span>
                  <StatusBadge status={op.status} />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{op.reason}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {op.destination}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {op.outDate} {op.outTime}
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                    <Eye className="w-3.5 h-3.5" /> Timeline & Details
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOutpassId && (
        <OutpassDetailModal
          isOpen={Boolean(selectedOutpassId)}
          onClose={() => setSelectedOutpassId(null)}
          outpassId={selectedOutpassId}
          onCanceled={() => fetchOutpasses()}
        />
      )}
    </div>
  );
};
