import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  FileText, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  Calendar, 
  Rocket, 
  X,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function AdminProjectsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectsList, setProjectsList] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignmentSelections, setAssignmentSelections] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProjectId, setSavingProjectId] = useState('');
  const [reportsForProject, setReportsForProject] = useState(null);
  const [projectReports, setProjectReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        const result = await apiRequest('/admin/projects', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) {
          setProjectsList(result.projects);
          setTeamMembers(result.teamMembers);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProjects();
    return () => { active = false; };
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/admin-projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin-tasks' },
    { name: 'Team Members', icon: Users, path: '/admin-team' },
    { name: 'Reports', icon: FileText, path: '/admin-reports' },
    { name: 'Settings', icon: Settings, path: '/admin-settings' },
  ];

  const categories = [...new Set(projectsList.map((project) => project.category))];
  const filteredProjects = projectsList.filter(proj => 
    proj.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    proj.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter((project) => (
    (statusFilter === 'All' || project.status === statusFilter) &&
    (categoryFilter === 'All' || project.category === categoryFilter)
  ));

  const saveAssignment = async (project) => {
    const userId = assignmentSelections[project._id] ??
      project.assignedTo?._id ?? project.assignedTo?.id ?? null;
    setSavingProjectId(project._id);
    setError('');
    try {
      const { project: updatedProject } = await apiRequest(
        `/admin/projects/${project._id}/assignment`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
          body: JSON.stringify({ userId: userId || null }),
        },
      );
      setProjectsList((current) => current.map((item) => (
        item._id === updatedProject._id ? { ...item, ...updatedProject } : item
      )));
      setAssignmentSelections((current) => {
        const next = { ...current };
        delete next[project._id];
        return next;
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProjectId('');
    }
  };

  const viewDailyReports = async (project) => {
    setReportsForProject(project);
    setProjectReports([]);
    setReportsLoading(true);
    try {
      const result = await apiRequest(`/admin/projects/${project._id}/daily-reports`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
      });
      setProjectReports(result.reports);
    } catch (requestError) {
      setError(requestError.message);
      setReportsForProject(null);
    } finally {
      setReportsLoading(false);
    }
  };

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
            <h4 className="font-bold text-white text-sm">Manage Projects Smarter!</h4>
            <p className="text-xs text-indigo-200 mt-1 mb-3">Stay organized and achieve more together.</p>
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
            <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-5">
            <Bell className="w-5 h-5 text-slate-500 cursor-pointer" />
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              {sessionStorage.getItem('profilePhoto') ? (
                <img src={sessionStorage.getItem('profilePhoto')} alt="Admin profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                  {(sessionStorage.getItem('userName') || 'A').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold leading-tight">{sessionStorage.getItem('userName') || 'Admin'}</span>
                <span className="text-[11px] text-slate-400 font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Projects</h1>
            <p className="text-slate-500 text-sm">Assign Super Admin projects to team members and review daily progress.</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading projects...</p>}

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-950 shadow-sm">
              <div className="text-sm text-slate-500">Total Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-950 shadow-sm">
              <div className="text-sm text-slate-500">Active Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter((project) => project.status === 'Active').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-950 shadow-sm">
              <div className="text-sm text-slate-500">On Hold</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter((project) => project.status === 'On Hold').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950 shadow-sm">
              <div className="text-sm text-slate-500">Completed</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter((project) => project.status === 'Completed').length}</div>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
            <input 
              type="text" 
              placeholder="Search projects by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-600"
              >
                <option value="All">All Status</option>
                {['Active', 'Completed', 'On Hold'].map((status) => <option key={status}>{status}</option>)}
              </select>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-600"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </div>
          </div>

          {/* PROJECTS GRID CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-300">
                        <FolderKanban className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold shadow">
                      <span className={`w-2 h-2 rounded-full ${project.status === 'Active' ? 'bg-emerald-500' : project.status === 'Completed' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                      {project.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{project.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{project.category}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(project.tech || []).map((t, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-md text-[11px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-700 dark:text-slate-200">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Created {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}
                    </div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Assign to team member
                      <select
                        value={assignmentSelections[project._id] ??
                          project.assignedTo?._id ?? project.assignedTo?.id ?? ''}
                        onChange={(event) => setAssignmentSelections((current) => ({
                          ...current,
                          [project._id]: event.target.value,
                        }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.fullName} ({member.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveAssignment(project)}
                        disabled={savingProjectId === project._id}
                        className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingProjectId === project._id ? 'Saving...' : 'Save Assignment'}
                      </button>
                      <button
                        onClick={() => viewDailyReports(project)}
                        className="flex items-center gap-1 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-600 dark:border-indigo-800 dark:text-indigo-300"
                      >
                        <FileText className="h-3.5 w-3.5" /> Reports
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Assigned: {project.assignedTo?.fullName || 'Nobody yet'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!isLoading && filteredProjects.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              No projects match the selected filters.
            </div>
          )}
        </main>
      </div>

      {reportsForProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Progress Reports</h2>
                <p className="text-sm text-slate-500">{reportsForProject.title}</p>
              </div>
              <button
                onClick={() => setReportsForProject(null)}
                aria-label="Close daily reports"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {reportsLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">Loading daily reports...</p>
            ) : projectReports.length ? (
              <div className="max-h-[60vh] space-y-3 overflow-y-auto">
                {projectReports.map((report) => (
                  <article key={report._id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{report.user?.fullName || 'Former user'}</p>
                        <p className="text-xs text-slate-500">{report.user?.email || ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-indigo-600">{report.progress}% complete</p>
                        <p className="text-xs text-slate-500">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {report.note && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{report.note}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">No daily reports have been submitted for this project.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}