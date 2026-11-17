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
  Filter, 
  Rocket, 
  ArrowUpRight,
  Clock,
  Calendar,       // <--- Ahiya Calendar add karvanu chhe
  ChevronLeft,    // <--- Pagination buttons mate aapanne ChevronLeft ane ChevronRight pan joi sakay
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function SystemActivitiesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('System Activities');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityData, setActivityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [actorFilter, setActorFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let active = true;
    const loadActivities = async () => {
      try {
        const result = await apiRequest('/activities', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setActivityData(result);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadActivities();
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

  const activitiesList = activityData?.activities || [];
  const actors = [...new Set(activitiesList.map((item) => item.actorName))];
  const filteredActivities = activitiesList.filter((item) => {
    const matchesSearch = `${item.actorName} ${item.actorEmail} ${item.details} ${item.module} ${item.action}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch &&
      (actionFilter === 'All' || item.action === actionFilter) &&
      (moduleFilter === 'All' || item.module === moduleFilter) &&
      (actorFilter === 'All' || item.actorName === actorFilter);
  });
  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const visibleActivities = filteredActivities.slice((page - 1) * pageSize, page * pageSize);
  const activityCounts = ['Login', 'Register', 'Create', 'Update', 'Delete'].map((action) => ({
    action,
    count: activitiesList.filter((item) => item.action === action).length,
  }));
  const latestActivityCount = activitiesList.length;

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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">System Activities</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                Review actions actually recorded for accounts and projects.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Latest recorded events</span>
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading activity records...</p>}

          {/* ================= SUMMARY STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Activities */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-purple-500/20 text-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Database</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activityData?.summary.total ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Total Activities</div>
              </div>
            </div>

            {/* User Actions */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Database</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activityData?.summary.accounts ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Account Activities</div>
              </div>
            </div>

            {/* Project Activities */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-emerald-500/20 text-emerald-600 rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Database</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activityData?.summary.projects ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Project Activities</div>
              </div>
            </div>

            {/* System Events */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-amber-500/20 text-amber-600 rounded-xl flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Database</span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-slate-900 dark:text-white">{activityData?.summary.tasks ?? '—'}</div>
                <div className="text-xs font-medium text-slate-500">Task Events</div>
              </div>
            </div>
          </div>

          {/* ================= MAIN LAYOUT WITH SIDEBAR ANALYTICS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Activities Table Section */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col justify-between">
              
              {/* Search & Filters Bar */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={actionFilter}
                    onChange={(e) => {
                      setActionFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  >
                    <option value="All">All Actions</option>
                    {['Login', 'Register', 'Create', 'Update', 'Delete'].map((action) => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </select>
                  <select
                    value={actorFilter}
                    onChange={(e) => {
                      setActorFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  >
                    <option value="All">All Actors</option>
                    {actors.map((actor) => <option key={actor} value={actor}>{actor}</option>)}
                  </select>
                  <select
                    value={moduleFilter}
                    onChange={(e) => {
                      setModuleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium"
                  >
                    <option value="All">All Modules</option>
                    {['Authentication', 'Account', 'Project', 'Task'].map((module) => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActionFilter('All');
                      setActorFilter('All');
                      setModuleFilter('All');
                      setPage(1);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    <Filter className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b text-[11px] font-semibold text-slate-400">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Activity</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Details</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {visibleActivities.map((item, index) => {
                      const actionColors = {
                        Login: 'bg-emerald-100 text-emerald-700',
                        Register: 'bg-indigo-100 text-indigo-700',
                        Create: 'bg-blue-100 text-blue-700',
                        Update: 'bg-purple-100 text-purple-700',
                        Delete: 'bg-red-100 text-red-700',
                      };
                      return (
                      <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-slate-400">{(page - 1) * pageSize + index + 1}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            {(item.actorName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{item.actorName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${actionColors[item.action] || 'bg-slate-100 text-slate-700'}`}>
                            {item.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{item.module}</td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{item.details}</td>
                        <td className="py-3 px-4 text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {new Date(item.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">{item.actorRole}</td>
                      </tr>
                      );
                    })}
                    {!isLoading && visibleActivities.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-sm text-slate-500">
                          {error ? 'Activity data could not be loaded.' : 'No activity records match your filters.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 px-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>
                  Showing {filteredActivities.length ? (page - 1) * pageSize + 1 : 0}–
                  {Math.min(page * pageSize, filteredActivities.length)} of {filteredActivities.length}
                  {activityData ? ` matches (${Math.min(activityData.summary.total, 200)} latest loaded)` : ''}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 font-semibold">{page} / {pageCount}</span>
                  <button
                    disabled={page >= pageCount}
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    className="p-1.5 border rounded-lg hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Widgets Column (Activity Summary & Live Feed) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Activity Summary */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" /> Activity Summary
                </h3>

                <div className="space-y-3 text-xs">
                  {activityCounts.map((sum) => {
                    const percentage = latestActivityCount
                      ? Math.round((sum.count / latestActivityCount) * 100)
                      : 0;
                    const colors = {
                      Login: 'bg-emerald-500',
                      Register: 'bg-indigo-500',
                      Create: 'bg-blue-500',
                      Update: 'bg-purple-600',
                      Delete: 'bg-red-500',
                    };
                    return (
                    <div key={sum.action} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-20">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[sum.action]}`}></span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">{sum.action}</span>
                      </div>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[sum.action]} rounded-full`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200 w-14 text-right">
                        {sum.count} ({percentage}%)
                      </span>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" /> Recent Activity Feed
                  </h3>
                  <button className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                    View All <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="relative pl-4 space-y-4 border-l-2 border-slate-100 dark:border-slate-800 text-xs">
                  {activitiesList.slice(0, 4).map((feed) => {
                    const colors = {
                      Login: 'bg-emerald-500',
                      Register: 'bg-indigo-500',
                      Create: 'bg-blue-500',
                      Update: 'bg-purple-600',
                      Delete: 'bg-red-500',
                    };
                    return (
                    <div key={feed._id} className="relative">
                      <span className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${colors[feed.action]}`}></span>
                      <div className="text-[11px] text-slate-400">{new Date(feed.createdAt).toLocaleString()}</div>
                      <div className="font-semibold text-slate-700 dark:text-slate-200 mt-0.5">
                        {feed.actorName} {feed.details}
                      </div>
                    </div>
                    );
                  })}
                  {!isLoading && activitiesList.length === 0 && (
                    <p className="text-xs text-slate-500">No activity has been recorded yet.</p>
                  )}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}