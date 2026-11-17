import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Filter,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Rocket,
  Search,
  Settings,
  Users,
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

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
});

const formatDate = (date) => (date ? new Date(date).toLocaleString() : '—');

export default function AdminTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [summary, setSummary] = useState({ total: 0, assigned: 0, completed: 0 });
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    userId: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let timeoutId;
    const refreshTasks = async () => {
      try {
        const result = await apiRequest('/admin/tasks', { headers: authHeaders() });
        if (active) {
          setTasks(result.tasks);
          setProjects(result.projects);
          setTeamMembers(result.teamMembers);
          setSummary(result.summary);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) {
          setIsLoading(false);
          timeoutId = setTimeout(refreshTasks, 5000);
        }
      }
    };

    refreshTasks();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const selectedProject = projects.find((project) => project._id === form.projectId);
  const projectAssigneeId = selectedProject?.assignedTo?._id || selectedProject?.assignedTo?.id || '';
  const availableMembers = projectAssigneeId
    ? teamMembers.filter((member) => member._id === projectAssigneeId)
    : [];
  const filteredTasks = tasks.filter((task) => {
    const text = `${task.title} ${task.description} ${task.project?.title || ''} ${task.assignedTo?.fullName || ''}`
      .toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (statusFilter === 'All' || task.status === statusFilter);
  });

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitTask = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const { task } = await apiRequest('/admin/tasks', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      setTasks((current) => [task, ...current]);
      setSummary((current) => ({
        total: current.total + 1,
        assigned: current.assigned + 1,
        completed: current.completed,
      }));
      setForm({
        title: '',
        description: '',
        projectId: '',
        userId: '',
        dueDate: '',
        priority: 'Medium',
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

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
                    item.name === 'Tasks' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
            <h4 className="text-sm font-bold text-white">Manage Tasks Smarter!</h4>
            <p className="mt-1 text-xs text-indigo-200">Assign work and track completion.</p>
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
              placeholder="Search assigned tasks..."
              className="w-full rounded-xl bg-slate-100 py-2 pl-10 pr-4 text-sm dark:bg-slate-800"
            />
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
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Task Assignments</h1>
              <p className="mt-1 text-sm text-slate-500">Completion status refreshes automatically every 5 seconds.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              <Activity className="h-4 w-4 text-indigo-500" /> Live task status
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading tasks...</p>}

          <section className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Tasks', value: summary.total, icon: CheckSquare },
              { label: 'Assigned', value: summary.assigned, icon: Clock },
              { label: 'Completed', value: summary.completed, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                  <Icon className="h-5 w-5" />
                </div>
                <div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Plus className="h-5 w-5 text-indigo-600" /> Assign a Task
            </h2>
            <form onSubmit={submitTask} className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Task title
                <input required maxLength="120" value={form.title} onChange={(event) => updateForm('title', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Project
                <select required value={form.projectId} onChange={(event) => {
                  updateForm('projectId', event.target.value);
                  updateForm('userId', '');
                }} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}{project.assignedTo ? ` — ${project.assignedTo.fullName}` : ' — unassigned'}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Assigned user
                <select required value={form.userId} onChange={(event) => updateForm('userId', event.target.value)} disabled={!form.projectId} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800">
                  <option value="">Select project assignee</option>
                  {availableMembers.map((member) => <option key={member._id} value={member._id}>{member.fullName} ({member.email})</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Due date (optional)
                  <input type="date" value={form.dueDate} onChange={(event) => updateForm('dueDate', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                </label>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Priority
                  <select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                    {['High', 'Medium', 'Low'].map((priority) => <option key={priority}>{priority}</option>)}
                  </select>
                </label>
              </div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 md:col-span-2">
                Description
                <textarea maxLength="1000" rows="2" value={form.description} onChange={(event) => updateForm('description', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <div className="md:col-span-2">
                <button type="submit" disabled={isSaving || !availableMembers.length} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {isSaving ? 'Assigning...' : 'Assign Task'}
                </button>
                {!availableMembers.length && <span className="ml-3 text-xs text-slate-500">Assign the project to a user first.</span>}
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <h2 className="font-bold">All Assigned Tasks</h2>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <Filter className="h-4 w-4" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <option value="All">All statuses</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/60">
                  <tr>
                    <th className="p-3">Task</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Assigned user</th>
                    <th className="p-3">Assigned date</th>
                    <th className="p-3">Due date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Completed date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTasks.map((task) => (
                    <tr key={task._id}>
                      <td className="p-3">
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.priority} priority</p>
                      </td>
                      <td className="p-3">{task.project?.title || '—'}</td>
                      <td className="p-3">{task.assignedTo?.fullName || 'Former user'}</td>
                      <td className="p-3 text-xs text-slate-500">{formatDate(task.assignedAt)}</td>
                      <td className="p-3 text-xs text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-500">{formatDate(task.completedAt)}</td>
                    </tr>
                  ))}
                  {!isLoading && filteredTasks.length === 0 && (
                    <tr><td colSpan="7" className="p-8 text-center text-sm text-slate-500">No tasks match the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
