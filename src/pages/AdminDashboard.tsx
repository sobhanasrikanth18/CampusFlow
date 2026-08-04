import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, UserRole, Outpass, GateLog } from '../types';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Building2,
  ShieldAlert,
  Search,
  Plus,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Building,
  GraduationCap,
  Home,
  QrCode,
  Bell,
  Activity,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'departments' | 'hostels' | 'activity'>('analytics');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Add User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Klh@2026');
  const [role, setRole] = useState<UserRole>('student');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const [section, setSection] = useState('A');
  const [hostelBlock, setHostelBlock] = useState('A-Block (Boys)');
  const [roomNumber, setRoomNumber] = useState('A-101');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');

  // Bulk Import JSON State
  const [bulkJson, setBulkJson] = useState(`[
  {
    "name": "Rahul Kumar",
    "email": "2310030700@klh.edu.in",
    "rollNumber": "2310030700",
    "department": "Computer Science",
    "year": "3rd Year",
    "section": "A",
    "hostelBlock": "A-Block (Boys)",
    "roomNumber": "105",
    "parentName": "Sunil Kumar",
    "parentEmail": "sunil.k@gmail.com",
    "parentPhone": "+91 98765 12345"
  }
]`);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, analyticsRes, activityRes] = await Promise.all([
        fetch('/api/auth/users'),
        fetch('/api/admin/analytics'),
        fetch('/api/admin/activity'),
      ]);

      const usersData = await usersRes.json();
      const analyticsData = await analyticsRes.json();
      const activityData = await activityRes.json();

      if (usersData.success) setUsers(usersData.users || []);
      if (analyticsData.success) setAnalytics(analyticsData);
      if (activityData.success) setActivity(activityData.activity || []);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          rollNumber,
          department,
          year,
          section,
          hostelBlock,
          roomNumber,
          parentName,
          parentEmail,
          parentPhone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAddUserModalOpen(false);
        setName('');
        setEmail('');
        setRollNumber('');
        setParentName('');
        setParentPhone('');
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setUserToDelete(null);
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await fetch('/api/auth/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsed }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkStatus(data.message);
        setTimeout(() => {
          setIsBulkModalOpen(false);
          setBulkStatus(null);
          fetchAdminData();
        }, 1200);
      }
    } catch (e) {
      setBulkStatus('Invalid JSON Format. Please check syntax.');
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    return true;
  });

  const summary = analytics?.summary || {
    totalUsers: users.length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalStaff: users.filter((u) => u.role !== 'student').length,
    totalOutpasses: 0,
    totalHostelLeaves: 0,
    totalVisitors: 0,
    totalGateLogs: 0,
  };

  const charts = analytics?.charts || {
    outpassStatusChart: [
      { name: 'Pending Mentor', value: 12, color: '#f59e0b' },
      { name: 'Approved Mentor', value: 8, color: '#6366f1' },
      { name: 'Approved HOD (Active QR)', value: 15, color: '#8b5cf6' },
      { name: 'Gate Exit Verified', value: 24, color: '#10b981' },
      { name: 'Rejected', value: 5, color: '#f43f5e' },
    ],
    departmentChart: [
      { department: 'Computer Science', requests: 42 },
      { department: 'Electronics', requests: 28 },
      { department: 'Mechanical', requests: 19 },
      { department: 'Civil', requests: 14 },
      { department: 'Biotech', requests: 9 },
    ],
    gateTrafficChart: [
      { hour: '06:00 AM', exits: 4, entries: 1 },
      { hour: '08:00 AM', exits: 12, entries: 3 },
      { hour: '10:00 AM', exits: 25, entries: 8 },
      { hour: '12:00 PM', exits: 18, entries: 14 },
      { hour: '02:00 PM', exits: 32, entries: 22 },
      { hour: '04:00 PM', exits: 45, entries: 38 },
      { hour: '06:00 PM', exits: 20, entries: 52 },
      { hour: '08:00 PM', exits: 5, entries: 41 },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Admin Control Center & System Analytics
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Full System Admin
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global User Management, Recharts Visualizations, Department Loads & Gate Security Audits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Bulk JSON Import
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users Registered"
          value={summary.totalUsers}
          icon={Users}
          color="indigo"
          change={`${summary.totalStudents} Students / ${summary.totalStaff} Staff`}
          changeType="positive"
        />

        <StatsCard
          title="Total Outpass Applications"
          value={summary.totalOutpasses}
          icon={BarChart3}
          color="amber"
          change="Campus-wide Outpasses"
          changeType="neutral"
        />

        <StatsCard
          title="Hostel Leaves"
          value={summary.totalHostelLeaves}
          icon={Home}
          color="emerald"
          change="Warden Sign-offs"
          changeType="positive"
        />

        <StatsCard
          title="Gate Audit Logs"
          value={summary.totalGateLogs}
          icon={QrCode}
          color="purple"
          change="Gate Exits & Entries"
          changeType="neutral"
        />
      </div>

      {/* Main Container with Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'analytics', label: 'Dashboard Analytics & Charts', icon: BarChart3 },
            { id: 'users', label: `Manage Users (${users.length})`, icon: Users },
            { id: 'departments', label: 'Departments & Hostels', icon: Building2 },
            { id: 'activity', label: `Live Activity Stream (${activity.length})`, icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: ANALYTICS & RECHARTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Outpass Status Pie Chart */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Outpass Applications Status Distribution
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.outpassStatusChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {charts.outpassStatusChart.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Department Load Bar Chart */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  Outpass Requests by Academic Department
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.departmentChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="requests" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: Hourly Gate Traffic Area Chart */}
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-500" />
                Hourly Gate Exit vs. Entry Traffic Dynamics
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.gateTrafficChart}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="exits" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} name="Gate Exits" />
                    <Area type="monotone" dataKey="entries" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Re-Entries" />
                    <Legend />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, email, roll..."
                    className="pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="all">All Roles ({users.length})</option>
                  <option value="student">Students ({users.filter((u) => u.role === 'student').length})</option>
                  <option value="mentor">Mentors ({users.filter((u) => u.role === 'mentor').length})</option>
                  <option value="hod">HODs ({users.filter((u) => u.role === 'hod').length})</option>
                  <option value="warden">Wardens ({users.filter((u) => u.role === 'warden').length})</option>
                  <option value="security">Security ({users.filter((u) => u.role === 'security').length})</option>
                  <option value="admin">Admins ({users.filter((u) => u.role === 'admin').length})</option>
                </select>
              </div>

              <p className="text-xs text-slate-400">Showing {filteredUsers.length} of {users.length} accounts</p>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department / Hostel</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No user accounts match current search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.slice(0, 50).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : u.role === 'student'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {u.role}
                          </span>
                          {u.rollNumber && <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{u.rollNumber}</span>}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          <p>{u.department || 'Computer Science'}</p>
                          <p className="text-[11px] text-slate-500">{u.hostelBlock} - Room {u.roomNumber}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{u.parentName || 'Parent / Guardian'}</p>
                          <p className="text-[11px] font-mono">{u.parentPhone || '+91 98765 43210'}</p>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS & HOSTELS */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Academic Departments
              </h4>
              <div className="space-y-2 text-xs">
                {['Computer Science & Engineering', 'Electronics & Comm. Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Biotechnology'].map((dept) => (
                  <div key={dept} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{dept}</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold">Active</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-500" /> Campus Residence Blocks
              </h4>
              <div className="space-y-2 text-xs">
                {['A-Block (Boys Residence)', 'B-Block (Boys Residence)', 'C-Block (Girls Residence)', 'D-Block (Girls Residence)'].map((block) => (
                  <div key={block} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{block}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-bold">Occupied</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE ACTIVITY STREAM */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Real-Time Audit Stream</h4>
            <div className="space-y-2">
              {activity.map((act) => (
                <div key={act.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-white">{act.title}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add User Account</h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" required />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" required />
              <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="hod">HOD</option>
                <option value="warden">Warden</option>
                <option value="security">Security Officer</option>
                <option value="admin">Admin</option>
              </select>
              <input type="text" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} placeholder="Roll Number (e.g. 2310030700)" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 rounded-xl border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold">Create Account</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Student JSON Importer</h3>
            {bulkStatus && <p className="text-xs font-bold text-emerald-500">{bulkStatus}</p>}
            <textarea value={bulkJson} onChange={(e) => setBulkJson(e.target.value)} rows={10} className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsBulkModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold">Cancel</button>
              <button onClick={handleBulkImport} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Execute Import</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete User Account?</h3>
            <p className="text-xs text-slate-500">Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{userToDelete.name}</strong> ({userToDelete.email})?</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 rounded-xl border text-xs">Cancel</button>
              <button onClick={() => handleDeleteUser(userToDelete.id)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
