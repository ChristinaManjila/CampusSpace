import React, { useState } from 'react';
import { UserProfile, PRESET_CREDENTIALS } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim();

    if (!trimmedUser || !password) {
      setErrorMessage('Please enter both username or email and password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt API server authentication
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('campusspace_auth_token', data.token);
        }
        setIsLoading(false);
        onLogin(data.user);
        return;
      }
    } catch (err) {
      console.warn('API login request failed, attempting local credentials match:', err);
    }

    // 2. Offline / Local fallback for 4 exact roles
    const userLower = trimmedUser.toLowerCase();
    const credsList = Object.values(PRESET_CREDENTIALS);
    const matched = credsList.find(
      (c) =>
        (c.username.toLowerCase() === userLower || (c.email && c.email.toLowerCase() === userLower)) &&
        c.password === password
    );

    setIsLoading(false);

    if (matched) {
      onLogin({
        id: matched.id,
        username: matched.username,
        email: matched.email,
        role: matched.role,
        name: matched.name,
        department: matched.department,
        avatar: matched.avatar,
        badge: matched.badge
      });
    } else {
      setErrorMessage('Invalid username/email or password. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070e1e] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden font-sans">
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="h-20 border-b border-slate-800/80 bg-[#070e1e]/90 backdrop-blur-md px-6 sm:px-12 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/25">
            CS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
                CampusSpace
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-700/60">
                Secure Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart College-Campus Venue Booking & Optimization Platform
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PostgreSQL Auth Online</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 relative z-10 max-w-lg mx-auto w-full">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/5">
          <span>🏛️</span>
          <span>Unified Access for Students, Team Leads, Maintenance & Admins</span>
        </div>

        {/* Primary Login Card */}
        <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Sign In to CampusSpace</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your credentials to access your personalized campus dashboard.
          </p>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-base leading-none">⚠️</span>
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                  👤
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="e.g. student@campus.edu or admin"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm">
                  🔒
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="Enter your password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white text-xs font-semibold transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide 👁️' : 'Show 👁️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Database Account...</span>
                </>
              ) : (
                <>
                  <span>SIGN IN TO DASHBOARD</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security / System Footer Note */}
        <p className="mt-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <span>🔒</span>
          <span>Automatic Role Resolution • Admin, Student, Team Lead & Maintenance</span>
        </p>
      </main>
    </div>
  );
};
