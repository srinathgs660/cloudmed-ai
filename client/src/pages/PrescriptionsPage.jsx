import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Pill,
  Plus,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';

export const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [medicines, setMedicines] = useState([
    { medicine: '', dosage: '500 mg', frequency: '2 times/day', duration: '5 days', instructions: 'After food' },
  ]);

  useEffect(() => {
    fetchPrescriptions();
    if (user?.role !== 'PATIENT') {
      fetchPatients();
    }
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data || []);
    } catch (e) {
      console.error('Failed to load prescriptions:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedPatientId(res.data.data[0]._id);
      }
    } catch (e) {}
  };

  const handleAddMedicineRow = () => {
    setMedicines([
      ...medicines,
      { medicine: '', dosage: '10 mg', frequency: 'Once daily', duration: '14 days', instructions: 'After food' },
    ]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/prescriptions', {
        patientId: selectedPatientId,
        medicines,
        instructions: generalInstructions,
      });
      setModalOpen(false);
      setMedicines([{ medicine: '', dosage: '500 mg', frequency: '2 times/day', duration: '5 days', instructions: 'After food' }]);
      setGeneralInstructions('');
      fetchPrescriptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Prescription Regimens</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical schedules, dosages, duration, and patient compliance instructions.
          </p>
        </div>
        {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            Issue New Prescription
          </Button>
        )}
      </div>

      {loading ? (
        <Loader message="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions found"
          description="Prescriptions issued by attending physicians will appear here."
        />
      ) : (
        <div className="space-y-6">
          {prescriptions.map((pr) => (
            <Card key={pr._id} className="hover:border-teal-400">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Prescription for: {pr.patientId?.userId?.name || 'Patient'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Prescribed by: Dr. {pr.doctorId?.userId?.name || 'Physician'} ({pr.doctorId?.userId?.specialization || 'Consultant'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(pr.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                    title="Print Prescription"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Medicine Name</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pr.medicines?.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-bold text-slate-900">{m.medicine}</td>
                        <td className="py-3 px-3">{m.dosage}</td>
                        <td className="py-3 px-3">{m.frequency}</td>
                        <td className="py-3 px-3">{m.duration}</td>
                        <td className="py-3 px-3 text-slate-500">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pr.instructions && (
                <div className="mt-4 p-3 rounded-lg bg-teal-50/40 border border-teal-100 text-xs text-teal-800">
                  <strong>General Guidance:</strong> {pr.instructions}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Issue Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Clinical Prescription"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Select Patient</label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            >
              <option value="">Choose Patient</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.userId?.name} ({p.bloodGroup}, Age: {p.age})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider">
                Prescription Items ({medicines.length})
              </label>
              <button
                type="button"
                onClick={handleAddMedicineRow}
                className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((row, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <label className="block text-[10px] text-slate-400 font-bold">Medicine</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol"
                      value={row.medicine}
                      onChange={(e) => handleMedicineChange(idx, 'medicine', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 font-bold">Dosage</label>
                    <input
                      type="text"
                      placeholder="500 mg"
                      value={row.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 font-bold">Freq</label>
                    <input
                      type="text"
                      placeholder="2x/day"
                      value={row.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-[10px] text-slate-400 font-bold">Duration</label>
                    <input
                      type="text"
                      placeholder="5 days"
                      value={row.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs"
                    />
                  </div>
                  <div className="col-span-1 pt-3 text-right">
                    <button
                      type="button"
                      disabled={medicines.length === 1}
                      onClick={() => handleRemoveMedicineRow(idx)}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">General Pharmacological Instructions</label>
            <input
              type="text"
              placeholder="e.g. Drink plenty of water and do not skip morning doses."
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Issue Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
