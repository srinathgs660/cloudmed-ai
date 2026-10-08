import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  Plus,
  Edit2,
  Users,
  Activity,
  HeartPulse,
  Stethoscope,
  Brain,
  Baby,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Card, Badge, Button, Modal, Loader, EmptyState } from '../components/UI';

const DEPT_ICONS = {
  HeartPulse: HeartPulse,
  Stethoscope: Stethoscope,
  Brain: Brain,
  Activity: Activity,
  Baby: Baby,
  Sparkles: Sparkles,
};

export const DepartmentsPage = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headDoctorName: '',
    status: 'Active',
    iconName: 'Activity',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch (e) {
      console.error('Failed to load departments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      headDoctorName: '',
      status: 'Active',
      iconName: 'Activity',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setIsEditing(true);
    setSelectedDeptId(dept._id);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      headDoctorName: dept.headDoctorName || '',
      status: dept.status || 'Active',
      iconName: dept.iconName || 'Activity',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/departments/${selectedDeptId}`, formData);
      } else {
        await api.post('/departments', formData);
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (e) {
      alert('Failed to update department status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Departments & Centers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hospital departments, department heads, and physician staffing distribution.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button icon={Plus} onClick={handleOpenAdd}>
            Add Department
          </Button>
        )}
      </div>

      {loading ? (
        <Loader message="Loading hospital departments..." />
      ) : departments.length === 0 ? (
        <EmptyState title="No departments found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => {
            const IconComponent = DEPT_ICONS[dept.iconName] || Activity;
            return (
              <Card key={dept._id} className="flex flex-col justify-between hover:border-teal-400">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <Badge variant={dept.status === 'Active' ? 'success' : 'neutral'}>
                      {dept.status}
                    </Badge>
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900 text-base">{dept.name}</h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {dept.description || 'Specialized clinical diagnostic and therapeutic unit.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Department Head:</span>
                      <span className="font-semibold text-slate-800">{dept.headDoctorName || 'Chief Consultant'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Active Staff:</span>
                      <span className="font-bold text-teal-700 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {dept.doctorCount || 0} Doctors
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(dept._id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Toggle {dept.status === 'Active' ? 'Inactive' : 'Active'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Department' : 'Create Hospital Department'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Department Name</label>
            <input
              type="text"
              required
              placeholder="Cardiology"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Head of Department</label>
            <input
              type="text"
              placeholder="Dr. Arun Kumar"
              value={formData.headDoctorName}
              onChange={(e) => setFormData({ ...formData, headDoctorName: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Department clinical scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 rounded-lg border border-slate-300 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Icon Style</label>
              <select
                value={formData.iconName}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="HeartPulse">Heart / Cardiology</option>
                <option value="Stethoscope">Stethoscope / Medicine</option>
                <option value="Brain">Brain / Neurology</option>
                <option value="Activity">Activity / Ortho</option>
                <option value="Baby">Baby / Pediatrics</option>
                <option value="Sparkles">Sparkles / Dermatology</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 rounded-lg border border-slate-300 text-xs"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {isEditing ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
