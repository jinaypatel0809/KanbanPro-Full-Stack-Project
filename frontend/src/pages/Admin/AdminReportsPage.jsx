import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PieChart,
  Rocket,
  Settings,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
  { name: 'Projects', icon: FolderKanban, path: '/admin-projects' },
  { name: 'Tasks', icon: CheckSquare, path: '/admin-tasks' },
  { name: 'Team Members', icon: Users, path: '/admin-team' },
  { name: 'Reports', icon: FileText, path: '/admin-reports' },
  { name: 'Settings', icon: Settings, path: '/admin-settings' },
];

export default function AdminReportsPage() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadReports = async () => {
      try {
        const result = await apiRequest('/admin/reports', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setReportData(result);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadReports();
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const summary = reportData?.summary;
  const timeline = reportData?.timeline || [];
  const maxTimelineCount = Math.max(1, ...timeline.flatMap((item) => [item.projects, item.tasks]));
  const statusTotal = (reportData?.taskStatuses || []).reduce((total, item) => total + item.count, 0);

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
                    item.name === 'Reports' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
            <h4 className="text-sm font-bold text-white">Live Reports</h4>
            <p className="mt-1 text-xs text-indigo-200">Metrics from saved projects, tasks and team members.</p>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-medium text-slate-500">Database reports · Last 7 days</span>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            <Bell className="h-5 w-5 text-slate-500" />
            {sessionStorage.getItem('profilePhoto') ? (
              <img src={sessionStorage.getItem('profilePhoto')} alt="Admin profile" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {(sessionStorage.getItem('userName') || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold">{sessionStorage.getItem('userName') || 'Admin'}</div>
              <div className="text-[11px] text-slate-400">Admin</div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Project, task and team metrics calculated from database records.</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading report data...</p>}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Projects', value: summary?.totalProjects, icon: FolderKanban, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
              { label: 'Total Tasks', value: summary?.totalTasks, icon: CheckSquare, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
              { label: 'Completed Tasks', value: summary?.completedTasks, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
              { label: 'Team Members', value: summary?.totalMembers, icon: Users, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
                <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-black">{value ?? '—'}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <h2 className="mb-5 flex items-center gap-2 font-bold">
                <TrendingUp className="h-5 w-5 text-indigo-600" /> Projects Created & Tasks Assigned (7 Days)
              </h2>
              <div className="flex h-52 items-end justify-around gap-2 border-b border-slate-100 pb-2 dark:border-slate-800">
                {timeline.map((day) => (
                  <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-full w-full items-end justify-center gap-1">
                      <div title={`${day.projects} projects`} className="w-3 rounded-t bg-indigo-600" style={{ height: `${day.projects ? Math.max(4, (day.projects / maxTimelineCount) * 100) : 0}%` }} />
                      <div title={`${day.tasks} tasks`} className="w-3 rounded-t bg-sky-500" style={{ height: `${day.tasks ? Math.max(4, (day.tasks / maxTimelineCount) * 100) : 0}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center gap-6 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-indigo-600" />Projects</span>
                <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sky-500" />Tasks</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold">
                <PieChart className="h-5 w-5 text-indigo-600" /> Task Status
              </h2>
              <div className="flex items-center justify-around">
                <div className="relative h-40 w-40">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    {(reportData?.taskStatuses || []).map((item, index, statuses) => {
                      const percentage = statusTotal ? (item.count / statusTotal) * 100 : 0;
                      const offset = statuses.slice(0, index).reduce(
                        (sum, previous) => sum + (statusTotal ? (previous.count / statusTotal) * 100 : 0),
                        0,
                      );
                      const colors = ['text-indigo-600', 'text-emerald-500'];
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{summary?.totalTasks ?? '—'}</span>
                    <span className="text-xs text-slate-400">Tasks</span>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  {(reportData?.taskStatuses || []).map((item, index) => {
                    const percentage = statusTotal ? Math.round((item.count / statusTotal) * 100) : 0;
                    const colors = ['bg-indigo-600', 'bg-emerald-500'];
                    return (
                      <div key={item.status} className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${colors[index]}`} />
                        <span className="text-slate-600 dark:text-slate-300">{item.status}</span>
                        <span className="font-bold">{item.count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Users className="h-5 w-5 text-indigo-600" /> Team Task Completion</h2>
                <button onClick={() => navigate('/admin-team')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  Team <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-4">
                {(reportData?.teamPerformance || []).map((member, index) => {
                  const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                  return (
                    <div key={member.name} className="flex items-center gap-3 text-xs">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="w-28 truncate font-semibold">{member.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${colors[index]}`} style={{ width: `${member.percentage}%` }} />
                      </div>
                      <span className="w-16 text-right font-bold">{member.completed}/{member.assigned}</span>
                    </div>
                  );
                })}
                {reportData && reportData.teamPerformance.length === 0 && (
                  <p className="text-sm text-slate-500">No task completion data is available yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Star className="h-4 w-4 fill-indigo-600 text-indigo-600" /> Top Projects</h2>
                <button onClick={() => navigate('/admin-projects')} aria-label="View projects" className="text-indigo-600 hover:underline">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {(reportData?.topProjects || []).map((project, index) => {
                  const colors = ['bg-indigo-600', 'bg-blue-500', 'bg-emerald-500'];
                  return (
                    <div key={project._id}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-semibold">{project.title}</span>
                        <span className="font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className={`h-full rounded-full ${colors[index]}`} style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  );
                })}
                {reportData && reportData.topProjects.length === 0 && <p className="text-sm text-slate-500">No projects have been added.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
              <h2 className="mb-4 flex items-center gap-2 font-bold"><Zap className="h-4 w-4 text-indigo-600" /> Recent Activity</h2>
              <div className="space-y-4">
                {(reportData?.recentActivity || []).map((activity) => (
                  <div key={activity._id} className="flex gap-3 text-xs">
                    <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      activity.module === 'Task' ? 'bg-emerald-500' : activity.module === 'Project' ? 'bg-indigo-500' : 'bg-sky-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 dark:text-slate-200">
                        {activity.actorName}: {activity.details}
                      </p>
                      <p className="mt-1 text-slate-400">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {reportData && reportData.recentActivity.length === 0 && <p className="text-sm text-slate-500">No recent activity has been recorded.</p>}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
