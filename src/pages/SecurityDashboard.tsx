import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GateLog, Visitor } from '../types';
import { QRVerificationModal } from '../components/QRVerificationModal';
import { QRCameraScannerModal } from '../components/QRCameraScannerModal';
import { AddVisitorModal } from '../components/AddVisitorModal';
import { StatsCard } from '../components/StatsCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  QrCode,
  Camera,
  Search,
  RefreshCw,
  LogOut,
  LogIn,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<GateLog[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    exitsToday: 0,
    entriesToday: 0,
    activeOutpassCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Scanner & Inputs
  const [passInput, setPassInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAddVisitorOpen, setIsAddVisitorOpen] = useState(false);

  // Verification Result Modal
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [logsRes, visRes] = await Promise.all([
        fetch('/api/security/today-logs'),
        fetch('/api/visitor/list'),
      ]);

      const logsData = await logsRes.json();
      if (logsData.success) {
        setLogs(logsData.logs || []);
        if (logsData.stats) setStats(logsData.stats);
      }

      const visData = await visRes.json();
      if (visData.success) {
        setVisitors(visData.visitors || []);
      }
    } catch (err) {
      console.error('Error loading security data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, [user]);

  const handleVerifyQR = async (qrPayloadText?: string) => {
    const targetText = qrPayloadText || passInput;
    if (!targetText.trim()) return;

    setIsVerifying(true);
    try {
      const res = await fetch('/api/security/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrText: targetText,
          passId: targetText,
          gateNumber: 'Main Gate 01',
          officerName: user?.name || 'Officer Ram Singh',
        }),
      });

      const data = await res.json();
      setVerificationResult(data);
      setPassInput('');
      fetchSecurityData();
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        message: err.message || 'Error executing gate QR verification',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckoutVisitor = async (visitorId: string) => {
    try {
      const res = await fetch('/api/security/checkout-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, officerName: user?.name || 'Officer Ram Singh' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSecurityData();
      }
    } catch (e) {
      console.error('Failed to checkout visitor:', e);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.rollOrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.passId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Security Gate Verification Console
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Main Gate 01
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time QR Code Pass Scanner, Visitor Entry Registration & Gate Audit Logging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddVisitorOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add Visitor Entry
          </button>
          <button
            onClick={fetchSecurityData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Gate Exits Logged"
          value={stats.exitsToday || stats.totalToday}
          icon={LogOut}
          color="amber"
          change="Campus Exit Verifications"
          changeType="positive"
        />

        <StatsCard
          title="Campus Visitors Today"
          value={visitors.length}
          icon={UserCheck}
          color="indigo"
          change={`${visitors.filter((v) => v.status === 'checked_in').length} Currently On Campus`}
          changeType="positive"
        />

        <StatsCard
          title="Active Outpasses"
          value={stats.activeOutpassCount}
          icon={Users}
          color="purple"
          change="HOD Approved Outpasses"
          changeType="neutral"
        />
      </div>

      {/* QR SCANNER CONSOLE */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl text-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold flex items-center gap-2">
              <QrCode className="w-6 h-6 text-emerald-400" />
              Scan & Verify Student Outpass / Hostel Leave QR
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports 1-time Outpasses (OP-XXXX) and 2-time Hostel Leaves (HL-XXXX Exit & Entry)
            </p>
          </div>

          <button
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition-all active:scale-95 self-start sm:self-center"
          >
            <Camera className="w-4 h-4" />
            Launch Live Camera Scanner
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <QrCode className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyQR()}
              placeholder="Scan QR or Enter Pass ID (e.g. OP-2026-8802 or HL-2026-4401)..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => handleVerifyQR()}
            disabled={isVerifying || !passInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-white text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : 'Verify Gate Pass'}
          </button>
        </div>
      </div>

      {/* CAMPUS VISITORS ENTRY TABLE */}
      {visitors.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                Campus Visitor Gate Entries
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Guests, parents & vendors currently checked in at campus security gate
              </p>
            </div>

            <button
              onClick={() => setIsAddVisitorOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-xs font-bold transition border border-indigo-500/20 flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> + New Visitor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Visitor Name & Phone</th>
                  <th className="py-2.5 px-3">Category & Purpose</th>
                  <th className="py-2.5 px-3">Visiting Student</th>
                  <th className="py-2.5 px-3">Entry & Expected Exit</th>
                  <th className="py-2.5 px-3 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {visitors.map((vis) => (
                  <tr key={vis.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900 dark:text-white">{vis.visitorName}</p>
                      <p className="text-[11px] font-mono text-indigo-500">{vis.visitorPhone}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{vis.relation}</p>
                      <p className="text-[11px] text-slate-500">{vis.purpose}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-900 dark:text-white">{vis.studentName}</p>
                      <span className="text-[10px] font-mono text-slate-400">{vis.studentRoll}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      <p className="text-emerald-500 font-semibold">
                        In: {vis.checkInTime ? new Date(vis.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'}
                      </p>
                      {vis.checkOutTime ? (
                        <p className="text-amber-500 font-semibold">
                          Out: {new Date(vis.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      ) : (
                        <p className="text-slate-400">Exp Out: {vis.idProofNumber ? 'Today' : 'N/A'}</p>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {vis.status === 'checked_in' ? (
                        <button
                          onClick={() => handleCheckoutVisitor(vis.id)}
                          className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold text-[11px] transition active:scale-95"
                        >
                          Mark Visitor Exit
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Checked Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TODAY'S GATE AUDIT LOGS TABLE */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gate Verification Audit Log</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live exit and entry audit history synchronized with MongoDB Atlas <code className="font-mono text-indigo-500">gate_logs</code>
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs by name, roll, ID..."
              className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Log ID & Pass</th>
                <th className="py-3 px-4">Person Details</th>
                <th className="py-3 px-4">Gate Action</th>
                <th className="py-3 px-4">Officer & Gate</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No gate verification logs recorded today.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-mono">
                      <span className="font-bold text-slate-900 dark:text-white block">{log.id}</span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{log.passId}</span>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{log.personName}</p>
                      <p className="text-[11px] text-slate-500">{log.personRole}</p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 w-max ${
                          log.action === 'EXIT' || log.action === 'VISITOR_EXIT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {log.action === 'EXIT' || log.action === 'VISITOR_EXIT' ? <LogOut className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
                        {log.action} VERIFIED
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      <p>{log.securityOfficer}</p>
                      <p className="text-[11px] text-slate-500">{log.gateNumber}</p>
                    </td>

                    <td className="py-4 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                      <span className="block text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      <QRVerificationModal
        isOpen={Boolean(verificationResult)}
        onClose={() => setVerificationResult(null)}
        result={verificationResult}
      />

      {/* CAMERA SCANNER MODAL */}
      <QRCameraScannerModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onScanSuccess={(decodedText) => {
          setIsCameraOpen(false);
          handleVerifyQR(decodedText);
        }}
      />

      {/* ADD VISITOR MODAL */}
      <AddVisitorModal
        isOpen={isAddVisitorOpen}
        onClose={() => setIsAddVisitorOpen(false)}
        onSuccess={fetchSecurityData}
      />
    </div>
  );
};
