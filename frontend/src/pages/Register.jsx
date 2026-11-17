import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Shield, Zap, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import SocialButtons from '../components/SocialButtons';
import { apiRequest } from '../lib/api';

const readProfilePhoto = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result);
    } else {
      reject(new Error('Could not read the selected profile photo.'));
    }
  };
  reader.onerror = () => reject(new Error('Could not read the selected profile photo.'));
  reader.readAsDataURL(file);
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null,
    role: 'Member' // Default role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.profilePhoto) {
      setError('Select a profile photo to continue.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profilePhoto: await readProfilePhoto(formData.profilePhoto),
        }),
      });
      navigate('/login', {
        state: { email: formData.email, role: formData.role },
      });
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
            Select your role and manage projects with customized access permissions.
          </p>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <Zap className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Fast & Reliable</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <Users className="w-5 h-5 text-purple-300" />
              <span className="font-medium text-sm">Role-Based Access</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-indigo-300 text-xs">
          <span>Already have an account? <Link to="/login" className="text-white underline">Login →</Link></span>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 text-white font-bold text-2xl">
                K
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Get started with KanbanPro
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Role Selection Dropdown */}
            <div className="relative">
              <Shield className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="Member">User / Member</option>
                <option value="Admin">Admin (Project Manager)</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="profile-photo" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                Profile photo (required, max 1 MB)
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => {
                  const profilePhoto = e.target.files?.[0] || null;
                  if (profilePhoto && profilePhoto.size > 1024 * 1024) {
                    setError('Choose an image smaller than 1 MB.');
                    e.target.value = '';
                    setFormData({ ...formData, profilePhoto: null });
                    return;
                  }
                  setError('');
                  setFormData({ ...formData, profilePhoto });
                }}
                className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all duration-200 mt-2"
            >
              <UserPlus className="w-5 h-5" /> {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <SocialButtons />

          <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}