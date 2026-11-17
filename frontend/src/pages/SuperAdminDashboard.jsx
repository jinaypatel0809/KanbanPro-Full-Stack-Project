import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { apiRequest } from '../lib/api';

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

const projectStatusColors = {
  Active: { stroke: 'text-indigo-600', dot: 'bg-indigo-600' },
  Completed: { stroke: 'text-emerald-500', dot: 'bg-emerald-500' },
  'On Hold': { stroke: 'text-amber-500', dot: 'bg-amber-500' },
};
const cardColors = {
  purple: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  blue: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate] = useState(() => new Date());
  const userName = sessionStorage.getItem('userName') || 'Super Admin';
  const profilePhoto = sessionStorage.getItem('profilePhoto');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const result = await apiRequest('/reports', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setDashboardData(result);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const summary = dashboardData?.summary;
  const projectStatuses = dashboardData?.projectStatuses || [];
  const taskTimeline = dashboardData?.timeline || [];
  const taskMax = Math.max(1, ...taskTimeline.map((item) => item.tasks || 0));
  const projectTotal = summary?.totalProjects || 0;
  const taskCards = [
    { title: 'Total Users', value: summary?.totalUsers, caption: `${summary?.activeUsers ?? 0} active`, icon: Users, color: 'purple' },
    { title: 'Total Projects', value: summary?.totalProjects, caption: `${summary?.activeProjects ?? 0} active`, icon: FolderKanban, color: 'blue' },
    { title: 'Total Tasks', value: summary?.totalTasks, caption: `${summary?.completedTasks ?? 0} completed`, icon: CheckCircle2, color: 'emerald' },
    { title: 'Task Completion', value: summary ? `${summary.taskCompletionRate}%` : undefined, caption: 'Completed tasks', icon: BarChart3, color: 'amber' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#111625] p-4 text-slate-300">
        <div>
          <div className="mb-4 flex items-center gap-3 px-3 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-xl font-bold text-white">K</div>
            <span className="text-2xl font-bold tracking-tight text-white">Kanban<span className="text-purple-400">Pro</span></span>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium ${
                    item.name === 'Dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4">
            <Rocket className="mb-2 h-8 w-8 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Platform Overview</h4>
            <p className="mt-1 text-xs text-indigo-200">Live totals from your saved records.</p>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm font-medium text-slate-500">Platform Dashboard</span>
          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5 text-slate-500" />
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
              {profilePhoto ? (
                <img src={profilePhoto} alt={`${userName} profile`} className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white ring-2 ring-indigo-500">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span className="max-w-36 truncate">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-[11px] text-slate-400">Super Admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{userName}</span>
              </h1>
              <p className="mt-1 text-sm text-slate-500">A live summary of users, projects and task activity.</p>
            </div>
            <p className="text-sm font-medium text-slate-500">{currentDate.toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading dashboard data...</p>}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {taskCards.map(({ title, value, caption, icon: Icon, color }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cardColors[color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
                <p className="text-xs font-medium text-slate-500">{title}</p>
                <p className="mt-2 text-xs text-slate-400">{caption}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><FolderKanban className="h-5 w-5 text-indigo-600" /> Project Status</h2>
                <button onClick={() => navigate('/super-admin-projects')} className="text-xs font-semibold text-indigo-600 hover:underline">View projects</button>
              </div>
              <div className="flex flex-col items-center justify-around gap-5 sm:flex-row">
                <div className="relative h-40 w-40 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4.5" fill="none" />
                    {projectStatuses.map((item, index) => {
                      const percentage = projectTotal ? (item.count / projectTotal) * 100 : 0;
                      const offset = projectStatuses.slice(0, index).reduce(
                        (total, previous) => total + (projectTotal ? (previous.count / projectTotal) * 100 : 0),
                        0,
                      );
                      return (
                        <circle
                          key={item.status}
                          cx="18"
                          cy="18"
                          r="15.9155"
                          strokeDasharray={`${percentage} ${100 - percentage}`}
                          strokeDashoffset={-offset}
                          className={`${projectStatusColors[item.status]?.stroke || 'text-slate-400'} stroke-current`}
                          strokeWidth="4.5"
                          fill="none"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{summary?.totalProjects ?? '—'}</span>
                    <span className="text-xs text-slate-400">Projects</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {projectStatuses.map((item) => (
                    <div key={item.status} className="flex items-center justify-between gap-4 text-xs">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <i className={`h-3 w-3 rounded-full ${projectStatusColors[item.status]?.dot || 'bg-slate-400'}`} />
                        {item.status}
                      </span>
                      <span className="font-bold">{item.count} · {projectTotal ? Math.round((item.count / projectTotal) * 100) : 0}%</span>
                    </div>
                  ))}
                  {dashboardData && projectStatuses.length === 0 && <p className="text-sm text-slate-500">No project data is available.</p>}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Activity className="h-5 w-5 text-indigo-600" /> Tasks Assigned (Last 7 Days)</h2>
                <button onClick={() => navigate('/super-admin-reports')} className="text-xs font-semibold text-indigo-600 hover:underline">View reports</button>
              </div>
              <div className="flex h-48 items-end justify-around gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                {taskTimeline.map((day) => (
                  <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full items-end justify-center">
                      <div
                        title={`${day.tasks || 0} tasks assigned`}
                        className="w-6 rounded-t bg-indigo-600"
                        style={{ height: day.tasks ? `${Math.max(4, (day.tasks / taskMax) * 100)}%` : 0 }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>
                ))}
                {dashboardData && taskTimeline.length === 0 && <p className="mb-8 text-sm text-slate-500">No task timeline data is available.</p>}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Recent Activity</h2>
                <button onClick={() => navigate('/super-admin-activities')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {(dashboardData?.recentActivity || []).map((activity) => (
                  <div key={activity._id} className="flex items-center justify-between gap-4 rounded-xl p-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        activity.module === 'Project' ? 'bg-indigo-500' : activity.module === 'Task' ? 'bg-emerald-500' : 'bg-sky-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="truncate font-bold">{activity.details}</p>
                        <p className="mt-1 text-slate-400">{activity.actorName} · {activity.actorRole}</p>
                      </div>
                    </div>
                    <time className="shrink-0 text-slate-400">{new Date(activity.createdAt).toLocaleString()}</time>
                  </div>
                ))}
                {dashboardData && dashboardData.recentActivity.length === 0 && <p className="text-sm text-slate-500">No recent activities have been recorded.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Top Projects</h2>
                <button onClick={() => navigate('/super-admin-projects')} className="text-xs font-semibold text-indigo-600 hover:underline">View all</button>
              </div>
              <div className="space-y-4">
                {(dashboardData?.topProjects || []).map((project) => (
                  <div key={project._id}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-semibold">{project.title}</span>
                      <span className="font-bold">{project.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                ))}
                {dashboardData && dashboardData.topProjects.length === 0 && <p className="text-sm text-slate-500">No projects have been added.</p>}
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800">
                <h3 className="mb-3 text-sm font-bold">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/super-admin-projects')} className="rounded-xl bg-indigo-50 p-3 text-left text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300">
                    <FolderKanban className="mb-2 h-4 w-4" /> Manage Projects
                  </button>
                  <button onClick={() => navigate('/super-admin-admins')} className="rounded-xl bg-blue-50 p-3 text-left text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300">
                    <Users className="mb-2 h-4 w-4" /> Manage Admins
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
