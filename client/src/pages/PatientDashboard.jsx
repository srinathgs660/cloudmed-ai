import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  FileText,
  Brain,
  Pill,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';
import { Card, Badge, Button, Loader, RiskCard } from '../components/UI';
import { getCached, setCached } from '../services/clientCache';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(() => getCached('patient_dashboard') || null);
  const [loading, setLoading] = useState(() => !getCached('patient_dashboard'));

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      if (!data) setLoading(true);
      const res = await api.get('/dashboard/patient');
      setData(res.data);
      setCached('patient_dashboard', res.data, 30000);
    } catch (err) {
      console.error('Patient dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Accessing your patient health records..." />;

  const { patient, upcomingAppointment, recentRecords, recentReports, latestAssessment } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-700 to-sky-700 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-teal-200">Patient Wellness Hub</span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Welcome Back, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs text-teal-100/90 mt-1 max-w-xl leading-relaxed">
            Your personalized clinical portal for managing visits, reviewing prescriptions, and evaluating cardiovascular and metabolic wellness using AI.
          </p>
        </div>
        <Link to="/appointments">
          <Button variant="outline" className="bg-white text-teal-800 border-none hover:bg-teal-50 font-bold shrink-0">
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Upcoming Appointment & Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointment */}
        <div className="lg:col-span-2">
          <Card title="Upcoming Appointment" subtitle="Your next scheduled hospital consultation">
            {upcomingAppointment ? (
              <div className="p-5 rounded-xl bg-teal-50/50 border border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-teal-600 text-white shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {upcomingAppointment.doctorId?.userId?.name || 'Specialist Physician'}
                    </h4>
                    <p className="text-xs text-teal-700 font-semibold mt-0.5">
                      {upcomingAppointment.departmentId?.name || 'Clinical Care'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {upcomingAppointment.date} at {upcomingAppointment.time}
                      </span>
                      <Badge variant={upcomingAppointment.status === 'Confirmed' ? 'info' : 'warning'}>
                        {upcomingAppointment.status}
                      </Badge>
                      <Badge variant={upcomingAppointment.priority === 'HIGH' ? 'danger' : 'neutral'}>
                        {upcomingAppointment.priority} Priority
                      </Badge>
                    </div>
                  </div>
                </div>
                <Link to="/appointments">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No upcoming visits scheduled.{' '}
                <Link to="/appointments" className="text-teal-600 font-semibold hover:underline">
                  Schedule one now
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card title="Quick Actions" subtitle="Portal shortcuts">
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/appointments"
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex flex-col items-center text-center"
              >
                <Calendar className="w-5 h-5 text-teal-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">Appointments</span>
              </Link>
              <Link
                to="/medical-records"
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex flex-col items-center text-center"
              >
                <FileText className="w-5 h-5 text-sky-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">Records</span>
              </Link>
              <Link
                to="/ai-assessment"
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex flex-col items-center text-center"
              >
                <Brain className="w-5 h-5 text-purple-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">AI Screening</span>
              </Link>
              <Link
                to="/prescriptions"
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex flex-col items-center text-center"
              >
                <Pill className="w-5 h-5 text-emerald-600 mb-2" />
                <span className="text-xs font-bold text-slate-800">Prescriptions</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Latest AI Health Risk Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Latest AI Risk Assessment</h3>
            <p className="text-xs text-slate-500">Evaluated by CloudMed machine learning microservice</p>
          </div>
          <Link to="/ai-assessment">
            <Button size="sm" variant="outline" icon={Brain}>
              Run New Assessment
            </Button>
          </Link>
        </div>

        {latestAssessment && latestAssessment.result !== 'Not Assessed' ? (
          <RiskCard
            assessment={{
              riskLevel: latestAssessment.result,
              probability: latestAssessment.probability || 0.75,
              message: latestAssessment.message || 'Latest risk metrics computed successfully.',
              keyFactors: latestAssessment.keyFactors || ['Vitals within expected physiological ranges.'],
              disclaimer: latestAssessment.disclaimer,
            }}
          />
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-white text-center">
            <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No Assessment Recorded Yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Answer 7 simple health questions (BP, glucose, BMI) to receive an immediate AI-powered educational risk assessment.
            </p>
            <Link to="/ai-assessment" className="inline-block mt-4">
              <Button size="sm">Start AI Health Assessment</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Medical Records & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Medical Records */}
        <Card
          title="Recent Consultation Records"
          subtitle="Diagnoses and treatment regimens recorded by doctors"
          action={
            <Link to="/medical-records" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View All
            </Link>
          }
        >
          {(!recentRecords || recentRecords.length === 0) ? (
            <div className="text-center py-8 text-xs text-slate-400">No consultation records recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRecords.map((r) => (
                <div key={r._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">{r.diagnosis}</h5>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{r.treatment}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Diagnostic Reports */}
        <Card
          title="Diagnostic Reports & Documents"
          subtitle="Archived clinical lab tests and scans"
          action={
            <Link to="/reports" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View All
            </Link>
          }
        >
          {(!recentReports || recentReports.length === 0) ? (
            <div className="text-center py-8 text-xs text-slate-400">No documents uploaded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentReports.map((rep) => (
                <div key={rep._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4 text-teal-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rep.fileName}</p>
                      <p className="text-[10px] text-slate-400">{rep.reportType}</p>
                    </div>
                  </div>
                  <a
                    href={rep.cloudinaryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-teal-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
