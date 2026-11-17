import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Bell,
  CheckSquare,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Palette,
  Settings,
  ShieldCheck,
  Sun,
  User,
  Users,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { applyUserTheme } from '../lib/theme';

const navigationByRole = {
  Member: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
    { name: 'My Projects', icon: FolderKanban, path: '/user-projects' },
    { name: 'My Tasks', icon: CheckSquare, path: '/user-tasks' },
    { name: 'Notifications', icon: Bell, path: '/user-notifications' },
    { name: 'My Profile', icon: User, path: '/user-profile' },
    { name: 'Settings', icon: Settings, path: '/user-settings' },
  ],
  Admin: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/admin-projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin-tasks' },
    { name: 'Team Members', icon: Users, path: '/admin-team' },
    { name: 'Reports', icon: FileText, path: '/admin-reports' },
    { name: 'Analytics', icon: BarChart3, path: '/admin-analytics' },
    { name: 'Settings', icon: Settings, path: '/admin-settings' },
  ],
  'Super Admin': [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin-dashboard' },
    { name: 'Admins', icon: ShieldCheck, path: '/super-admin-admins' },
    { name: 'Users', icon: Users, path: '/super-admin-users' },
    { name: 'Projects', icon: FolderKanban, path: '/super-admin-projects' },
    { name: 'Reports', icon: FileText, path: '/super-admin-reports' },
    { name: 'Analytics', icon: BarChart3, path: '/super-admin-analytics' },
    { name: 'System Activities', icon: Activity, path: '/super-admin-activities' },
    { name: 'Settings', icon: Settings, path: '/super-admin-settings' },
  ],
};

const authHeaders = () => ({
  Authorization: `Bearer ${sessionStorage.getItem('authToken')}`,
});

const readProfilePhoto = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string'
    ? resolve(reader.result)
    : reject(new Error('Could not read the selected image.'));
  reader.onerror = () => reject(new Error('Could not read the selected image.'));
  reader.readAsDataURL(file);
});

export default function AccountSettingsPage({ role }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [theme, setTheme] = useState('System');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const { user } = await apiRequest('/auth/me', { headers: authHeaders() });
        if (active) {
          setProfile(user);
          setFullName(user.fullName);
          setProfilePhoto(user.profilePhoto);
          setTheme(user.theme || 'System');
          sessionStorage.setItem('userName', user.fullName);
          sessionStorage.setItem('profilePhoto', user.profilePhoto);
          applyUserTheme(user.theme || 'System');
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

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setError('Profile photos must be 1 MB or smaller.');
      return;
    }
    try {
      setError('');
      setSuccess('');
      setProfilePhoto(await readProfilePhoto(file));
    } catch (photoError) {
      setError(photoError.message);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSavingProfile(true);
    try {
      const { user } = await apiRequest('/auth/me', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ fullName, profilePhoto }),
      });
      setProfile(user);
      setFullName(user.fullName);
      setProfilePhoto(user.profilePhoto);
      sessionStorage.setItem('userName', user.fullName);
      sessionStorage.setItem('profilePhoto', user.profilePhoto);
      setSuccess('Profile updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must contain at least 8 characters.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await apiRequest('/auth/me', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const saveTheme = async (nextTheme) => {
    const previousTheme = theme;
    setTheme(nextTheme);
    setError('');
    setSuccess('');
    setIsSavingTheme(true);
    try {
      const { user } = await apiRequest('/auth/me', {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ theme: nextTheme }),
      });
      setProfile(user);
      setTheme(user.theme);
      applyUserTheme(user.theme);
      setSuccess('Theme preference saved.');
    } catch (requestError) {
      setTheme(previousTheme);
      setError(requestError.message);
    } finally {
      setIsSavingTheme(false);
    }
  };

  const menuItems = navigationByRole[role] || navigationByRole.Member;
  const displayName = profile?.fullName || 'Account';

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
                    item.name === 'Settings' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
          <span className="text-sm font-medium text-slate-500">Account Settings</span>
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800">
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={`${displayName} profile`} className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-semibold text-white">{displayName.charAt(0).toUpperCase()}</div>
            )}
            <div>
              <p className="max-w-40 truncate text-sm font-semibold">{displayName}</p>
              <p className="text-[11px] text-slate-400">{profile?.role || role}</p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl space-y-6 p-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">Update your account details, password, and theme.</p>
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
          {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{success}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading account settings...</p>}

          <form onSubmit={saveProfile} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="flex items-center gap-2 font-bold"><User className="h-5 w-5 text-indigo-600" /> Profile</h2>
              <p className="mt-1 text-xs text-slate-500">Change the name and picture shown on your account.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile preview" className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">{(fullName || 'U').charAt(0).toUpperCase()}</div>
              )}
              <label className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                Choose profile photo
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="sr-only" />
              </label>
              <span className="text-xs text-slate-400">JPG, PNG, or WebP · up to 1 MB</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Full name
                <input
                  required
                  maxLength={100}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="text-sm font-medium">
                Email address
                <input value={profile?.email || ''} readOnly className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-slate-500 dark:border-slate-700 dark:bg-slate-800" />
              </label>
            </div>
            <button type="submit" disabled={isLoading || isSavingProfile} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
              {isSavingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <form onSubmit={savePassword} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="flex items-center gap-2 font-bold"><CheckSquare className="h-5 w-5 text-indigo-600" /> Change Password</h2>
              <p className="mt-1 text-xs text-slate-500">Enter your current password before choosing a new one.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-sm font-medium">
                Current password
                <input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="text-sm font-medium">
                New password
                <input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
              </label>
              <label className="text-sm font-medium">
                Confirm new password
                <input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800" />
              </label>
            </div>
            <button type="submit" disabled={isSavingPassword} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="flex items-center gap-2 font-bold"><Palette className="h-5 w-5 text-indigo-600" /> Theme</h2>
              <p className="mt-1 text-xs text-slate-500">Save a theme preference to your account and apply it across the app.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { name: 'Light', icon: Sun },
                { name: 'Dark', icon: Moon },
                { name: 'System', icon: Settings },
              ].map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  type="button"
                  disabled={isSavingTheme || isLoading}
                  onClick={() => saveTheme(name)}
                  aria-pressed={theme === name}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-60 ${
                    theme === name ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {name}
                </button>
              ))}
            </div>
            {isSavingTheme && <p className="text-xs text-slate-500">Saving theme...</p>}
          </section>
        </main>
      </div>
    </div>
  );
}
