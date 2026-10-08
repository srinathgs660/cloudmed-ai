import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, Shield, Stethoscope, User, AlertCircle } from 'lucide-react';
import { Button } from '../components/UI';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);
      redirectByRole(loggedUser.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'DOCTOR') navigate('/doctor');
    else navigate('/patient');
  };

  const setDemoAccount = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@cloudmed.demo');
      setPassword('Admin@1234');
    } else if (role === 'DOCTOR') {
      setEmail('doctor.arun@cloudmed.demo');
      setPassword('Doctor@1234');
    } else {
      setEmail('rahul.patient@cloudmed.demo');
      setPassword('Patient@1234');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Branding Panel (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">
              CloudMed <span className="text-teal-400">AI</span>
            </span>
          </Link>
          <div className="mt-20 max-w-md">
            <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">Cloud + AI Architecture</span>
            <h2 className="text-4xl font-extrabold tracking-tight mt-3 text-white leading-tight">
              Intelligent Healthcare Operations & Patient Wellness Risk Profiling
            </h2>
            <p className="mt-4 text-teal-100/80 text-sm leading-relaxed">
              Equipped with Random Forest risk models, appointment priority triage, and Cloudinary document archiving.
            </p>
          </div>
        </div>

        <div className="relative z-10 border-t border-teal-700/50 pt-6">
          <p className="text-xs text-teal-300/80">
            CloudMed AI &mdash; Intelligent Hospital Management System
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900">CloudMed AI</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-1.5 text-sm text-slate-500">Sign in to access your role-based hospital workspace.</p>

          {/* Quick Demo Switcher Buttons */}
          <div className="mt-6 p-4 rounded-xl bg-slate-100/80 border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
              Instant Demo Fill (Evaluation Mode):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoAccount('ADMIN')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5 text-rose-500" /> Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('DOCTOR')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs"
              >
                <Stethoscope className="w-3.5 h-3.5 text-sky-500" /> Doctor
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('PATIENT')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-emerald-500" /> Patient
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cloudmed.demo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3 mt-2 text-sm font-semibold">
              Sign In to CloudMed <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Register as Patient
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
