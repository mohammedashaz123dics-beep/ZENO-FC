import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, ThermometerSun, Droplets, Heart, Zap } from 'lucide-react';

const tips = [
  {
    icon: Droplets,
    title: 'Stay Hydrated',
    description: 'Drink water before, during, and after exercise. Aim for 8oz every 15-20 minutes.',
    color: 'from-cyan-500 to-blue-500',
    priority: 'high'
  },
  {
    icon: ThermometerSun,
    title: 'Watch the Heat',
    description: 'Avoid intense workouts during peak heat hours (10am-4pm). Check heat index before outdoor activities.',
    color: 'from-orange-500 to-red-500',
    priority: 'high'
  },
  {
    icon: Heart,
    title: 'Know Your Limits',
    description: 'Monitor heart rate zones. If experiencing chest pain, dizziness, or shortness of breath, stop immediately.',
    color: 'from-red-500 to-pink-500',
    priority: 'critical'
  },
  {
    icon: Zap,
    title: 'Warm Up Properly',
    description: '5-10 minutes of light cardio and dynamic stretches reduce injury risk by up to 50%.',
    color: 'from-yellow-500 to-amber-500',
    priority: 'medium'
  },
  {
    icon: Shield,
    title: 'Use Proper Gear',
    description: 'Wear appropriate footwear and protective equipment for your sport. Check gear regularly.',
    color: 'from-green-500 to-emerald-500',
    priority: 'medium'
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Readiness',
    description: 'Know CPR basics. Keep emergency contacts accessible. Never train alone in isolated areas.',
    color: 'from-purple-500 to-indigo-500',
    priority: 'critical'
  }
];

export default function SafetyTips() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-500/20 rounded-xl">
          <Shield className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Health & Safety Guidelines</h3>
          <p className="text-slate-400 text-sm">Essential tips for safe training</p>
        </div>
      </div>

      <div className="grid gap-3">
        {tips.map((tip, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b ${tip.color}`} />
            <div className="ml-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${tip.color} bg-opacity-20`}>
                  <tip.icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{tip.title}</h4>
                    {tip.priority === 'critical' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">Critical</span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{tip.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-2xl p-5 border border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <h3 className="text-white font-semibold">Emergency Signs</h3>
        </div>
        <p className="text-slate-300 text-sm mb-3">Stop exercising and seek help immediately if you experience:</p>
        <div className="grid grid-cols-2 gap-2">
          {['Chest pain or pressure', 'Severe shortness of breath', 'Dizziness or fainting', 'Irregular heartbeat'].map((sign, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              {sign}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}