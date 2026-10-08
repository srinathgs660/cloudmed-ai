import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Stethoscope,
  Building2,
  Search,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';
import { getCached, setCached, invalidateCache } from '../services/clientCache';

export const AppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(() => getCached('appointments') || []);
  const [doctors, setDoctors] = useState(() => getCached('doctors') || []);
  const [departments, setDepartments] = useState(() => getCached('departments') || []);
  const [loading, setLoading] = useState(() => !getCached('appointments'));

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Book Modal
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [bookingForm, setBookingForm] = useState({
    departmentId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    reason: '',
    symptomSeverity: 2,
    painLevel: 3,
    emergencyIndicator: false,
  });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, priorityFilter]);

  const fetchMetadata = async () => {
    try {
      const [docRes, deptRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/departments'),
      ]);
      const docs = docRes.data.data || [];
      const depts = deptRes.data.data || [];
      setDoctors(docs);
      setDepartments(depts);
      setCached('doctors', docs);
      setCached('departments', depts);
      if (depts.length > 0) {
        setBookingForm((prev) => ({ ...prev, departmentId: prev.departmentId || depts[0]._id }));
      }
    } catch (e) {}
  };

  const fetchAppointments = async () => {
    try {
      if (!appointments.length && (statusFilter !== 'All' || priorityFilter !== 'All')) {
        setLoading(true);
      }
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const res = await api.get('/appointments', { params });
      const list = res.data.data || [];
      setAppointments(list);
      if (statusFilter === 'All' && priorityFilter === 'All') {
        setCached('appointments', list);
      }
    } catch (e) {
      console.error('Failed to load appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      await api.post('/appointments', bookingForm);
      invalidateCache('appointments');
      setBookModalOpen(false);
      setBookingForm({
        ...bookingForm,
        reason: '',
        symptomSeverity: 2,
        painLevel: 3,
        emergencyIndicator: false,
      });
      fetchAppointments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to book appointment. Double booking detected.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      invalidateCache('appointments');
      fetchAppointments();
    } catch (e) {
      alert('Status update failed');
    }
  };

  const filteredDoctors = bookingForm.departmentId
    ? doctors.filter((d) => d.departmentId?._id === bookingForm.departmentId || d.departmentId === bookingForm.departmentId)
    : doctors;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage consultations, double-booking validation, and AI priority triage rankings.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setBookModalOpen(true)}>
          Book Consultation
        </Button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-300 text-xs focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>AI Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-300 text-xs focus:ring-teal-500"
            >
              <option value="All">All Priorities</option>
              <option value="HIGH">HIGH Priority</option>
              <option value="MEDIUM">MEDIUM Priority</option>
              <option value="LOW">LOW Priority</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Total: <strong>{appointments.length}</strong> Appointments
        </span>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <Loader message="Fetching appointment records..." />
        ) : appointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="Schedule a new consultation to populate the clinical queue."
            action={<Button size="sm" onClick={() => setBookModalOpen(true)}>Book Now</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Clinical Reason</th>
                  <th className="py-3 px-4">AI Priority</th>
                  <th className="py-3 px-4">Status</th>
                  {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
                    <th className="py-3 px-4 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {a.date} <span className="text-slate-400 font-normal">at {a.time}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {a.patientId?.userId?.name || 'Patient'}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {a.patientId?.userId?.phone || 'Direct Patient'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {a.doctorId?.userId?.name || 'Physician'}
                      <div className="text-[10px] text-teal-600">
                        {a.departmentId?.name || 'General'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={a.reason}>
                      {a.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          a.priority === 'HIGH'
                            ? 'danger'
                            : a.priority === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {a.priority}
                      </Badge>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Score: {(a.priorityScore * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          a.status === 'Confirmed'
                            ? 'info'
                            : a.status === 'Completed'
                            ? 'success'
                            : a.status === 'Cancelled'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {a.status}
                      </Badge>
                    </td>

                    {(user?.role === 'ADMIN' || user?.role === 'DOCTOR') && (
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {a.status === 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(a._id, 'Confirmed')}
                            className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 text-[11px] font-semibold"
                          >
                            Confirm
                          </button>
                        )}
                        {a.status === 'Confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(a._id, 'Completed')}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold"
                          >
                            Complete
                          </button>
                        )}
                        {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(a._id, 'Cancelled')}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title="Schedule Clinical Consultation"
        maxWidth="max-w-xl"
      >
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">1. Department</label>
              <select
                required
                value={bookingForm.departmentId}
                onChange={(e) => setBookingForm({ ...bookingForm, departmentId: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">2. Physician</label>
              <select
                required
                value={bookingForm.doctorId}
                onChange={(e) => setBookingForm({ ...bookingForm, doctorId: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="">Select Doctor</option>
                {filteredDoctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.userId?.name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">3. Consultation Date</label>
              <input
                type="date"
                required
                value={bookingForm.date}
                onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
              </input>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">4. Available Time Slot</label>
              <select
                value={bookingForm.time}
                onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                {['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">5. Chief Complaint / Reason</label>
            <textarea
              required
              rows={2}
              placeholder="Describe symptoms, duration, and purpose of consultation..."
              value={bookingForm.reason}
              onChange={(e) => setBookingForm({ ...bookingForm, reason: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          {/* AI Priority Triage Inputs */}
          <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-200 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 flex items-center gap-1.5">
              <span>🤖</span> AI Priority Triage Parameters
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">
                  Symptom Severity (1 Mild - 5 Severe): {bookingForm.symptomSeverity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={bookingForm.symptomSeverity}
                  onChange={(e) => setBookingForm({ ...bookingForm, symptomSeverity: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>
              <div>
                <label className="block text-slate-600 text-[11px] font-medium mb-1">
                  Discomfort / Pain (1 - 10): {bookingForm.painLevel}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={bookingForm.painLevel}
                  onChange={(e) => setBookingForm({ ...bookingForm, painLevel: Number(e.target.value) })}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="emergencyFlag"
                checked={bookingForm.emergencyIndicator}
                onChange={(e) => setBookingForm({ ...bookingForm, emergencyIndicator: e.target.checked })}
                className="rounded text-rose-600"
              />
              <label htmlFor="emergencyFlag" className="text-slate-700 font-semibold text-[11px]">
                Urgent distress / Acute emergency flag
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Confirm & Book Appointment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
