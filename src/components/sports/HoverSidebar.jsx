import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Trophy, MapPin, Calendar, Heart, ChevronLeft, Menu, X, Settings as SettingsIcon, CreditCard, LogIn, LogOut, User } from 'lucide-react';

const sectionItems = [
  { value: 'predict', label: 'Predict', icon: Trophy },
  { value: 'stadiums', label: 'Stadiums', icon: MapPin },
  { value: 'matches', label: 'Matches', icon: Calendar },
  { value: 'fitness', label: 'Fitness', icon: Heart },
];

const pageItems = [
  { path: '/Settings', label: 'Settings', icon: SettingsIcon },
  { path: '/Subscriptions', label: 'Subscriptions', icon: CreditCard },
];

function DiscordIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .373-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

export default function HoverSidebar({ activeTab, onTabChange }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try { setUser(await base44.auth.me()); } catch {}
      }
    });
  }, []);

  const open = () => { clearTimeout(timeoutRef.current); setHovered(true); };
  const close = () => { timeoutRef.current = setTimeout(() => setHovered(false), 200); };

  const handleTabClick = (value) => { onTabChange(value); setMobileOpen(false); };
  const handlePageClick = (path) => { navigate(path); setMobileOpen(false); };
  const handleLogin = () => base44.auth.redirectToLogin(window.location.pathname);
  const handleLogout = () => base44.auth.logout('/');

  const renderNavContent = () => (
    <>
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 py-2 mb-2">Sections</p>
      <div className="space-y-1">
        {sectionItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.value;
          return (
            <button key={item.value} onClick={() => handleTabClick(item.value)}
              className={`flex items-center w-full px-3 py-2.5 rounded-xl font-medium transition-colors ${isActive ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}>
              <Icon className="w-4 h-4 mr-3" /> {item.label}
            </button>
          );
        })}
      </div>

      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 py-2 mb-2 mt-4">More</p>
      <div className="space-y-1">
        {pageItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.path} onClick={() => handlePageClick(item.path)}
              className="flex items-center w-full px-3 py-2.5 rounded-xl font-medium transition-colors text-slate-400 hover:bg-slate-800/60 hover:text-white">
              <Icon className="w-4 h-4 mr-3" /> {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <a href="https://discord.gg/xQRGUjtZTm" target="_blank" rel="noopener noreferrer"
          className="flex items-center w-full px-3 py-2.5 rounded-xl font-medium transition-colors text-[#5865F2] hover:bg-[#5865F2]/10">
          <DiscordIcon className="w-4 h-4 mr-3" /> Join Discord
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/50">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-300 text-sm truncate">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center w-full px-3 py-2 rounded-xl font-medium transition-colors text-red-400 hover:bg-red-500/10">
              <LogOut className="w-4 h-4 mr-3" /> Log Out
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="flex items-center w-full px-3 py-2.5 rounded-xl font-medium transition-colors bg-gradient-to-r from-purple-600 to-orange-500 text-white">
            <LogIn className="w-4 h-4 mr-3" /> Log In / Sign Up
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile/Tablet menu button (left side) */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-3 top-20 z-40 w-11 h-11 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 flex items-center justify-center shadow-lg"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile/Tablet drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 p-4 pt-6 overflow-y-auto"
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderNavContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop hover trigger (right edge) */}
      <div
        className="hidden lg:block fixed right-0 top-16 bottom-0 w-3 z-40"
        onMouseEnter={open}
        onMouseLeave={close}
      />

      <AnimatePresence>
        {!hovered && (
          <motion.div
            className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center bg-slate-800/70 backdrop-blur-sm rounded-l-xl border-y border-l border-slate-700/50 px-1.5 py-4 cursor-pointer hover:bg-slate-700/70 transition-colors"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={open}
          >
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.aside
            className="hidden lg:block fixed right-0 top-16 bottom-0 z-50"
            initial={{ x: 240 }} animate={{ x: 0 }} exit={{ x: 240 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onMouseEnter={open}
            onMouseLeave={close}
          >
            <div className="w-56 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 rounded-l-2xl p-4 pt-6 shadow-2xl overflow-y-auto">
              {renderNavContent()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}