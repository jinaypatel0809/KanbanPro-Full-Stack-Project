import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
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

export default function UserNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(() => new Date().toDateString());
  const userName = sessionStorage.getItem('userName') || 'User';
  const profilePhoto = sessionStorage.getItem('profilePhoto');

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const result = await apiRequest('/user/notifications', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) {
          setNotifications(result.notifications);
          setError('');
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadNotifications();
    const refreshInterval = window.setInterval(loadNotifications, 5000);
    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
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
                    item.name === 'Notifications' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
          <span className="text-sm font-medium text-slate-500">Notifications</span>
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

        <main className="mx-auto w-full max-w-4xl space-y-5 p-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Notifications</h1>
            <p className="mt-1 text-sm text-slate-500">Project and task assignments from your Admin.</p>
          </div>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading notifications...</p>}
          <div className="space-y-3">
            {notifications.map((notification) => {
              const isToday = new Date(notification.createdAt).toDateString() === today;
              const isProject = notification.type === 'ProjectAssigned';
              const message = `Admin assigned you a ${isProject ? 'project' : 'task'}${isToday ? ' today' : ''}.`;
              return (
                <div key={notification._id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    {isProject ? <FolderKanban className="h-5 w-5" /> : <CheckSquare className="h-5 w-5" />}
                  </div>
                  <p className="font-semibold">{message}</p>
                </div>
              );
            })}
            {notifications.length === 0 && !isLoading && !error && (
              <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                No project or task assignments yet.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
