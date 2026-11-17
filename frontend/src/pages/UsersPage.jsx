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
  UserPlus, 
  Filter, 
  Eye,
  Edit,
  Trash2,
  Rocket,
  X
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function UsersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Users');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Member',
    status: 'Active',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
  });

  useEffect(() => {
    let active = true;
    const loadUsers = async () => {
      try {
        const result = await apiRequest('/auth/users', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setUsersList(result.users);
      } catch (requestError) {
        if (active) setPageError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadUsers();
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

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormError('');
    setFormData({
      fullName: '',
      email: '',
      role: 'Member',
      status: 'Active',
      password: '',
      confirmPassword: '',
      profilePhoto: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setEditingUserId(user.id);
    setFormError('');
    setFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
      profilePhoto: null,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!editingUserId && (!formData.password || !formData.profilePhoto)) {
      setFormError('Password and profile image are required.');
      return;
    }
    if (formData.profilePhoto && formData.profilePhoto.size > 1024 * 1024) {
      setFormError('Choose an image smaller than 1 MB.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const body = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };
      if (formData.password) body.password = formData.password;
      if (formData.profilePhoto) {
        body.profilePhoto = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') resolve(reader.result);
            else reject(new Error('Could not read the selected user image.'));
          };
          reader.onerror = () => reject(new Error('Could not read the selected user image.'));
          reader.readAsDataURL(formData.profilePhoto);
        });
      }
      const result = await apiRequest(
        editingUserId ? `/auth/users/${editingUserId}` : '/auth/users',
        {
        method: editingUserId ? 'PATCH' : 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        body: JSON.stringify(body),
        },
      );
      setUsersList((currentUsers) => editingUserId
        ? currentUsers.map((user) => user.id === editingUserId ? result.user : user)
        : [result.user, ...currentUsers]);
      setIsModalOpen(false);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.fullName}'s account?`)) return;
    try {
      await apiRequest(`/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
      });
      setUsersList((currentUsers) => currentUsers.filter((item) => item.id !== user.id));
    } catch (requestError) {
      setPageError(requestError.message);
    }
  };

  const filteredUsers = usersList.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Users</h1>
              <p className="text-slate-500 text-sm">Manage all users in your system.</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Add New User
            </button>
          </div>

          {/* USERS STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-950 shadow-sm">
              <div className="text-sm text-slate-500">Total Users</div>
              <div className="text-2xl font-black mt-1">{usersList.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950 shadow-sm">
              <div className="text-sm text-slate-500">Active Users</div>
              <div className="text-2xl font-black mt-1">{usersList.filter(user => user.status === 'Active').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-950 shadow-sm">
              <div className="text-sm text-slate-500">Inactive Users</div>
              <div className="text-2xl font-black mt-1">{usersList.filter(user => user.status === 'Inactive').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-950 shadow-sm">
              <div className="text-sm text-slate-500">Admin Accounts</div>
              <div className="text-2xl font-black mt-1">{usersList.filter(user => user.role === 'Admin').length}</div>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <input 
                type="text" 
                placeholder="Search users by name or email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-xs text-slate-500">
                  <th className="py-3.5 px-6">#</th>
                  <th className="py-3.5 px-6">Avatar</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {pageError ? (
                  <tr>
                    <td colSpan="7" role="alert" className="text-center py-6 text-red-600">{pageError}</td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-400">Loading users...</td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-4 px-6 font-medium text-slate-500">{index + 1}</td>
                      <td className="py-4 px-6">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold">{user.fullName}</td>
                      <td className="py-4 px-6 text-slate-500">{user.email}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role === 'Member' ? 'User' : user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button onClick={() => setViewUser(user)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEditModal(user)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(user)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-6 text-slate-400">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* ================= ADD USER MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {editingUserId ? 'Edit User Account' : 'Add New User'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {editingUserId ? 'Update user details and access permissions.' : 'Create a new user account on KanbanPro.'}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Password {editingUserId ? '(leave blank to keep current)' : ''}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  minLength={editingUserId ? undefined : 8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required={!editingUserId}
                  minLength={editingUserId ? undefined : 8}
                  autoComplete="new-password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="user-photo" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  User image (required, max 1 MB)
                </label>
                <input
                  id="user-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={!editingUserId}
                  onChange={(e) => {
                    const profilePhoto = e.target.files?.[0] || null;
                    if (profilePhoto && profilePhoto.size > 1024 * 1024) {
                      setFormError('Choose an image smaller than 1 MB.');
                      e.target.value = '';
                      setFormData({ ...formData, profilePhoto: null });
                      return;
                    }
                    setFormError('');
                    setFormData({ ...formData, profilePhoto });
                  }}
                  className="w-full text-xs text-slate-600 dark:text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Role</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Member">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 px-4 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm"
                >
                  {isSubmitting ? 'Saving...' : editingUserId ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold">User Details</h3>
              <button onClick={() => setViewUser(null)} aria-label="Close details">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="mt-5 flex flex-col items-center gap-3">
              {viewUser.profilePhoto && (
                <img src={viewUser.profilePhoto} alt={`${viewUser.fullName} profile`} className="w-20 h-20 rounded-full object-cover" />
              )}
              <p className="font-bold">{viewUser.fullName}</p>
              <p className="text-sm text-slate-500">{viewUser.email}</p>
              <p className="text-sm">{viewUser.role === 'Member' ? 'User' : viewUser.role} · {viewUser.status}</p>
              <p className="text-xs text-slate-400">
                Created {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}