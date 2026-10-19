import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useTheme, THEMES } from '@/hooks/useTheme';
import { Sun, Moon, Palette, Waves, LogIn, LogOut, User, Check, CreditCard } from 'lucide-react';

const themeIcons = { dark: Moon, white: Sun, grey: Palette, marine: Waves };

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .373-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch {}
      }
      setLoading(false);
    });
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin(window.location.pathname);
  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 max-w-4xl mx-auto">
      <h1 className="text-white text-3xl font-bold mb-8">Settings</h1>

      {/* Theme Section */}
      <section className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">Appearance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEMES.map((t) => {
            const Icon = themeIcons[t.id];
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative p-5 rounded-2xl border-2 transition-all ${isActive ? 'border-orange-500 scale-105' : 'border-slate-700/50 hover:border-slate-600'}`}
                style={{ background: t.bg }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: t.card }}>
                    <Icon className="w-6 h-6" style={{ color: t.accent }} />
                  </div>
                  <span className="font-semibold" style={{ color: t.id === 'white' ? '#0f172a' : '#ffffff' }}>{t.name}</span>
                </div>
                {isActive && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Account Section */}
      <section className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">Account</h2>
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{user.full_name || user.email}</p>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors font-medium">
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleLogin} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                  <LogIn className="w-5 h-5" /> Log In
                </button>
                <button onClick={handleLogin} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors border border-slate-700/50">
                  <User className="w-5 h-5" /> Sign Up
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-3">Sign in with email or Google to sync your data across devices.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscription Link */}
      <section className="mb-10">
        <Link to="/Subscriptions" className="block bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-orange-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Subscriptions</p>
                <p className="text-slate-400 text-sm">Manage your Zeno plan</p>
              </div>
            </div>
            <span className="text-slate-400 text-lg">→</span>
          </div>
        </Link>
      </section>

      {/* Discord Section */}
      <section className="mb-10">
        <h2 className="text-white text-xl font-bold mb-4">Community</h2>
        <a href="https://discord.gg/xQRGUjtZTm" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-[#5865F2]/20 border border-[#5865F2]/50 rounded-2xl p-6 hover:bg-[#5865F2]/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#5865F2] rounded-xl flex items-center justify-center">
              <DiscordIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">Join Our Discord</p>
              <p className="text-slate-400 text-sm">Connect with the community, get updates, and share predictions</p>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}