import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  FileText, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  PieChart, 
  Trophy, 
  Lightbulb, 
  ArrowRight, 
  Rocket,
  ChevronDown,
  Zap // <--- Ahiya Zap add karvanu chhe
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Analytics');
  const [chartTab, setChartTab] = useState('30 Days');

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('profilePhoto');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { name: 'Projects', icon: FolderKanban, path: '/admin-projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin-tasks' },
    { name: 'Team Members', icon: Users, path: '/admin-team' },
    { name: 'Reports', icon: FileText, path: '/admin-reports' },
    { name: 'Analytics', icon: BarChart3, path: '/admin-analytics' },
    { name: 'Settings', icon: Settings, path: '/admin-settings' },
  ];

  const teamPerformance = [
    { name: 'Amit Vyas', role: 'Admin', pct: 95, color: 'bg-indigo-600', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { name: 'Sneha Desai', role: 'Developer', pct: 85, color: 'bg-sky-500', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
    { name: 'Rahul Mehta', role: 'Designer', pct: 70, color: 'bg-emerald-500', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
    { name: 'Priya Sharma', role: 'Developer', pct: 65, color: 'bg-amber-500', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
  ];

  const topProjects = [
    { name: 'E-Commerce Website', rate: 95, color: 'bg-indigo-600', img: 'https://images.unsplash.com/photo-1557821552-1710517667fc?w=100&auto=format&fit=crop&q=80' },
    { name: 'Gym Fitness App', rate: 80, color: 'bg-sky-500', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&auto=format&fit=crop&q=80' },
    { name: 'Travel Booking', rate: 72, color: 'bg-emerald-500', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&auto=format&fit=crop&q=80' },
  ];

  const insightsList = [
    { text: 'Your completed tasks increased by 18% compared to last month.', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-50' },
    { text: 'Pending tasks are 5% less than last month.', icon: Clock, color: 'text-indigo-500 bg-indigo-50' },
    { text: 'Team productivity is up by 8%.', icon: Zap, color: 'text-blue-500 bg-blue-50' }, // <--- Ahiya Zap seedho use karo
    { text: 'E-Commerce Website is your top performing project with 95% completion.', icon: Trophy, color: 'text-amber-500 bg-amber-50' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-[#111625] text-slate-300 flex flex-col justify-between p-4 shrink-0 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-4">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl">
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

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4 rounded-2xl border border-indigo-500/25 relative overflow-hidden">
            <Rocket className="w-8 h-8 text-purple-400 mb-2" />
            <h4 className="font-bold text-white text-sm">Get Advanced Insights!</h4>
            <p className="text-xs text-indigo-200 mt-1 mb-3">Track trends and improve productivity.</p>
            <button className="w-full py-2 px-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold rounded-lg shadow">
              Upgrade Plan
            </button>
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input type="text" placeholder="Search anything..." className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Avatar" className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500" />
              <div className="flex items-center gap-1">
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold leading-tight">Amit Vyas</span>
                  <span className="text-[11px] text-slate-400 font-medium">Admin</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Analytics Body */}
        <main className="p-8 space-y-6">
          
          {/* Header & Date Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Analytics</h1>
                <p className="text-slate-500 text-sm">Get deep insights into your projects and performance.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Last 30 Days</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* ================= SUMMARY STATS CARDS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-purple-600 text-white rounded-xl flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ +12%</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-500">Total Projects</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">8</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ +18%</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-500">Completed Tasks</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">48</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">↓ -5%</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-500">Pending Tasks</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">24</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-sky-500/10 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 bg-sky-500 text-white rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">↑ +8%</span>
              </div>
              <div className="mt-4">
                <div className="text-xs font-medium text-slate-500">Total Members</div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">24</div>
              </div>
            </div>
          </div>

          {/* ================= CHARTS SECTION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Projects Performance Line Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Projects Performance
                </h3>

                {/* Chart Toggle Tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  {['7 Days', '30 Days', '3 Months'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setChartTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        chartTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Chart Graphic */}
              <div className="relative h-52 flex items-end pt-4 pb-2 pl-7">
                <div className="absolute left-0 top-4 bottom-3 flex flex-col justify-between text-[11px] font-medium text-slate-400">
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>

                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="anlyPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="anlyBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {[0, 37.5, 75, 112.5, 150].map((y, idx) => (
                    <line key={idx} x1="0" y1={y} x2="500" y2={y} stroke="#e2e8f0" strokeOpacity="0.5" strokeWidth="1" />
                  ))}

                  <polygon points="0,105 90,82 180,48 270,55 380,30 500,28 500,150 0,150" fill="url(#anlyPurple)" />
                  <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points="0,105 90,82 180,48 270,55 380,30 500,28" />

                  <polygon points="0,125 90,102 180,72 270,88 380,52 500,42 500,150 0,150" fill="url(#anlyBlue)" />
                  <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" points="0,125 90,102 180,72 270,88 380,52 500,42" />

                  {[
                    [0, 105], [90, 82], [180, 48], [270, 55], [380, 30], [500, 28]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                  {[
                    [0, 125], [90, 102], [180, 72], [270, 88], [380, 52], [500, 42]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#0ea5e9" stroke="#ffffff" strokeWidth="1.5" />
                  ))}
                </svg>
              </div>

              <div className="flex justify-between text-xs font-medium text-slate-400 pl-7 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Oct 05</span>
                <span>Oct 10</span>
                <span>Oct 15</span>
                <span>Oct 20</span>
                <span>Oct 25</span>
                <span>Oct 30</span>
              </div>
            </div>

            {/* Task Status Overview Donut Chart */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2 mb-2">
                <PieChart className="w-5 h-5 text-indigo-600" /> Task Status Overview
              </h3>

              <div className="flex items-center justify-around my-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path strokeDasharray="33, 100" className="text-indigo-600 stroke-current" strokeWidth="4.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeDasharray="36, 100" strokeDashoffset="-33" className="text-sky-500 stroke-current" strokeWidth="4.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeDasharray="17, 100" strokeDashoffset="-69" className="text-emerald-500 stroke-current" strokeWidth="4.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeDasharray="14, 100" strokeDashoffset="-86" className="text-amber-500 stroke-current" strokeWidth="4.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">72</div>
                    <div className="text-xs text-slate-400 font-medium">Total Tasks</div>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-medium">
                  {[
                    { label: 'To Do', pct: '33%', color: 'bg-indigo-600' },
                    { label: 'In Progress', pct: '36%', color: 'bg-sky-500' },
                    { label: 'Review', pct: '17%', color: 'bg-emerald-500' },
                    { label: 'Done', pct: '14%', color: 'bg-amber-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{item.pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ================= BOTTOM 3 SECTIONS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Team Performance */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Team Performance
                </h3>
                <button onClick={() => navigate('/admin-team')} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {teamPerformance.map((member, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={member.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-100">{member.name}</span>
                          <span className="text-[10px] text-slate-400 block">{member.role}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{member.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ml-9.5">
                      <div className={`h-full rounded-full ${member.color}`} style={{ width: `${member.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Projects */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Top Projects
                </h3>
                <button onClick={() => navigate('/admin-projects')} className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {topProjects.map((proj, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={proj.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <span className="font-bold text-slate-800 dark:text-slate-100">{proj.name}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{proj.rate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.rate}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights & Activity */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-indigo-600" /> Insights & Activity
              </h3>

              <div className="space-y-3.5 text-xs">
                {insightsList.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </main>
      </div>

    </div>
  );
}