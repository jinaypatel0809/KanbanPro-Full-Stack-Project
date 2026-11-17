import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  PauseCircle, 
  Flag, 
  Code2, 
  ArrowRight, 
  Rocket,
  ChevronDown,
  X,
  Send,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function UserProjectsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('My Projects');
  const [filterTab, setFilterTab] = useState('All Projects');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [dailyProgress, setDailyProgress] = useState('0');
  const [dailyNote, setDailyNote] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportMessage, setReportMessage] = useState('');

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        const result = await apiRequest('/user/projects', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setProjectsList(result.projects);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadProjects();
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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
    { name: 'My Projects', icon: FolderKanban, path: '/user-projects' },
    { name: 'My Tasks', icon: CheckSquare, path: '/user-tasks' },
    { name: 'Notifications', icon: Bell, path: '/user-notifications' },
    { name: 'My Profile', icon: User, path: '/user-profile' },
    { name: 'Settings', icon: Settings, path: '/user-settings' },
  ];

  const displayProjects = projectsList.map((project) => ({
    ...project,
    description: project.category,
    filterCategory: project.status,
    icon: Code2,
    iconColor: 'text-indigo-600',
    barColor: project.status === 'Completed' ? 'bg-emerald-500' : project.status === 'On Hold' ? 'bg-amber-500' : 'bg-indigo-600',
  }));

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return { bg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' };
      case 'In Progress':
        return { bg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };
      case 'On Hold':
        return { bg: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' };
      case 'Completed':
        return { bg: 'bg-purple-50 text-purple-600', dot: 'bg-purple-500' };
      default:
        return { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500' };
    }
  };

  // Filtered Projects
  const filteredProjects = displayProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab =
      filterTab === 'All Projects' || project.filterCategory === filterTab;

    return matchesSearch && matchesTab;
  });

  const openProject = (project) => {
    setSelectedProject(project);
    setDailyProgress(String(project.progress ?? 0));
    const reportDate = project.latestReport?.reportDate
      ? new Date(project.latestReport.reportDate).toISOString().slice(0, 10)
      : '';
    setDailyNote(reportDate === new Date().toISOString().slice(0, 10)
      ? project.latestReport.note || ''
      : '');
    setReportMessage('');
  };

  const submitDailyReport = async (event) => {
    event.preventDefault();
    if (!selectedProject) return;
    setReportSubmitting(true);
    setReportMessage('');
    setError('');
    try {
      const { report } = await apiRequest(
        `/user/projects/${selectedProject._id}/daily-reports`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
          body: JSON.stringify({ progress: Number(dailyProgress), note: dailyNote }),
        },
      );
      const updatedProject = {
        ...selectedProject,
        progress: report.progress,
        latestReport: report,
      };
      setProjectsList((current) => current.map((project) => (
        project._id === updatedProject._id ? updatedProject : project
      )));
      setSelectedProject(updatedProject);
      setReportMessage('Your daily progress report was saved.');
    } catch (requestError) {
      setReportMessage(requestError.message);
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#111625] text-slate-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl">
              K
            </div>
            <span className="font-bold text-2xl tracking-tight text-white">
              Kanban<span className="text-purple-400">Pro</span>
            </span>
          </div>

          {/* Navigation Menu */}
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
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA Card & Logout */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4 rounded-2xl border border-indigo-500/25 relative overflow-hidden">
            <Rocket className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-bold text-white text-sm">Keep Going!</h4>
            <p className="text-xs text-indigo-200 mt-1 mb-3">You're making great progress!</p>
            <button 
              onClick={() => navigate('/user-tasks')}
              className="w-full py-2 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1.5 transition-all"
            >
              View Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
              {sessionStorage.getItem('profilePhoto') ? (
                <img
                  src={sessionStorage.getItem('profilePhoto')}
                  alt="User profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold ring-2 ring-indigo-500">
                  {(sessionStorage.getItem('userName') || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                    {sessionStorage.getItem('userName') || 'User'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Member</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 space-y-6">
          
          {/* Header & Filter Tabs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">My Projects</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  View and manage your assigned projects
                </p>
              </div>
            </div>

            {/* Filter Pill Bar */}
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1 flex-wrap">
              {['All Projects', 'Active', 'On Hold', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    filterTab === tab
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading assigned projects...</p>}

          {/* ================= SUMMARY STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Projects */}
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Projects</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{projectsList.length}</div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Projects</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{projectsList.filter((project) => project.status === 'Active').length}</div>
              </div>
            </div>

            {/* On Hold */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <PauseCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">On Hold</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{projectsList.filter((project) => project.status === 'On Hold').length}</div>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                <Flag className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{projectsList.filter((project) => project.status === 'Completed').length}</div>
              </div>
            </div>
          </div>

          {/* ================= PROJECTS CARDS GRID ================= */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const ProjectIcon = project.icon;
                const badgeStyle = getStatusBadge(project.status);
                return (
                  <div
                    key={project._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Image with Floating Status Badge */}
                      <div className="h-44 w-full rounded-2xl overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-indigo-300">
                            <FolderKanban className="w-12 h-12" />
                          </div>
                        )}
                        <span
                          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${badgeStyle.bg}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
                          {project.status}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <ProjectIcon className={`w-5 h-5 shrink-0 ${project.iconColor}`} />
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Tech Stack Tags */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {(project.tech || []).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Progress, Meta Info & View Details Button */}
                    <div className="mt-5 space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-slate-800 dark:text-slate-100">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${project.barColor}`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          {project.latestReport?.submittedAt
                            ? `Reported ${new Date(project.latestReport.submittedAt).toLocaleDateString()}`
                            : 'No report today'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-500" />
                          Assigned to you
                        </span>
                      </div>

                      <button
                        onClick={() => openProject(project)}
                        className="w-full py-2.5 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-sm">
              No projects found in "{filterTab}".
            </div>
          )}

        </main>
      </div>

      {/* ================= PROJECT DETAILS MODAL ================= */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 relative">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedProject.image ? (
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-40 object-cover rounded-2xl mb-4"
              />
            ) : (
              <div className="w-full h-40 rounded-2xl mb-4 bg-indigo-50 text-indigo-300 flex items-center justify-center">
                <FolderKanban className="w-12 h-12" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedProject.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(selectedProject.status).bg}`}>
                {selectedProject.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {selectedProject.description}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {(selectedProject.tech || []).map((t, i) => (
                <span key={i} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-lg text-xs font-semibold">
                  {t}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Current progress</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedProject.progress}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Last report</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedProject.latestReport?.submittedAt
                    ? new Date(selectedProject.latestReport.submittedAt).toLocaleDateString()
                    : 'No report yet'}
                </span>
              </div>
            </div>

            <form onSubmit={submitDailyReport} className="mt-5 space-y-3">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Today's completion percentage
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  required
                  value={dailyProgress}
                  onChange={(event) => setDailyProgress(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                Daily update (optional)
                <textarea
                  maxLength="500"
                  value={dailyNote}
                  onChange={(event) => setDailyNote(event.target.value)}
                  rows="3"
                  className="mt-1 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  placeholder="What did you complete today?"
                />
              </label>
              {reportMessage && (
                <p role="status" className={`text-xs ${reportMessage.includes('saved') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {reportMessage}
                </p>
              )}
              <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                type="button"
                className="w-1/2 py-2.5 border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 rounded-xl text-sm"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={reportSubmitting}
                className="w-1/2 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {reportSubmitting ? 'Submitting...' : 'Submit Daily Report'}
              </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}