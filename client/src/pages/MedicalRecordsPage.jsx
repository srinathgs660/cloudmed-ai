import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  FileText,
  Plus,
  Calendar,
  Stethoscope,
  User,
  Search,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';
import { getCached, setCached, invalidateCache } from '../services/clientCache';

export const MedicalRecordsPage = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState(() => getCached('medical_records') || []);
  const [patients, setPatients] = useState(() => getCached('patients') || []);
  const [loading, setLoading] = useState(() => !getCached('medical_records'));

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    followUpDate: '',
  });

  useEffect(() => {
    fetchRecords();
    if (user?.role !== 'PATIENT') {
      fetchPatients();
    }
  }, []);

  const fetchRecords = async () => {
    try {
      if (!records.length) setLoading(true);
      const res = await api.get('/medical-records');
      const list = res.data.data || [];
      setRecords(list);
      setCached('medical_records', list);
    } catch (e) {
      console.error('Failed to load records:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      const list = res.data.data || [];
      setPatients(list);
      setCached('patients', list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, patientId: prev.patientId || list[0]._id }));
      }
    } catch (e) {}
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/medical-records', {
        ...formData,
        symptoms: formData.symptoms.split(',').map((s) => s.trim()),
      });
      invalidateCache('medical_records');
      setModalOpen(false);
      setFormData({
        patientId: patients[0]?._id || '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        followUpDate: '',
      });
      fetchRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Medical Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official consultation records, diagnostic evaluations, and physician treatment directives.
          </p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Record Clinical Visit
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <Loader message="Fetching clinical records..." />
      ) : records.length === 0 ? (
        <EmptyState
          title="No medical records on file"
          description="Clinical entries added by physicians during consultations will be archived here."
        />
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <Card key={rec._id} className="hover:border-teal-400">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      Diagnosis
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{rec.diagnosis}</h3>
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-3">
                    <span>
                      Patient: <strong>{rec.patientId?.userId?.name || 'Patient'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Attending: <strong>Dr. {rec.doctorId?.userId?.name || 'Physician'}</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(rec.visitDate).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                {rec.followUpDate && (
                  <Badge variant="warning" className="self-start">
                    Follow-up: {new Date(rec.followUpDate).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {/* Symptoms */}
              {rec.symptoms && rec.symptoms.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-400 mr-1">Observed Symptoms:</span>
                  {rec.symptoms.map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Treatment */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Treatment Plan & Clinical Directives:
                </span>
                <p className="text-slate-700 leading-relaxed">{rec.treatment}</p>
                {rec.notes && (
                  <p className="text-slate-500 mt-2 pt-2 border-t border-slate-200 text-[11px]">
                    <strong>Physician Notes:</strong> {rec.notes}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Clinical Consultation"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Patient</label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            >
              <option value="">Select Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} ({p.bloodGroup}, Age: {p.age})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Clinical Diagnosis</label>
            <input
              type="text"
              required
              placeholder="e.g. Essential Hypertension Stage 1"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Symptoms (comma-separated)</label>
            <input
              type="text"
              required
              placeholder="Headaches, Dyspnea on exertion, Palpitations"
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Treatment Plan</label>
            <textarea
              required
              rows={3}
              placeholder="Prescribed medicine regimens, dietary instructions, and physical restrictions..."
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Clinical Notes (Optional)</label>
              <input
                type="text"
                placeholder="Laboratory follow-up notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Save Medical Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
