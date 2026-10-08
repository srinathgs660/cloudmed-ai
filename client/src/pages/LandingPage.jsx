import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Brain,
  Cloud,
  ShieldCheck,
  Calendar,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  Database,
  Lock,
  Layers,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              CloudMed <span className="text-teal-600">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6">
            <Brain className="w-4 h-4 text-teal-600" />
            Intelligent Hospital Management & Clinical Analytics Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Smarter Hospital Management with <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">Cloud + AI</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Manage patients, appointments, and medical records with intelligent cloud-powered healthcare workflows and machine-learning risk predictions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
            >
              Launch Live Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-base shadow-xs transition-all"
            >
              Patient Portal Registration
            </Link>
          </div>

          {/* Architecture Badge Ribbon */}
          <div className="mt-14 pt-10 border-t border-slate-200 max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><Layers className="w-4 h-4 text-teal-600" /> React 18 + Vite</span>
            <span className="flex items-center gap-1.5"><Cloud className="w-4 h-4 text-sky-600" /> Node.js & Express REST</span>
            <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-purple-600" /> Python FastAPI + Scikit-Learn</span>
            <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-emerald-600" /> MongoDB Atlas</span>
            <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-amber-600" /> JWT & RBAC Security</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Core Hospital & AI Capabilities</h2>
            <p className="mt-3 text-slate-600 text-base">
              A balanced clinical platform engineered for college demo, viva defense, and cloud evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Smart Patient Management</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Centralized electronic health records with allergy logs, biometric vitals, longitudinal visit histories, and emergency contacts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI Health Risk Prediction</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Random Forest ML classifier trained on clinical indicators (BMI, BP, glucose, cholesterol, lifestyle) calculating patient risk distribution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Appointment Priority Triage</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Automated ML-based acuity scoring categorizing incoming bookings into HIGH, MEDIUM, and LOW priority queues while avoiding double booking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI Medical Report Summary</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Intelligent NLP clinical note parser extracting symptoms, laboratory abnormalities, and recommended follow-up directives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Cloud Storage & Records</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Cloudinary document repository storing lab PDFs, radiology scans, and diagnostic reports with safe metadata persistence in MongoDB.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Role-Based Security</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Strict granular authorization dividing capabilities between Admin, Doctors, and Patients with encrypted JWT sessions and bcrypt password hashing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How CloudMed AI Works</h2>
            <p className="mt-3 text-slate-600">A smooth 4-step healthcare pipeline</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center mx-auto mb-4 text-sm">1</span>
              <h4 className="font-bold text-slate-800">Register & Triage</h4>
              <p className="text-xs text-slate-500 mt-2">Patients register and schedule appointments scored by AI priority triage.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center mx-auto mb-4 text-sm">2</span>
              <h4 className="font-bold text-slate-800">Clinical Consultation</h4>
              <p className="text-xs text-slate-500 mt-2">Doctors confirm appointments, record diagnosis, and issue prescriptions.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center mx-auto mb-4 text-sm">3</span>
              <h4 className="font-bold text-slate-800">AI Risk Assessment</h4>
              <p className="text-xs text-slate-500 mt-2">Vitals are evaluated through trained Random Forest ML microservices.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-4 text-sm">4</span>
              <h4 className="font-bold text-slate-800">Insights & Reports</h4>
              <p className="text-xs text-slate-500 mt-2">Admin reviews hospital Recharts KPIs while patients access AI summaries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-base">CloudMed AI</span>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-right">
              CloudMed AI &mdash; Intelligent Hospital Management & Clinical Analytics Platform.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 leading-relaxed">
            <strong>Educational Disclaimer:</strong> This system provides AI-generated decision-support information for educational purposes and does not replace evaluation by a qualified healthcare professional.
          </div>
        </div>
      </footer>
    </div>
  );
};
