import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  UserCheck,
  Search,
  Plus,
  Filter,
  Clock,
  DollarSign,
  Award,
  Edit2,
  Trash2,
  Calendar,
  Building2,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';
import { getCached, setCached, invalidateCache } from '../services/clientCache';

export const DoctorsPage = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState(() => getCached('doctors') || []);
  const [departments, setDepartments] = useState(() => getCached('departments') || []);
  const [loading, setLoading] = useState(() => !getCached('doctors'));
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: '',
    specialization: '',
    qualification: '',
    experience: 5,
    consultationFee: 75,
    bio: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [search, departmentFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      const list = res.data.data || [];
      setDepartments(list);
      setCached('departments', list);
    } catch (e) {}
  };

  const fetchDoctors = async () => {
    try {
      if (!doctors.length && (search || departmentFilter)) {
        setLoading(true);
      }
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.department = departmentFilter;

      const res = await api.get('/doctors', { params });
      const list = res.data.data || [];
      setDoctors(list);
      if (!search && !departmentFilter) {
        setCached('doctors', list);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      departmentId: departments[0]?._id || '',
      specialization: '',
      qualification: 'MBBS, MD',
      experience: 5,
      consultationFee: 80,
      bio: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setIsEditing(true);
    setSelectedDoctorId(doc._id);
    setFormData({
      name: doc.userId?.name || '',
      email: doc.userId?.email || '',
      phone: doc.userId?.phone || '',
      departmentId: doc.departmentId?._id || '',
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experience: doc.experience || 5,
      consultationFee: doc.consultationFee || 75,
      bio: doc.bio || '',
    });
    setModalOpen(true);
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/doctors/${selectedDoctorId}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      invalidateCache('doctors');
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save doctor profile');
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Deactivate this doctor profile?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      invalidateCache('doctors');
      fetchDoctors();
    } catch (err) {
      alert('Failed to deactivate doctor');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Physicians & Specialists</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse medical specialists, check consultation fee schedules, and verify active clinical availability.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button icon={Plus} onClick={handleOpenAdd}>
            Add Medical Staff
          </Button>
        )}
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search physician or specialty..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 w-full md:w-auto">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="py-1.5 px-3 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Clinical Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <Loader message="Loading physician roster..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No physicians found"
          description="Try broadening search filters or selecting all departments."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <Card key={doc._id} className="flex flex-col justify-between hover:border-teal-400">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {doc.userId?.name ? doc.userId.name.charAt(4) || 'D' : 'D'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {doc.userId?.name}
                      </h3>
                      <p className="text-xs font-semibold text-teal-600">
                        {doc.specialization}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {doc.qualification}
                      </span>
                    </div>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {doc.bio || 'Senior medical specialist dedicated to patient wellness and evidenced therapies.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Clinical Experience
                    </span>
                    <span className="font-bold text-slate-800">{doc.experience} Years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Consultation Fee
                    </span>
                    <span className="font-bold text-teal-700">${doc.consultationFee}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Department
                    </span>
                    <span className="font-medium text-slate-700">{doc.departmentId?.name || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available Mon-Fri
                </span>
                <span className="text-[11px] text-slate-400">
                  {doc.userId?.email}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Doctor Profile' : 'Add New Clinical Staff'}
      >
        <form onSubmit={handleSaveDoctor} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Full Name (with Dr. prefix)</label>
            <input
              type="text"
              required
              placeholder="Dr. Samantha White"
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
                placeholder="doctor.name@cloudmed.demo"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+1 555-0192"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Specialization</label>
              <input
                type="text"
                required
                placeholder="Cardiovascular Diagnostics"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Qualification</label>
              <input
                type="text"
                placeholder="MBBS, MD"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Experience (Yrs)</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Fee ($)</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Professional Bio</label>
            <textarea
              rows={2}
              placeholder="Clinical profile summary..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {isEditing ? 'Save Changes' : 'Add Doctor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
