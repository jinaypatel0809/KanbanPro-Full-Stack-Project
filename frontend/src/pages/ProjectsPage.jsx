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
  Plus, 
  Filter, 
  Eye,
  Edit, 
  Trash2, 
  Calendar,
  Rocket,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Projects');
  const [searchTerm, setSearchTerm] = useState('');

  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [viewProject, setViewProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    status: 'Active',
    progress: 50,
    tech: 'React, Node.js',
    image: ''
  });

  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        const result = await apiRequest('/projects', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) setProjectsList(result.projects);
      } catch (requestError) {
        if (active) setPageError(requestError.message);
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
    { name: 'Dashboard', icon: LayoutDashboard, path: '/super-admin-dashboard' },
    { name: 'Admins', icon: ShieldCheck, path: '/super-admin-admins' },
    { name: 'Users', icon: Users, path: '/super-admin-users' },
    { name: 'Projects', icon: FolderKanban, path: '/super-admin-projects' },
    { name: 'Reports', icon: FileText, path: '/super-admin-reports' },
    { name: 'Analytics', icon: BarChart3, path: '/super-admin-analytics' },
    { name: 'System Activities', icon: Activity, path: '/super-admin-activities' },
    { name: 'Settings', icon: Settings, path: '/super-admin-settings' },
  ];

  // Open Create Project Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentProjectId(null);
    setFormError('');
    setFormData({ title: '', category: '', status: 'Active', progress: 10, tech: 'React, Node.js', image: '' });
    setIsModalOpen(true);
  };

  // Open Edit Project Modal
  const handleOpenEditModal = (project) => {
    setIsEditing(true);
    setCurrentProjectId(project.id);
    setFormError('');
    setFormData({ 
      title: project.title, 
      category: project.category, 
      status: project.status, 
      progress: project.progress, 
      tech: project.tech.join(', '), 
      image: project.image 
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setFormError('Choose an image smaller than 1 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setFormError('Could not read the selected project image.');
        return;
      }
      setFormError('');
      setFormData((currentData) => ({ ...currentData, image: reader.result }));
    };
    reader.onerror = () => setFormError('Could not read the selected project image.');
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      const result = await apiRequest(
        isEditing ? `/projects/${currentProjectId}` : '/projects',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            status: formData.status,
            progress: Number(formData.progress),
            tech: formData.tech.split(',').map((item) => item.trim()).filter(Boolean),
            image: formData.image,
          }),
        },
      );
      setProjectsList((currentProjects) => isEditing
        ? currentProjects.map((project) => project.id === currentProjectId ? result.project : project)
        : [result.project, ...currentProjects]);
      setIsModalOpen(false);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Delete "${project.title}"?`)) return;
    try {
      await apiRequest(`/projects/${project.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
      });
      setProjectsList((currentProjects) => currentProjects.filter((item) => item.id !== project.id));
    } catch (requestError) {
      setPageError(requestError.message);
    }
  };

  const filteredProjects = projectsList.filter(proj => 
    proj.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    proj.category.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Projects</h1>
              <p className="text-slate-500 text-sm">Manage and track all your projects in one place.</p>
            </div>
            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Project
            </button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-950 shadow-sm">
              <div className="text-sm text-slate-500">Total Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-950 shadow-sm">
              <div className="text-sm text-slate-500">Active Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter(p => p.status === 'Active').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-950 shadow-sm">
              <div className="text-sm text-slate-500">On Hold Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter(p => p.status === 'On Hold').length}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-950 shadow-sm">
              <div className="text-sm text-slate-500">Completed Projects</div>
              <div className="text-2xl font-black mt-1">{projectsList.filter(p => p.status === 'Completed').length}</div>
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
              <select className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-medium text-slate-600">
                <option>All Status</option>
                <option>Active</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
          </div>

          {/* PROJECTS GRID CARDS */}
          {pageError && <p role="alert" className="text-sm text-red-600">{pageError}</p>}
          {isLoading ? (
            <p className="py-6 text-center text-slate-400">Loading projects...</p>
          ) : filteredProjects.length === 0 ? (
            <p className="py-6 text-center text-slate-400">No projects found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  {/* Project Image Header */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {project.image ? (
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-10 h-10" />
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

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.tech.map((t, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 rounded-md text-[11px] font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-700 dark:text-slate-200">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" style={{ width: `${project.progress}%` }}></div>
                    </div>
                  </div>

                  {/* Footer metadata & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewProject(project)} className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleOpenEditModal(project)} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteProject(project)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </main>
      </div>

      {/* ================= CREATE / EDIT PROJECT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {isEditing ? 'Edit Project' : 'Create New Project'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              {isEditing ? 'Update project details and specifications.' : 'Add a new project and assign custom image and tech stack.'}
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Project Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. E-Commerce Website"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Description</label>
                <textarea 
                  rows="2"
                  required
                  placeholder="Brief description of the project..."
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Progress (%)</label>
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Tech Stack (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="React, Node.js, MongoDB"
                  value={formData.tech}
                  onChange={(e) => setFormData({ ...formData, tech: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Project Image Selection/Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Project Image Upload</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 h-20 w-32 rounded-xl overflow-hidden border border-slate-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-2.5 px-4 border font-semibold text-slate-600 rounded-xl hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white font-semibold rounded-xl shadow-lg text-sm"
                >
                  {isSubmitting ? 'Saving...' : isEditing ? 'Update Project' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{viewProject.title}</h3>
              <button onClick={() => setViewProject(null)} aria-label="Close project details">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {viewProject.image && (
              <img src={viewProject.image} alt={viewProject.title} className="mt-4 h-48 w-full rounded-xl object-cover" />
            )}
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{viewProject.category}</p>
            <p className="mt-3 text-sm">Status: {viewProject.status} · Progress: {viewProject.progress}%</p>
            <p className="mt-2 text-sm text-slate-500">Tech stack: {viewProject.tech.join(', ') || '—'}</p>
            <p className="mt-2 text-xs text-slate-400">
              Created {new Date(viewProject.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}