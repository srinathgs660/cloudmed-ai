import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { Card, Badge, Loader } from '../components/UI';
import { getCached, setCached } from '../services/clientCache';
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

export const AIInsightsPage = () => {
  const [data, setData] = useState(() => getCached('ai_analytics') || null);
  const [loading, setLoading] = useState(() => !getCached('ai_analytics'));

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  const fetchAIAnalytics = async () => {
    try {
      if (!data) setLoading(true);
      const res = await api.get('/dashboard/ai-analytics');
      setData(res.data);
      setCached('ai_analytics', res.data, 30000);
    } catch (e) {
      console.error('Failed to load AI analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Aggregating hospital machine learning intelligence..." />;

  const { stats, charts, disclaimer } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5 text-teal-600" />
          Predictive Health Intelligence & Cloud Triage Analytics
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Health Analytics & Insights</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Aggregated epidemiological indicators, model inference distributions, and priority triage telemetry.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-teal-400">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Patients Assessed</span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{stats?.totalAssessed || 0}</div>
          <p className="text-[11px] text-teal-600 font-semibold mt-1">Processed through AI pipeline</p>
        </Card>

        <Card className="hover:border-rose-400">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">High Risk Cohort</span>
          <div className="mt-3 text-3xl font-extrabold text-rose-600">{stats?.highRisk || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Multivariate metabolic alerts</p>
        </Card>

        <Card className="hover:border-amber-400">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Medium Risk Cohort</span>
          <div className="mt-3 text-3xl font-extrabold text-amber-600">{stats?.mediumRisk || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Preventative monitoring tier</p>
        </Card>

        <Card className="hover:border-emerald-400">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Low Risk Cohort</span>
          <div className="mt-3 text-3xl font-extrabold text-emerald-600">{stats?.lowRisk || 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Optimal physiological baseline</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Distribution Donut */}
        <Card
          title="Patient Risk Distribution"
          subtitle="Proportion of assessed patient cohort classified by Random Forest model"
        >
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#14b8a6'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Appointment Priority Distribution Bar */}
        <Card
          title="Appointment Priority Triage"
          subtitle="Acuity distribution generated via automated ML triage model"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.priorityDistribution || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Risk Trend Line */}
        <div className="lg:col-span-2">
          <Card
            title="Monthly Risk Progression Trend"
            subtitle="Historical risk classifications tracked across outpatient screening rounds"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.monthlyRiskTrend || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="lowRisk" stroke="#10b981" strokeWidth={2.5} name="Low Risk Tier" />
                  <Line type="monotone" dataKey="mediumRisk" stroke="#f59e0b" strokeWidth={2} name="Medium Risk Tier" />
                  <Line type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} name="High Risk Tier" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5">Responsible AI & Clinical Scope Notice:</strong>
          {disclaimer || 'AI results are intended for educational and decision-support purposes only and must not replace professional medical judgment.'}
        </div>
      </div>
    </div>
  );
};
