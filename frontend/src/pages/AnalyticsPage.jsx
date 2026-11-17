import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  Activity, 
  Settings, 
  Bell, 
  LogOut, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Rocket, 
  ArrowUpRight,
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Analytics');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadAnalytics = async () => {
      try {
        const result = await apiRequest('/reports', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setReportData(result);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadAnalytics();
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin-dashboard' },
    { name: 'Admins', icon: ShieldCheck, path: '/super-admin-admins' },
    { name: 'Users', icon: Users, path: '/super-admin-users' },
    { name: 'Projects', icon: FolderKanban, path: '/super-admin-projects' },
    { name: 'Reports', icon: FileText, path: '/super-admin-reports' },
    { name: 'Analytics', icon: BarChart3, path: '/super-admin-analytics' },
    { name: 'System Activities', icon: Activity, path: '/super-admin-activities' },
    { name: 'Settings', icon: Settings, path: '/super-admin-settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111625] text-slate-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl">
              K
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Kanban<span className="text-purple-400">Pro</span>
            </span>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActiveTab(item.name);
                    navigate(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4 rounded-2xl border border-indigo-500/25 relative overflow-hidden">
            <Rocket className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-bold text-white text-sm">Build Better, Work Smarter!</h4>
            <p className="text-xs text-indigo-200 mt-1 mb-3">Manage your projects with KanbanPro.</p>
            <button className="w-full py-2 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-lg shadow">
              Upgrade Plan
            </button>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input type="text" placeholder="Search anything... (Ctrl + K)" className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-5">
            <Bell className="w-5 h-5 text-slate-500 cursor-pointer" />
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              {sessionStorage.getItem('profilePhoto') ? (
                <img src={sessionStorage.getItem('profilePhoto')} alt="Super Admin profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {(sessionStorage.getItem('userName') || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold">{sessionStorage.getItem('userName') || 'Super Admin'}</span>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6">
          
          {/* Header & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Analytics</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Live insights calculated from saved projects and accounts.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Live database summary</span>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading analytics...</p>}

          {/* ================= SUMMARY STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Projects */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-purple-500/20 text-purple-600 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{reportData?.summary.totalProjects ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Total Projects</div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-emerald-500/20 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{reportData?.summary.activeProjects ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Active Projects</div>
              </div>
            </div>

            {/* Completed Projects */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{reportData?.summary.completedProjects ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Completed Projects</div>
              </div>
            </div>

            {/* Total Accounts */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{reportData?.summary.totalUsers ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Total Accounts</div>
              </div>
            </div>
          </div>

          {/* ================= CHARTS SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Projects and Accounts Created */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" /> Projects & Accounts (Last 7 Days)
                </h3>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Projects</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Accounts</span>
                </div>
              </div>

              <div className="h-52 flex items-end justify-around gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                {(reportData?.timeline || []).map((day) => {
                  const timeline = reportData?.timeline || [];
                  const maxCount = Math.max(1, ...timeline.flatMap((item) => [item.projects, item.users]));
                  return (
                    <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex h-full w-full items-end justify-center gap-1">
                        <div
                          title={`${day.projects} projects`}
                          className="w-3 rounded-t bg-indigo-600"
                          style={{ height: `${day.projects ? Math.max(4, (day.projects / maxCount) * 100) : 0}%` }}
                        />
                        <div
                          title={`${day.users} accounts`}
                          className="w-3 rounded-t bg-blue-500"
                          style={{ height: `${day.users ? Math.max(4, (day.users / maxCount) * 100) : 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Project Status Overview */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Project Status Overview</h3>

              <div className="flex items-center justify-around my-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {(reportData?.projectStatuses || []).map((item, index, statuses) => {
                      const total = reportData?.summary.totalProjects || 0;
                      const percentage = total ? (item.count / total) * 100 : 0;
                      const offset = statuses.slice(0, index)
                        .reduce((sum, previous) => sum + (total ? (previous.count / total) * 100 : 0), 0);
                      const colors = ['text-indigo-600', 'text-emerald-500', 'text-amber-500'];
                      return (
                        <circle
                          key={item.status}
                          cx="18"
                          cy="18"
                          r="15.9155"
                          strokeDasharray={`${percentage} ${100 - percentage}`}
                          strokeDashoffset={-offset}
                          className={`${colors[index]} stroke-current`}
                          strokeWidth="4.5"
                          fill="none"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">{reportData?.summary.totalProjects ?? '—'}</div>
                    <div className="text-[11px] text-slate-400 font-medium">Projects</div>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-medium">
                  {(reportData?.projectStatuses || []).map((item, index) => {
                    const total = reportData?.summary.totalProjects || 0;
                    const percentage = total ? Math.round((item.count / total) * 100) : 0;
                    const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                    <div key={item.status} className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${colors[index]}`}></span>
                        <span className="text-slate-600 dark:text-slate-300">{item.status}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{item.count} ({percentage}%)</span>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* ================= BOTTOM 3 SECTIONS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Account Roles */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Accounts by Role</h3>
              </div>

              <div className="space-y-4">
                {(reportData?.roleCounts || []).map((item, index) => {
                  const total = reportData?.summary.totalUsers || 0;
                  const percentage = total ? Math.round((item.count / total) * 100) : 0;
                  const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-purple-500'];
                  return (
                    <div key={item.role} className="flex items-center justify-between gap-3 text-xs">
                      <span className="w-24 truncate font-bold text-slate-700 dark:text-slate-200">{item.role}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[index]} rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-12 text-right font-bold text-slate-600 dark:text-slate-300">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
                {reportData && reportData.summary.totalUsers === 0 && (
                  <p className="text-xs text-slate-500">No accounts are registered yet.</p>
                )}
              </div>
            </div>

            {/* Project Categories */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base mb-2">Project Categories</h3>

              <div className="space-y-3 text-xs font-medium">
                {(reportData?.projectCategories || []).map((category, index) => {
                  const total = reportData?.summary.totalProjects || 0;
                  const percentage = total ? Math.round((category.count / total) * 100) : 0;
                  const colors = ['bg-purple-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                  return (
                    <div key={category.category} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`w-3 h-3 shrink-0 rounded-full ${colors[index % colors.length]}`} />
                        <span className="truncate text-slate-600 dark:text-slate-300">{category.category}</span>
                      </div>
                      <span className="shrink-0 font-bold text-slate-700 dark:text-slate-200">
                        {category.count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
                {reportData && reportData.projectCategories.length === 0 && (
                  <p className="text-xs text-slate-500">No project categories are available.</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base">Recent Activity</h3>
                <button className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {(reportData?.recentActivity || []).map((activity, index) => {
                  const Icon = activity.module === 'Project' ? FolderKanban : activity.module === 'Task' ? CheckCircle2 : Users;
                  return (
                    <div key={activity._id || index} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          activity.module === 'Project' ? 'text-purple-600 bg-purple-50' : activity.module === 'Task' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                          {activity.actorName}: {activity.details}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
                {reportData && reportData.recentActivity.length === 0 && (
                  <p className="text-xs text-slate-500">No activity has been recorded yet.</p>
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}