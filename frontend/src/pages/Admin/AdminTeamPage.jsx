import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  FileText,
  Filter,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
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

export default function AdminTeamPage() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [summary, setSummary] = useState({
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    projects: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadTeam = async () => {
      try {
        const result = await apiRequest('/admin/team', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
        });
        if (active) {
          setTeamMembers(result.teamMembers);
          setSummary(result.summary);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadTeam();
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const filteredTeam = teamMembers.filter((member) => {
    const searchText = `${member.fullName} ${member.email} ${member.role}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase()) &&
      (statusFilter === 'All' || (member.status || 'Active') === statusFilter);
  });

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
                    item.name === 'Team Members' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
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
            <h4 className="text-sm font-bold text-white">Manage Your Team</h4>
            <p className="mt-1 text-xs text-indigo-200">Member and project assignments from the database.</p>
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
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search team members..."
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
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Team Members</h1>
            <p className="mt-1 text-sm text-slate-500">Member accounts and project assignments from your database.</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {isLoading && <p className="text-sm text-slate-500">Loading team members...</p>}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Members', value: summary.totalMembers, icon: Users },
              { label: 'Active Members', value: summary.activeMembers, icon: CheckCircle2 },
              { label: 'Inactive Members', value: summary.inactiveMembers, icon: ShieldCheck },
              { label: 'Projects', value: summary.projects, icon: FolderKanban },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
                  <Icon className="h-5 w-5" />
                </div>
                <div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email or role..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <Filter className="h-4 w-4" />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <option value="All">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-800/60">
                  <tr>
                    <th className="p-4">Member</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned Projects</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTeam.map((member) => (
                    <tr key={member._id}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                            {(member.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold">{member.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">{member.email}</td>
                      <td className="p-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{member.role}</span></td>
                      <td className="p-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${member.status === 'Inactive' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {member.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1.5">
                          {member.projects.map((project) => (
                            <span key={project} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{project}</span>
                          ))}
                          {member.projects.length === 0 && <span className="text-xs text-slate-400">No projects assigned</span>}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-slate-500">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => setSelectedMember(member)} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredTeam.length === 0 && (
                    <tr><td colSpan="7" className="p-8 text-center text-sm text-slate-500">No team members match the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
              Showing {filteredTeam.length} of {teamMembers.length} members
            </p>
          </section>
        </main>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedMember.fullName}</h2>
                <p className="text-sm text-slate-500">{selectedMember.email}</p>
              </div>
              <button onClick={() => setSelectedMember(null)} aria-label="Close member details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm"><span className="font-semibold">Status:</span> {selectedMember.status || 'Active'}</p>
            <h3 className="mt-5 font-semibold">Assigned Projects</h3>
            {selectedMember.projects.length ? (
              <ul className="mt-2 space-y-2">
                {selectedMember.projects.map((project) => <li key={project} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><FolderKanban className="h-4 w-4 text-indigo-500" />{project}</li>)}
              </ul>
            ) : <p className="mt-2 text-sm text-slate-500">No projects assigned.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
