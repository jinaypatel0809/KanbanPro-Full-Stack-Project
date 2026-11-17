import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Rocket,
  Search,
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

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
});

export default function UserTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [completingTaskId, setCompletingTaskId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadTasks = async () => {
      try {
        const result = await apiRequest('/user/tasks', { headers: authHeaders() });
        if (active) setTasks(result.tasks);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadTasks();
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const completeTask = async (taskId) => {
    setCompletingTaskId(taskId);
    setError('');
    try {
      const { task } = await apiRequest(`/user/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      setTasks((current) => current.map((item) => item._id === task._id ? task : item));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setCompletingTaskId('');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const text = `${task.title} ${task.description} ${task.project?.title || ''}`.toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (statusFilter === 'All' || task.status === statusFilter);
  });
  const assignedCount = tasks.filter((task) => task.status === 'Assigned').length;
  const completedCount = tasks.filter((task) => task.status === 'Completed').length;

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
                    item.name === 'My Tasks' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
            <h4 className="text-sm font-bold text-white">Stay Productive!</h4>
            <p className="mt-1 text-xs text-indigo-200">Complete tasks assigned to you.</p>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-96">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search my tasks..."
              className="w-full rounded-xl bg-slate-100 py-2 pl-10 pr-4 text-sm dark:bg-slate-800"
            />
          </div>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            {sessionStorage.getItem('profilePhoto') ? (
              <img src={sessionStorage.getItem('profilePhoto')} alt="User profile" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">
                {(sessionStorage.getItem('userName') || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-sm font-semibold">{sessionStorage.getItem('userName') || 'User'}</div>
              <div className="text-[11px] text-slate-400">Member</div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Tasks</h1>
              <p className="mt-1 text-sm text-slate-500">Only tasks assigned to your account are listed here.</p>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-4 w-4 text-indigo-500" />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent">
                <option value="All">All statuses</option>
                <option value="Assigned">Assigned</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading your tasks...</p>}

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total tasks', value: tasks.length, icon: CheckSquare },
              { label: 'Assigned', value: assignedCount, icon: Clock },
              { label: 'Completed', value: completedCount, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                  <Icon className="h-5 w-5" />
                </div>
                <div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>
              </div>
            ))}
          </div>

          <section className="space-y-3">
            {filteredTasks.map((task) => (
              <article key={task._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{task.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <FolderKanban className="h-4 w-4" /> {task.project?.title || 'Project'}
                    </p>
                    {task.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{task.description}</p>}
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                      <span><Calendar className="mr-1 inline h-3.5 w-3.5" />Assigned {new Date(task.assignedAt).toLocaleString()}</span>
                      {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
                      {task.status === 'Completed' && task.completedAt && (
                        <span className="text-emerald-700">Completed {new Date(task.completedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  {task.status === 'Assigned' && (
                    <button
                      onClick={() => completeTask(task._id)}
                      disabled={completingTaskId === task._id}
                      className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {completingTaskId === task._id ? 'Saving...' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </article>
            ))}
            {!isLoading && filteredTasks.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                No tasks assigned to you match this filter.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
