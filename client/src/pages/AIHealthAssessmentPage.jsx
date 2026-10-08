import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Brain,
  Activity,
  Heart,
  Droplets,
  Scale,
  Cigarette,
  Dumbbell,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, Badge, Button, Loader, RiskCard } from '../components/UI';

export const AIHealthAssessmentPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [latestAssessment, setLatestAssessment] = useState(null);

  // Form
  const [form, setForm] = useState({
    patientId: '',
    age: 48,
    gender: 'male',
    bmi: 28.4,
    bloodPressure: 145,
    glucose: 140,
    cholesterol: 235,
    smoking: true,
    physicalActivity: 1, // 0=Sedentary, 1=Moderate, 2=Active
    familyHistory: true,
  });

  useEffect(() => {
    fetchHistory();
    if (user?.role !== 'PATIENT') {
      fetchPatients();
    }
  }, []);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get('/ai/assessments');
      setHistory(res.data.data || []);
      if (res.data.data?.length > 0) {
        setLatestAssessment({
          riskLevel: res.data.data[0].result,
          probability: res.data.data[0].probability,
          classProbabilities: res.data.data[0].classProbabilities,
          message: res.data.data[0].message,
          keyFactors: res.data.data[0].keyFactors,
          disclaimer: res.data.data[0].disclaimer,
        });
      }
    } catch (e) {
      console.error('Failed to load assessment history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data.data || []);
      if (res.data.data?.length > 0) {
        setForm((prev) => ({ ...prev, patientId: res.data.data[0]._id }));
      }
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await api.post('/ai/health-risk', form);
      setLatestAssessment(res.data);
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || 'AI assessment inference failed');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          Scikit-Learn Random Forest Pipeline (83.0% Empirical Accuracy)
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Health Risk Profiling</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Screen multi-parameter metabolic and cardiovascular indicators using our deployed cloud machine learning model to estimate comprehensive health risk tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Interactive Clinical Screening Form */}
        <div className="lg:col-span-7">
          <Card title="Clinical Health Parameters" subtitle="Adjust vitals to test model prediction">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {user?.role !== 'PATIENT' && (
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Target Patient Profile</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="">Guest Evaluation (No patient record link)</option>
                    {patients.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.userId?.name} ({p.gender}, Age: {p.age})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Age (Years): {form.age}</label>
                  <input
                    type="range"
                    min="18"
                    max="85"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Biological Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">BMI (kg/m²): {form.bmi}</label>
                  <input
                    type="range"
                    min="18.0"
                    max="45.0"
                    step="0.1"
                    value={form.bmi}
                    onChange={(e) => setForm({ ...form, bmi: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>18.5 (Normal)</span>
                    <span>25 (Overweight)</span>
                    <span>30+ (Obese)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Systolic Blood Pressure: {form.bloodPressure} mmHg
                  </label>
                  <input
                    type="range"
                    min="90"
                    max="190"
                    value={form.bloodPressure}
                    onChange={(e) => setForm({ ...form, bloodPressure: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>&lt;120 Normal</span>
                    <span>130 Pre-HTN</span>
                    <span>140+ Stage 2</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Fasting Glucose: {form.glucose} mg/dL
                  </label>
                  <input
                    type="range"
                    min="70"
                    max="260"
                    value={form.glucose}
                    onChange={(e) => setForm({ ...form, glucose: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>&lt;100 Normal</span>
                    <span>126+ Diabetic</span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">
                    Total Cholesterol: {form.cholesterol} mg/dL
                  </label>
                  <input
                    type="range"
                    min="120"
                    max="340"
                    value={form.cholesterol}
                    onChange={(e) => setForm({ ...form, cholesterol: Number(e.target.value) })}
                    className="w-full accent-teal-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>&lt;200 Desirable</span>
                    <span>240+ High</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Smoking Status</label>
                  <select
                    value={form.smoking ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, smoking: e.target.value === '1' })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="0">Non-Smoker</option>
                    <option value="1">Active Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Physical Activity</label>
                  <select
                    value={form.physicalActivity}
                    onChange={(e) => setForm({ ...form, physicalActivity: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value={0}>Sedentary (&lt;1x/wk)</option>
                    <option value={1}>Moderate (2-3x/wk)</option>
                    <option value={2}>Active (&gt;4x/wk)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Family History</label>
                  <select
                    value={form.familyHistory ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, familyHistory: e.target.value === '1' })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="0">None / Negative</option>
                    <option value="1">Positive (Heart/Diabetes)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  loading={evaluating}
                  className="w-full py-3"
                  icon={Sparkles}
                >
                  Execute Machine Learning Risk Evaluation
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-5 space-y-6">
          {latestAssessment ? (
            <RiskCard assessment={latestAssessment} />
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-slate-200 bg-white text-center">
              <Brain className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Awaiting Clinical Vitals</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Submit the form on the left to trigger real-time inference via the Python FastAPI microservice.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assessment History Table */}
      <Card title="Assessment Audit History" subtitle="Previous machine learning inferences recorded for patients">
        {loadingHistory ? (
          <Loader message="Loading assessment logs..." />
        ) : history.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No assessments executed yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Risk Tier</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Contributing Factors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {h.patientId?.userId?.name || 'Walk-in Screening'}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          h.result === 'High' ? 'danger' : h.result === 'Medium' ? 'warning' : 'success'
                        }
                      >
                        {h.result} Risk
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {(h.probability * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-3 text-slate-500 max-w-sm truncate">
                      {(h.keyFactors || []).join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
