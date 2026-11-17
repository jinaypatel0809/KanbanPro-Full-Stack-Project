import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Bell,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Rocket,
  Settings,
  User,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
  { name: 'My Projects', icon: FolderKanban, path: '/user-projects' },
  { name: 'My Tasks', icon: CheckSquare, path: '/user-tasks' },
  { name: 'Notifications', icon: Bell, path: '/user-notifications' },
  { name: 'My Profile', icon: User, path: '/user-profile' },
  { name: 'Settings', icon: Settings, path: '/user-settings' },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = sessionStorage.getItem('userName') || 'User';
  const profilePhoto = sessionStorage.getItem('profilePhoto');

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const headers = { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` };
        const [projectResult, taskResult] = await Promise.all([
          apiRequest('/user/projects', { headers }),
          apiRequest('/user/tasks', { headers }),
        ]);
        if (active) {
          setProjects(projectResult.projects);
          setTasks(taskResult.tasks);
        }
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

  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const assignedTasks = tasks.filter((task) => task.status === 'Assigned').length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const taskStatusData = [
    { status: 'Assigned', count: assignedTasks, color: 'text-indigo-600', dot: 'bg-indigo-600' },
    { status: 'Completed', count: completedTasks, color: 'text-emerald-500', dot: 'bg-emerald-500' },
  ];
  const openTasksWithDeadlines = tasks
    .filter((task) => task.status !== 'Completed' && task.dueDate)
    .sort((left, right) => new Date(left.dueDate) - new Date(right.dueDate))
    .slice(0, 4);
  const recentActivity = [
    ...tasks.flatMap((task) => [
      task.assignedAt && {
        id: `${task._id}-assigned`,
        date: task.assignedAt,
        text: `Task assigned: ${task.title}`,
        detail: task.project?.title || 'Assigned task',
      },
      task.completedAt && {
        id: `${task._id}-completed`,
        date: task.completedAt,
        text: `Task completed: ${task.title}`,
        detail: task.project?.title || 'Completed task',
      },
    ].filter(Boolean)),
    ...projects.flatMap((project) => project.latestReport ? [{
      id: `${project._id}-report`,
      date: project.latestReport.submittedAt,
      text: `Progress reported: ${project.title}`,
      detail: `${project.latestReport.progress}% complete`,
    }] : []),
  ]
    .sort((left, right) => new Date(right.date) - new Date(left.date))
    .slice(0, 4);
  const totalTaskCount = tasks.length;
  const taskStatusTotal = taskStatusData.reduce((total, item) => total + item.count, 0);

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
            <h4 className="text-sm font-bold text-white">Your Work</h4>
            <p className="mt-1 text-xs text-indigo-200">Projects and tasks assigned to your account.</p>
            <button onClick={() => navigate('/user-tasks')} className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500">
              View My Tasks
            </button>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm font-medium text-slate-500">My Workspace</span>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            {profilePhoto ? (
              <img src={profilePhoto} alt={`${userName} profile`} className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white ring-2 ring-indigo-500">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="max-w-40 truncate text-sm font-semibold">{userName}</div>
              <div className="text-[11px] text-slate-400">User</div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-8">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back, {userName}!</h1>
            <p className="mt-2 text-sm text-indigo-100">Here is your current project and task progress.</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading your projects and tasks...</p>}

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'My Projects', value: projects.length, caption: `${projects.filter((project) => project.status === 'Active').length} active`, icon: FolderKanban, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
              { label: 'Total Tasks', value: totalTaskCount, caption: `${assignedTasks} assigned`, icon: CheckSquare, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
              { label: 'Completed Tasks', value: completedTasks, caption: 'Marked complete', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
              { label: 'Task Completion', value: `${completionRate}%`, caption: 'Completed of assigned', icon: Activity, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
            ].map(({ label, value, caption, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
                <p className="mt-4 text-2xl font-black">{isLoading ? '—' : value}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-xs text-slate-400">{caption}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-7">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">My Projects</h2>
                <button onClick={() => navigate('/user-projects')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {projects.slice(0, 4).map((project) => (
                  <div key={project._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{project.title}</p>
                      <p className="truncate text-xs text-slate-400">{project.category}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{project.progress || 0}%</p>
                      <p className="text-[11px] text-slate-400">{project.status}</p>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && !isLoading && <p className="py-6 text-center text-sm text-slate-500">No projects are assigned to you yet.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-5">
              <h2 className="mb-4 font-bold">My Task Overview</h2>
              <div className="flex items-center justify-around gap-4">
                <div className="relative h-40 w-40 shrink-0">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="4.5" fill="none" />
                    {taskStatusData.map((item, index) => {
                      const percentage = taskStatusTotal ? (item.count / taskStatusTotal) * 100 : 0;
                      const offset = taskStatusData.slice(0, index).reduce(
                        (total, previous) => total + (taskStatusTotal ? (previous.count / taskStatusTotal) * 100 : 0),
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
                          className={`${item.color} stroke-current`}
                          strokeWidth="4.5"
                          fill="none"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{isLoading ? '—' : totalTaskCount}</span>
                    <span className="text-xs text-slate-400">Tasks</span>
                  </div>
                </div>
                <div className="space-y-3 text-xs">
                  {taskStatusData.map((item) => (
                    <div key={item.status} className="flex items-center gap-2">
                      <i className={`h-3 w-3 rounded-full ${item.dot}`} />
                      <span className="text-slate-600 dark:text-slate-300">{item.status}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => navigate('/user-tasks')} className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
                Open My Tasks
              </button>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Calendar className="h-5 w-5 text-indigo-600" /> Upcoming Deadlines</h2>
                <button onClick={() => navigate('/user-tasks')} className="text-xs font-semibold text-indigo-600 hover:underline">My tasks</button>
              </div>
              <div className="space-y-3">
                {openTasksWithDeadlines.map((task) => (
                  <div key={task._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{task.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" /> Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">{task.priority}</span>
                  </div>
                ))}
                {openTasksWithDeadlines.length === 0 && !isLoading && <p className="py-6 text-center text-sm text-slate-500">No upcoming task deadlines.</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-bold"><Activity className="h-5 w-5 text-indigo-600" /> Recent Activity</h2>
                <span className="text-xs text-slate-400">Your assigned work</span>
              </div>
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-xl p-2">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.text}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.detail} · {new Date(item.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && !isLoading && <p className="py-6 text-center text-sm text-slate-500">No recent project or task activity.</p>}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
