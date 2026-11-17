import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Bell,
  CheckCircle2,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
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

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const headers = { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` };
        const [profileResult, projectResult, taskResult] = await Promise.all([
          apiRequest('/auth/me', { headers }),
          apiRequest('/user/projects', { headers }),
          apiRequest('/user/tasks', { headers }),
        ]);
        if (active) {
          setProfile(profileResult.user);
          setProjects(projectResult.projects);
          setTasks(taskResult.tasks);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProfile();
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
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

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
                    item.name === 'My Profile' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" /> {item.name}
                </button>
              );
            })}
          </nav>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-sm font-medium text-slate-500">My Account</span>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={`${profile.fullName} profile`} className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">{(profile?.fullName || 'U').charAt(0).toUpperCase()}</div>
            )}
            <div>
              <p className="max-w-40 truncate text-sm font-semibold">{profile?.fullName || 'User'}</p>
              <p className="text-[11px] text-slate-400">{profile?.role || 'Member'}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl space-y-6 p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
              <p className="mt-1 text-sm text-slate-500">Your account information and work summary.</p>
            </div>
            <button onClick={() => navigate('/user-settings')} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Edit in Settings
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading your profile...</p>}

          <section className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-4">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt={`${profile.fullName} profile`} className="mx-auto h-28 w-28 rounded-full object-cover ring-4 ring-indigo-100 dark:ring-indigo-950" />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-indigo-600 text-4xl font-bold text-white">
                  {(profile?.fullName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="mt-4 text-xl font-extrabold">{profile?.fullName || '—'}</h2>
              <p className="mt-1 text-sm text-slate-500">{profile?.role || 'Member'}</p>
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                profile?.status === 'Active' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {profile?.status || '—'}
              </span>
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left text-sm dark:border-slate-800">
                <p className="break-all text-slate-600 dark:text-slate-300">{profile?.email || '—'}</p>
                <p className="text-slate-500">
                  Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Assigned Projects', value: projects.length, icon: FolderKanban, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950' },
                  { label: 'Assigned Tasks', value: tasks.length, icon: CheckSquare, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
                  { label: 'Task Completion', value: `${completionRate}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon className="h-5 w-5" /></div>
                    <p className="mt-4 text-2xl font-black">{isLoading ? '—' : value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="flex items-center gap-2 font-bold"><User className="h-5 w-5 text-indigo-600" /> Account Information</h3>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-400">Full name</dt>
                    <dd className="mt-1 font-semibold">{profile?.fullName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Email address</dt>
                    <dd className="mt-1 break-all font-semibold">{profile?.email || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Account role</dt>
                    <dd className="mt-1 font-semibold">{profile?.role || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Theme preference</dt>
                    <dd className="mt-1 font-semibold">{profile?.theme || 'System'}</dd>
                  </div>
                </dl>
                <button onClick={() => navigate('/user-settings')} className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
                  <Settings className="h-4 w-4" /> Update profile settings
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="flex items-center gap-2 font-bold"><Activity className="h-5 w-5 text-indigo-600" /> Assigned Projects</h3>
                <div className="mt-4 space-y-3">
                  {projects.slice(0, 4).map((project) => (
                    <div key={project._id} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{project.title}</p>
                        <p className="text-xs text-slate-400">{project.status}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold">{project.progress || 0}%</span>
                    </div>
                  ))}
                  {projects.length === 0 && !isLoading && <p className="text-sm text-slate-500">No projects assigned yet.</p>}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
