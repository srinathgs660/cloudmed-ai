import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  Users,
  FilePlus,
  Brain,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Card, Badge, Button, Loader } from '../components/UI';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/doctor');
      setData(res.data);
    } catch (err) {
      console.error('Doctor dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchDashboard();
    } catch (e) {
      alert('Failed to update status');
    }
  };

  if (loading) return <Loader message="Loading doctor clinical queue..." />;

  const { doctor, stats, todayAppointments } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good Morning, {user?.name || 'Doctor'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department of {doctor?.departmentId?.name || 'Medicine'} • {stats?.todayAppointmentsCount || 0} Consultations Today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/ai-assessment">
            <Button variant="outline" size="sm" icon={Brain}>
              AI Risk Evaluator
            </Button>
          </Link>
          <Link to="/medical-records">
            <Button size="sm" icon={FilePlus}>
              New Medical Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Patient Risk Overview Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="border-rose-200 bg-rose-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">High Risk Patients</span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-800">
            {stats?.riskOverview?.high || 0}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1">Identified via AI Random Forest Model</p>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Medium Risk Patients</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-800">
            {stats?.riskOverview?.medium || 0}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1">Requires lifestyle & glycemic follow-up</p>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Low Risk Patients</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-800">
            {stats?.riskOverview?.low || 0}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Routine wellness & preventative tier</p>
        </Card>
      </div>

      {/* Quick Action Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link to="/patients" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Patient Roster</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Search profiles</span>
        </Link>

        <Link to="/medical-records" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
            <FilePlus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Create Record</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Diagnosis & Notes</span>
        </Link>

        <Link to="/ai-assessment" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">AI Assessment</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Triage & Predict</span>
        </Link>

        <Link to="/reports" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <UploadCloud className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Upload Report</span>
          <span className="text-[10px] text-slate-400 mt-0.5">PDFs & Scans</span>
        </Link>
      </div>

      {/* Today's Appointments Queue */}
      <Card
        title="Today's Consultation Schedule"
        subtitle="Manage confirmations and consultation status"
        action={
          <Link to="/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            All Appointments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {(!todayAppointments || todayAppointments.length === 0) ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No remaining consultations scheduled for today.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppointments.map((appt) => (
              <div key={appt._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 font-bold text-xs text-slate-700 whitespace-nowrap">
                    {appt.time}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {appt.patientId?.userId?.name || 'Patient'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{appt.reason}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={appt.priority === 'HIGH' ? 'danger' : appt.priority === 'MEDIUM' ? 'warning' : 'success'}>
                        {appt.priority} Priority
                      </Badge>
                      <Badge variant={appt.status === 'Confirmed' ? 'info' : appt.status === 'Completed' ? 'success' : 'warning'}>
                        {appt.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {appt.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(appt._id, 'Confirmed')}
                    >
                      Confirm
                    </Button>
                  )}
                  {appt.status === 'Confirmed' && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUpdateStatus(appt._id, 'Completed')}
                    >
                      Mark Completed
                    </Button>
                  )}
                  <Link to={`/patients/${appt.patientId?._id}`}>
                    <Button size="sm" variant="outline">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
