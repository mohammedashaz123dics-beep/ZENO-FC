import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Trophy, Activity, Zap } from 'lucide-react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Theme styles are in index.css */}
      
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-tight">GameDay</h1>
              <p className="text-slate-500 text-xs">Command Center</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-slate-400 text-sm">Live Updates</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full border border-slate-700/50">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-slate-300 text-sm font-medium">AI Active</span>
            </div>
            <a href="https://discord.gg/xQRGUjtZTm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-[#5865F2]/20 rounded-full border border-[#5865F2]/50 hover:bg-[#5865F2]/30 transition-colors">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#5865F2]"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .373-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              <span className="text-slate-300 text-sm font-medium hidden sm:inline">Discord</span>
            </a>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600 text-sm">
            © 2026 GameDay Command Center • AI-Powered Sports Analytics
          </p>
        </div>
      </footer>
    </div>
  );
}