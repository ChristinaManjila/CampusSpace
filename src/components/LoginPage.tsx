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

  const handleAutofill = (type: 'admin' | 'organizer') => {
    const creds = PRESET_CREDENTIALS[type];
    setUsername(creds.username);
    setPassword(creds.password);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUser = username.trim().toLowerCase();

    if (!trimmedUser || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (trimmedUser === 'admin' && password === 'admin123') {
        onLogin(PRESET_CREDENTIALS.admin);
      } else if (trimmedUser === 'organizer' && password === '12345') {
        onLogin(PRESET_CREDENTIALS.organizer);
      } else {
        setErrorMessage('Invalid username or password. Please use admin/admin123 or organizer/12345.');
      }
    }, 350);
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
                Portal Access
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Smart College-Campus Venue Booking & Optimization Platform
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Online</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 relative z-10 max-w-lg mx-auto w-full">
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-6 shadow-lg shadow-cyan-500/5">
          <span>🏛️</span>
          <span>Unified Access for Organizers & Administrators</span>
        </div>

        {/* Demo Credentials Quick-Fill Pill Boxes */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Preset Demo Credentials</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">Click to autofill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Admin Creds */}
            <div
              onClick={() => handleAutofill('admin')}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-400 flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Admin</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold group-hover:bg-rose-900 transition">
                  Fill
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>User: <strong className="text-slate-200">admin</strong></div>
                <div>Pass: <strong className="text-slate-200">admin123</strong></div>
              </div>
            </div>

            {/* Organizer Creds */}
            <div
              onClick={() => handleAutofill('organizer')}
              className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <span>📅</span>
                  <span>Organizer</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold group-hover:bg-cyan-900 transition">
                  Fill
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>User: <strong className="text-slate-200">organizer</strong></div>
                <div>Pass: <strong className="text-slate-200">12345</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Login Card */}
        <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Sign In to CampusSpace</h2>
          <p className="text-xs text-slate-400 mb-6">
            Enter your credentials to manage venue reservations and access capacity analytics.
          </p>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="text-base leading-none">⚠️</span>
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
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
                  placeholder="e.g. admin or organizer"
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
                  <span>Verifying Credentials...</span>
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
          <span>Role-Aware Campus Gatekeeper • Admin & Organizer Demo Ready</span>
        </p>
      </main>
    </div>
  );
};
