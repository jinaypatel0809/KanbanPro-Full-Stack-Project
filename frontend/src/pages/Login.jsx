import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Zap, Users, TrendingUp, ShieldCheck, Heart } from 'lucide-react';
import Logo from '../components/Logo';
import SocialButtons from '../components/SocialButtons';
import { apiRequest, saveAuthenticatedUser } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
    role: location.state?.role || 'Member',
    rememberMe: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });
      saveAuthenticatedUser(result);
      navigate(formData.role === 'Super Admin'
        ? '/super-admin-dashboard'
        : formData.role === 'Admin'
          ? '/admin-dashboard'
          : '/user-dashboard');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Banner Section */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Glow Overlay */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <Logo />
        </div>

        <div className="relative z-10 my-auto max-w-xl space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Organize. Collaborate.<br />
            Get More <span className="text-purple-400">Done.</span>
          </h1>
          <p className="text-indigo-200 text-lg">
            A modern Kanban Task Management platform to plan, track and manage your projects effortlessly.
          </p>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <Zap className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Drag & Drop Tasks</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <Users className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Team Collaboration</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <TrendingUp className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Track Progress</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Secure & Reliable</span>
            </div>
          </div>

          {/* App Preview Card */}
          <div className="bg-slate-900/60 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <span className="text-xs text-indigo-300 font-mono">KanbanPro Dashboard</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-indigo-200">Total Projects</div>
                <div className="text-xl font-bold mt-1">12 <span className="text-xs text-emerald-400 font-normal">↑ 12%</span></div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-indigo-200">Total Tasks</div>
                <div className="text-xl font-bold mt-1">48 <span className="text-xs text-emerald-400 font-normal">↑ 8%</span></div>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="text-xs text-indigo-200">Completed</div>
                <div className="text-xl font-bold mt-1">32 <span className="text-xs text-emerald-400 font-normal">↑ 15%</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-indigo-300 text-xs">
          <span className="flex items-center gap-1">
            <Heart className="w-4 h-4 text-red-400 fill-current" /> Trusted by 10,000+ teams worldwide
          </span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center space-y-2 mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 text-white font-bold text-2xl">
                K
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Sign in to your KanbanPro account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-role" className="sr-only">Account role</label>
              <select
                id="login-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="Member">User / Member</option>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm py-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-500 font-medium text-xs sm:text-sm">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200"
            >
              <LogIn className="w-5 h-5" /> {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          {/* Social Sign-in */}
          <SocialButtons />

          {/* Sign Up Redirect Link */}
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}