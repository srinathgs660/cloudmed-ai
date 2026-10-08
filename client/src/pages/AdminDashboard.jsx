import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Users,
  UserCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Activity,
} from 'lucide-react';
import { Card, Badge, Loader } from '../components/UI';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const STATUS_COLORS = ['#f59e0b', '#0284c7', '#10b981', '#ef4444'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Compiling real-time hospital analytics..." />;

  const { stats, charts, recentActivity } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Executive Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics across patients, clinical staff, scheduling, and AI risk pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/ai-insights"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition-colors"
          >
            <Brain className="w-4 h-4 text-teal-600" />
            View AI Insights
          </Link>
          <Link
            to="/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Manage Schedule
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-teal-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalPatients || 0}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +12% MoM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active hospital records</p>
        </Card>

        <Card className="hover:border-sky-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctors</span>
            <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.totalDoctors || 0}
            </span>
            <span className="text-[11px] font-semibold text-sky-600">6 Specialties</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full-time clinical consultants</p>
        </Card>

        <Card className="hover:border-amber-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Appointments Today</span>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.todayAppointments || 0}
            </span>
            <span className="text-[11px] font-semibold text-amber-600">
              {stats?.pendingAppointments || 0} Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled patient visits</p>
        </Card>

        <Card className="hover:border-rose-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">High-Risk Patients</span>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats?.highRiskPatients || 0}
            </span>
            <Badge variant="danger">AI Flagged</Badge>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires close clinical monitoring</p>
        </Card>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Appointment Trend */}
        <Card title="Monthly Appointment Trend" subtitle="Patient visits booked vs. completed consultations">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.monthlyTrend || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Line type="monotone" dataKey="appointments" stroke="#0d9488" strokeWidth={2.5} name="Booked" />
                <Line type="monotone" dataKey="completed" stroke="#0284c7" strokeWidth={2} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Patients by Department */}
        <Card title="Appointments by Department" subtitle="Distribution of consultations across specialties">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.appointmentsByDepartment || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointments by Status */}
        <Card title="Appointment Status Pipeline" subtitle="Proportion of pending, confirmed, and completed visits">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.appointmentsByStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.appointmentsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Health Risk Distribution */}
        <Card title="AI Health Risk Distribution" subtitle="Random Forest classification of evaluated cohort">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.aiRiskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts?.aiRiskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Appointments & System Activity Table */}
      <Card
        title="Recent Activity & Scheduled Visits"
        subtitle="Latest transactions processed through the cloud API"
        action={
          <Link to="/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            All Appointments <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">AI Priority</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {(recentActivity || []).map((act) => (
                <tr key={act._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {act.patientId?.userId?.name || 'Walk-in Patient'}
                  </td>
                  <td className="py-3.5 px-4">{act.doctorId?.userId?.name || 'Assigned Doctor'}</td>
                  <td className="py-3.5 px-4 text-slate-500">{act.departmentId?.name || 'General'}</td>
                  <td className="py-3.5 px-4">
                    {act.date} <span className="text-slate-400">at {act.time}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        act.priority === 'HIGH' ? 'danger' : act.priority === 'MEDIUM' ? 'warning' : 'success'
                      }
                    >
                      {act.priority}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        act.status === 'Confirmed'
                          ? 'info'
                          : act.status === 'Completed'
                          ? 'success'
                          : act.status === 'Cancelled'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {act.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
