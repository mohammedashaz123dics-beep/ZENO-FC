import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Footprints, Flame, Droplets, Moon, Activity } from 'lucide-react';

const statConfig = {
  heart_rate: { icon: Heart, color: 'from-red-500 to-pink-500', unit: 'BPM', label: 'Heart Rate' },
  steps: { icon: Footprints, color: 'from-blue-500 to-cyan-500', unit: 'steps', label: 'Steps' },
  calories: { icon: Flame, color: 'from-orange-500 to-amber-500', unit: 'kcal', label: 'Calories' },
  hydration: { icon: Droplets, color: 'from-cyan-500 to-blue-500', unit: 'ml', label: 'Hydration' },
  sleep: { icon: Moon, color: 'from-indigo-500 to-purple-500', unit: 'hrs', label: 'Sleep' },
  blood_pressure: { icon: Activity, color: 'from-green-500 to-emerald-500', unit: 'mmHg', label: 'Blood Pressure' }
};

function StatCard({ type, value, goal, delay = 0 }) {
  const config = statConfig[type];
  const Icon = config.icon;
  const progress = goal ? Math.min((value / goal) * 100, 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`} />
      <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${config.color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {goal && (
            <span className="text-slate-500 text-xs">{Math.round(progress)}%</span>
          )}
        </div>
        
        <p className="text-slate-400 text-xs mb-1">{config.label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value?.toLocaleString() || '--'}</span>
          <span className="text-slate-500 text-sm">{config.unit}</span>
        </div>
        
        {goal && (
          <div className="mt-3">
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
                className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">Goal: {goal.toLocaleString()}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function HealthStats({ metrics }) {
  const defaultMetrics = {
    heart_rate: metrics?.heart_rate || 72,
    steps: metrics?.steps || 0,
    calories: metrics?.calories_burned || 0,
    hydration: metrics?.hydration_ml || 0,
    sleep: metrics?.sleep_hours || 0,
    blood_pressure: metrics?.blood_pressure_systolic ? 
      `${metrics.blood_pressure_systolic}/${metrics.blood_pressure_diastolic}` : null
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard type="heart_rate" value={defaultMetrics.heart_rate} delay={0} />
      <StatCard type="steps" value={defaultMetrics.steps} goal={10000} delay={0.1} />
      <StatCard type="calories" value={defaultMetrics.calories} goal={2000} delay={0.2} />
      <StatCard type="hydration" value={defaultMetrics.hydration} goal={2500} delay={0.3} />
      <StatCard type="sleep" value={defaultMetrics.sleep} goal={8} delay={0.4} />
      <StatCard type="blood_pressure" value={defaultMetrics.blood_pressure || '120/80'} delay={0.5} />
    </div>
  );
}