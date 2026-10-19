import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  TrendingUp, 
  Trophy, 
  Heart, 
  Flame, 
  Target,
  Award,
  Zap
} from 'lucide-react';

const highlights = [
  {
    id: 1,
    icon: Trophy,
    title: "Today's Top Pick",
    description: "Lakers vs Warriors - 78% confidence Lakers win",
    color: 'from-amber-500 to-orange-600',
    badge: 'HOT'
  },
  {
    id: 2,
    icon: Heart,
    title: "Heart Health",
    description: "Your resting BPM is 68 - excellent cardiovascular fitness!",
    color: 'from-red-500 to-pink-600',
    badge: 'GREAT'
  },
  {
    id: 3,
    icon: Flame,
    title: "Calorie Goal",
    description: "You've burned 1,247 kcal today - 62% of your goal",
    color: 'from-orange-500 to-red-500',
    badge: 'ON TRACK'
  },
  {
    id: 4,
    icon: Target,
    title: "Step Challenge",
    description: "6,543 steps - just 3,457 more to hit 10K!",
    color: 'from-green-500 to-emerald-600',
    badge: '65%'
  }
];

const quickStats = [
  { label: 'Predictions Made', value: '12', icon: TrendingUp, color: 'text-purple-400' },
  { label: 'Win Rate', value: '75%', icon: Award, color: 'text-amber-400' },
  { label: 'Active Streak', value: '5 days', icon: Flame, color: 'text-orange-400' },
  { label: 'Health Score', value: '92', icon: Heart, color: 'text-red-400' },
];

export default function HighlightsSection() {
  return (
    <div className="space-y-6">
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-slate-400 text-xs">{stat.label}</span>
              </div>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Highlights Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {highlights.map((highlight, idx) => {
          const Icon = highlight.icon;
          return (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="relative overflow-hidden group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${highlight.color} opacity-0 group-hover:opacity-10 transition-opacity rounded-xl`} />
              <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${highlight.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${highlight.color} text-white`}>
                    {highlight.badge}
                  </span>
                </div>
                <h4 className="text-white font-semibold mb-1">{highlight.title}</h4>
                <p className="text-slate-400 text-sm">{highlight.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Featured Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" />
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Daily Highlights</h3>
              <p className="text-white/80 text-sm">Your personalized sports & fitness summary</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="text-white text-sm font-medium">Updated just now</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}