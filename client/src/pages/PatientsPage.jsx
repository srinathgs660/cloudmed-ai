import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Calendar,
  FileText,
  Pill,
  Brain,
  FolderOpen,
  Activity,
  Check,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState, RiskCard } from '../components/UI';
import { getCached, setCached, invalidateCache } from '../services/clientCache';

export const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState(() => getCached('patients') || []);
  const [loading, setLoading] = useState(() => !getCached('patients'));
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');

  // Modals state
  const [viewPatientModal, setViewPatientModal] = useState(false);
  const [addEditModal, setAddEditModal] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    age: 35,
    bloodGroup: 'O+',
    address: '',
    bmi: 24.5,
    smokingStatus: false,
    allergies: '',
    existingConditions: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [search, riskFilter, bloodGroupFilter]);

  const fetchPatients = async () => {
    try {
      if (!patients.length && (search || riskFilter !== 'All' || bloodGroupFilter)) {
        setLoading(true);
      }
      const params = {};
      if (search) params.search = search;
      if (riskFilter !== 'All') params.riskLevel = riskFilter;
      if (bloodGroupFilter) params.bloodGroup = bloodGroupFilter;

      const res = await api.get('/patients', { params });
      const list = res.data.data || [];
      setPatients(list);
      if (!search && riskFilter === 'All' && !bloodGroupFilter) {
        setCached('patients', list);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (id) => {
    try {
      setViewLoading(true);
      setViewPatientModal(true);
      const res = await api.get(`/patients/${id}`);
      setSelectedPatientData(res.data.data);
    } catch (err) {
      alert('Failed to load patient records');
    } finally {
      setViewLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      age: 35,
      bloodGroup: 'O+',
      address: '',
      bmi: 24.5,
      smokingStatus: false,
      allergies: '',
      existingConditions: '',
    });
    setAddEditModal(true);
  };

  const handleOpenEdit = (pt) => {
    setIsEditing(true);
    setSelectedPatientData({ patient: pt });
    setFormData({
      name: pt.userId?.name || '',
      email: pt.userId?.email || '',
      phone: pt.userId?.phone || '',
      gender: pt.gender || 'male',
      age: pt.age || 35,
      bloodGroup: pt.bloodGroup || 'O+',
      address: pt.address || '',
      bmi: pt.bmi || 24.5,
      smokingStatus: Boolean(pt.smokingStatus),
      allergies: (pt.allergies || []).join(', '),
      existingConditions: (pt.existingConditions || []).join(', '),
    });
    setAddEditModal(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        existingConditions: formData.existingConditions ? formData.existingConditions.split(',').map((s) => s.trim()) : [],
      };

      if (isEditing) {
        await api.put(`/patients/${selectedPatientData.patient._id}`, payload);
      } else {
        await api.post('/patients', payload);
      }

      invalidateCache('patients');
      setAddEditModal(false);
      fetchPatients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save patient');
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this patient account?')) return;
    try {
      await api.delete(`/patients/${id}`);
      invalidateCache('patients');
      fetchPatients();
    } catch (err) {
      alert('Failed to deactivate patient');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain longitudinal patient records, clinical allergies, and AI risk status.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button icon={Plus} onClick={handleOpenAdd}>
            Register New Patient
          </Button>
        )}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>AI Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="All">All Tiers</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Blood:</span>
            <select
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Types</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <Card>
        {loading ? (
          <Loader message="Loading patient records..." />
        ) : patients.length === 0 ? (
          <EmptyState
            title="No patients match your criteria"
            description="Try modifying search keywords or clearing risk tier filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">AI Risk Level</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((pt) => {
                  const riskLevel = pt.latestRiskScore?.level || 'Not Assessed';
                  return (
                    <tr key={pt._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {pt.userId?.name || 'Patient'}
                        <div className="text-[10px] font-normal text-slate-400">
                          {pt.userId?.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {pt.age || '—'} yrs • <span className="capitalize">{pt.gender}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-700">{pt.bloodGroup}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {pt.userId?.phone || 'No phone'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            riskLevel === 'High'
                              ? 'danger'
                              : riskLevel === 'Medium'
                              ? 'warning'
                              : riskLevel === 'Low'
                              ? 'success'
                              : 'neutral'
                          }
                        >
                          {riskLevel} Risk
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleViewPatient(pt._id)}
                          title="View Full Profile"
                          className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user?.role === 'ADMIN' && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(pt)}
                              title="Edit Patient"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePatient(pt._id)}
                              title="Deactivate Patient"
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Comprehensive Patient Profile Modal */}
      <Modal
        isOpen={viewPatientModal}
        onClose={() => setViewPatientModal(false)}
        title="Comprehensive Electronic Health Profile"
        maxWidth="max-w-3xl"
      >
        {viewLoading || !selectedPatientData ? (
          <Loader message="Retrieving full clinical history..." />
        ) : (
          <div className="space-y-6 text-xs">
            {/* Header Identity */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedPatientData.patient?.userId?.name}
                </h3>
                <p className="text-slate-500 mt-0.5">
                  {selectedPatientData.patient?.userId?.email} • {selectedPatientData.patient?.userId?.phone}
                </p>
                <p className="text-slate-400 mt-1">
                  Address: {selectedPatientData.patient?.address || 'Metro Area'}
                </p>
              </div>
              <div className="text-right">
                <Badge
                  variant={
                    selectedPatientData.patient?.latestRiskScore?.level === 'High'
                      ? 'danger'
                      : selectedPatientData.patient?.latestRiskScore?.level === 'Medium'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {selectedPatientData.patient?.latestRiskScore?.level || 'Not Assessed'} Risk
                </Badge>
                <p className="text-[10px] text-slate-400 mt-1">
                  Blood Group: <strong>{selectedPatientData.patient?.bloodGroup}</strong> | BMI:{' '}
                  <strong>{selectedPatientData.patient?.bmi}</strong>
                </p>
              </div>
            </div>

            {/* Medical Info Tabs / Sections */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Known Allergies:
                </span>
                <p className="text-slate-600">
                  {(selectedPatientData.patient?.allergies || []).join(', ') || 'None documented.'}
                </p>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Chronic / Existing Conditions:
                </span>
                <p className="text-slate-600">
                  {(selectedPatientData.patient?.existingConditions || []).join(', ') || 'None documented.'}
                </p>
              </div>
            </div>

            {/* Appointment History */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" /> Appointment History (
                {selectedPatientData.appointments?.length || 0})
              </h4>
              {selectedPatientData.appointments?.length === 0 ? (
                <p className="text-slate-400">No scheduled visits on file.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {selectedPatientData.appointments?.map((a) => (
                    <div key={a._id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{a.date} at {a.time}</span> • Dr. {a.doctorId?.userId?.name}
                        <p className="text-slate-500 text-[11px]">{a.reason}</p>
                      </div>
                      <Badge variant={a.status === 'Completed' ? 'success' : 'info'}>{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical History & Diagnoses */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-600" /> Diagnoses & Clinical Records (
                {selectedPatientData.medicalRecords?.length || 0})
              </h4>
              {selectedPatientData.medicalRecords?.length === 0 ? (
                <p className="text-slate-400">No medical diagnosis records.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {selectedPatientData.medicalRecords?.map((r) => (
                    <div key={r._id} className="p-2.5">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{r.diagnosis}</span>
                        <span className="text-slate-400">{new Date(r.visitDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 mt-1">Treatment: {r.treatment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescriptions */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" /> Active Prescriptions (
                {selectedPatientData.prescriptions?.length || 0})
              </h4>
              {selectedPatientData.prescriptions?.length === 0 ? (
                <p className="text-slate-400">No prescriptions issued.</p>
              ) : (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                  {selectedPatientData.prescriptions?.map((pr) => (
                    <div key={pr._id} className="p-2.5">
                      <span className="font-bold text-slate-700">Dr. {pr.doctorId?.userId?.name}</span>
                      <ul className="mt-1 list-disc list-inside text-slate-600">
                        {pr.medicines?.map((m, i) => (
                          <li key={i}>
                            <strong>{m.medicine}</strong> ({m.dosage}) - {m.frequency} for {m.duration} [{m.instructions}]
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Patient Modal */}
      <Modal
        isOpen={addEditModal}
        onClose={() => setAddEditModal(false)}
        title={isEditing ? 'Edit Patient Record' : 'Register New Patient'}
      >
        <form onSubmit={handleSavePatient} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                disabled={isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">BMI</label>
              <input
                type="number"
                step="0.1"
                value={formData.bmi}
                onChange={(e) => setFormData({ ...formData, bmi: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="smokingStatus"
                checked={formData.smokingStatus}
                onChange={(e) => setFormData({ ...formData, smokingStatus: e.target.checked })}
                className="rounded text-teal-600"
              />
              <label htmlFor="smokingStatus" className="font-bold text-slate-700">Active Smoker</label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Allergies (comma-separated)</label>
            <input
              type="text"
              placeholder="Penicillin, Sulfa drugs, Peanuts"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Existing Conditions (comma-separated)</label>
            <input
              type="text"
              placeholder="Hypertension, Asthma, Diabetes"
              value={formData.existingConditions}
              onChange={(e) => setFormData({ ...formData, existingConditions: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAddEditModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {isEditing ? 'Save Changes' : 'Create Patient'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
