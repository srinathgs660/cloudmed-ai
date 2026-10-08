import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Activity,
  Users,
  UserCheck,
  Building2,
  Calendar,
  FileText,
  Brain,
  FolderOpen,
  Settings,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Stethoscope,
  Pill,
  ChevronDown,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (e) {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setUnreadCount(0);
      fetchNotifications();
    } catch (e) {}
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role based navigation definitions
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Activity },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Doctors', path: '/doctors', icon: UserCheck },
    { name: 'Departments', path: '/departments', icon: Building2 },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Medical Records', path: '/medical-records', icon: FileText },
    { name: 'AI Insights', path: '/ai-insights', icon: Brain },
    { name: 'Reports', path: '/reports', icon: FolderOpen },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const doctorLinks = [
    { name: 'Dashboard', path: '/doctor', icon: Activity },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Patients', path: '/patients', icon: Users },
    { name: 'Medical Records', path: '/medical-records', icon: FileText },
    { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { name: 'AI Assessment', path: '/ai-assessment', icon: Brain },
    { name: 'Reports', path: '/reports', icon: FolderOpen },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const patientLinks = [
    { name: 'Dashboard', path: '/patient', icon: Activity },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Doctors', path: '/doctors', icon: Stethoscope },
    { name: 'Medical Records', path: '/medical-records', icon: FileText },
    { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { name: 'Reports', path: '/reports', icon: FolderOpen },
    { name: 'AI Health Assessment', path: '/ai-assessment', icon: Brain },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const links =
    user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'DOCTOR'
      ? doctorLinks
      : patientLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen sticky top-0 h-screen">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900">
              CloudMed <span className="text-teal-600">AI</span>
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Intelligent HMS
            </p>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
            Main Menu ({user?.role})
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Card at Bottom */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[10px] text-teal-600 font-medium capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-slate-400">Environment: </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Cloud-Connected (MongoDB Atlas + ML FastAPI)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Notifications ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3.5 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-teal-50/30' : ''}`}
                        >
                          <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user?.name}</span>
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Modal */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative w-64 bg-white flex flex-col p-4 shadow-xl z-50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="font-extrabold text-slate-900">CloudMed AI</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="py-4 space-y-1 flex-1 overflow-y-auto">
                {links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50"
                    >
                      <Icon className="w-4 h-4 text-teal-600" />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 p-2.5 rounded-lg text-rose-600 font-medium text-sm hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Routed Page Content */}
        <main className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
