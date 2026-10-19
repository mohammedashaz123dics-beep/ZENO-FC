import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, MapPin, Heart, Zap, ChevronRight, TrendingUp, Calendar, Crown } from 'lucide-react';
import PredictionCard from '../components/sports/PredictionCard';
import MatchCard from '../components/sports/MatchCard';
import StadiumMap from '../components/sports/StadiumMap';
import ECGChart from '../components/sports/ECGChart';
import HealthStats from '../components/sports/HealthStats';
import SafetyTips from '../components/sports/SafetyTips';
import HeartRateSensor from '../components/sports/HeartRateSensor';
import FirstAidGuide from '../components/sports/FirstAidGuide';
import HighlightsSection from '../components/sports/HighlightsSection';
import LiveMatchesSection from '../components/sports/LiveMatchesSection';
import HoverSidebar from '../components/sports/HoverSidebar';
import FeatureGate from '../components/sports/FeatureGate';
import ProMatchStrategy from '../components/sports/ProMatchStrategy';
import { useSubscription } from '@/hooks/useSubscription';

// Sample stadiums data for all sports
const sampleStadiums = [
  // Football
  { name: 'MetLife Stadium', lat: 40.8135, lng: -74.0745, capacity: 82500, sport: 'football' },
  { name: 'AT&T Stadium', lat: 32.7473, lng: -97.0945, capacity: 80000, sport: 'football' },
  { name: 'Lambeau Field', lat: 44.5013, lng: -88.0622, capacity: 81441, sport: 'football' },
  // Basketball
  { name: 'Madison Square Garden', lat: 40.7505, lng: -73.9934, capacity: 20789, sport: 'basketball' },
  { name: 'Crypto.com Arena', lat: 34.0430, lng: -118.2673, capacity: 19068, sport: 'basketball' },
  { name: 'United Center', lat: 41.8807, lng: -87.6742, capacity: 20917, sport: 'basketball' },
  // Baseball
  { name: 'Yankee Stadium', lat: 40.8296, lng: -73.9262, capacity: 54251, sport: 'baseball' },
  { name: 'Dodger Stadium', lat: 34.0739, lng: -118.2400, capacity: 56000, sport: 'baseball' },
  { name: 'Fenway Park', lat: 42.3467, lng: -71.0972, capacity: 37755, sport: 'baseball' },
  // Soccer
  { name: 'Red Bull Arena', lat: 40.7369, lng: -74.1503, capacity: 25000, sport: 'soccer' },
  { name: 'Old Trafford', lat: 53.4631, lng: -2.2913, capacity: 74310, sport: 'soccer' },
  { name: 'Camp Nou', lat: 41.3809, lng: 2.1228, capacity: 99354, sport: 'soccer' },
  { name: 'Wembley Stadium', lat: 51.5560, lng: -0.2795, capacity: 90000, sport: 'soccer' },
  // Hockey
  { name: 'Barclays Center', lat: 40.6826, lng: -73.9754, capacity: 17732, sport: 'hockey' },
  { name: 'TD Garden', lat: 42.3662, lng: -71.0621, capacity: 17850, sport: 'hockey' },
  { name: 'Bell Centre', lat: 45.4961, lng: -73.5693, capacity: 21302, sport: 'hockey' },
  // Cricket
  { name: 'Melbourne Cricket Ground', lat: -37.8200, lng: 144.9834, capacity: 100024, sport: 'cricket' },
  { name: "Lord's Cricket Ground", lat: 51.5294, lng: -0.1728, capacity: 30000, sport: 'cricket' },
  { name: 'Eden Gardens', lat: 22.5646, lng: 88.3433, capacity: 68000, sport: 'cricket' },
  { name: 'Wankhede Stadium', lat: 18.9388, lng: 72.8258, capacity: 33000, sport: 'cricket' },
  { name: 'Sydney Cricket Ground', lat: -33.8917, lng: 151.2247, capacity: 48000, sport: 'cricket' },
];

export default function Home() {
  const { plan: userPlan } = useSubscription();
  const [activeTab, setActiveTab] = useState('predict');
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({
    heart_rate: 72,
    steps: 6543,
    calories_burned: 1247,
    hydration_ml: 1800,
    sleep_hours: 7.2,
    blood_pressure_systolic: 118,
    blood_pressure_diastolic: 76
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: () => base44.entities.Match.list('-match_date', 10),
    initialData: []
  });

  // Simulate real-time health updates
  useEffect(() => {
    const interval = setInterval(() => {
      setHealthMetrics(prev => ({
        ...prev,
        heart_rate: Math.floor(70 + Math.random() * 10),
        steps: prev.steps + Math.floor(Math.random() * 10)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePredictionComplete = async (predictionData) => {
    try {
      await base44.entities.Match.create({
        ...predictionData,
        match_date: new Date().toISOString(),
        status: 'upcoming'
      });
    } catch (error) {
      console.error('Failed to save prediction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-full border border-slate-700/50 mb-4">
            <Zap className="w-4 h-4 text-orange-400" />
            <span className="text-slate-300 text-sm font-medium">AI-Powered Sports Analytics</span>
          </div>
          {userPlan && userPlan !== 'free' && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-full border border-amber-500/30 mb-4 ml-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium capitalize">Zeno {userPlan}</span>
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Game Day
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Predict winners, find stadiums, track matches, and optimize your fitness — all in one place.
          </p>
        </motion.div>

        {/* Highlights Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <HighlightsSection />
        </motion.div>

        {/* Hover-triggered sidebar (desktop) */}
        <HoverSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="lg:hidden w-full grid grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-1.5 mb-8">
            <TabsTrigger 
              value="predict" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400 font-medium"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Predict
            </TabsTrigger>
            <TabsTrigger 
              value="stadiums"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400 font-medium"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Stadiums
            </TabsTrigger>
            <TabsTrigger 
              value="matches"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400 font-medium"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger 
              value="fitness"
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-orange-500 data-[state=active]:text-white text-slate-400 font-medium"
            >
              <Heart className="w-4 h-4 mr-2" />
              Fitness
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* Prediction Tab */}
            <TabsContent value="predict" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid lg:grid-cols-2 gap-8"
              >
                <PredictionCard onPredictionComplete={handlePredictionComplete} />
                
                <div className="space-y-6">
                  <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h3 className="text-white font-semibold">Recent Predictions</h3>
                    </div>
                    
                    {matches.filter(m => m.prediction).length > 0 ? (
                      <div className="space-y-3">
                        {matches.filter(m => m.prediction).slice(0, 4).map((match, idx) => (
                          <div key={match.id || idx} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                            <div>
                              <p className="text-white text-sm font-medium">{match.team_home} vs {match.team_away}</p>
                              <p className="text-slate-400 text-xs">{match.sport}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-400 font-semibold">{match.prediction}</p>
                              <p className="text-slate-500 text-xs">{match.prediction_confidence}% conf</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500">No predictions yet</p>
                        <p className="text-slate-600 text-sm">Make your first prediction!</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Pro Match Strategy AI - Peak Only */}
              <FeatureGate requiredPlan="peak" featureName="Pro Match Strategy AI" description="AI-powered tactical analysis, opponent weakness breakdown, and game strategy for any match">
                <ProMatchStrategy />
              </FeatureGate>
            </TabsContent>

            {/* Stadiums Tab */}
            <TabsContent value="stadiums" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StadiumMap 
                  stadiums={sampleStadiums}
                  selectedStadium={selectedStadium}
                  onSelectStadium={setSelectedStadium}
                />
              </motion.div>
            </TabsContent>

            {/* Matches Tab */}
            <TabsContent value="matches" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LiveMatchesSection />
              </motion.div>
            </TabsContent>

            {/* Fitness Tab */}
            <TabsContent value="fitness" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Heart Rate Sensor - Sporty+ */}
                <FeatureGate requiredPlan="sporty" featureName="Advanced Heart Rate Sensor" description="Real-time PPG heart rate monitoring using your phone camera">
                  <HeartRateSensor 
                    onMeasurement={(bpm) => setHealthMetrics(prev => ({ ...prev, heart_rate: bpm }))}
                  />
                </FeatureGate>

                {/* Quick Log Section */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Quick Log
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Heart Rate (BPM)</label>
                      <input
                        type="number"
                        value={healthMetrics.heart_rate}
                        onChange={(e) => setHealthMetrics(prev => ({ ...prev, heart_rate: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-lg font-semibold"
                        placeholder="72"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Steps</label>
                      <input
                        type="number"
                        value={healthMetrics.steps}
                        onChange={(e) => setHealthMetrics(prev => ({ ...prev, steps: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-lg font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Calories (kcal)</label>
                      <input
                        type="number"
                        value={healthMetrics.calories_burned}
                        onChange={(e) => setHealthMetrics(prev => ({ ...prev, calories_burned: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-lg font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Water (ml)</label>
                      <input
                        type="number"
                        value={healthMetrics.hydration_ml}
                        onChange={(e) => setHealthMetrics(prev => ({ ...prev, hydration_ml: parseInt(e.target.value) || 0 }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-lg font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">Sleep (hours)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={healthMetrics.sleep_hours}
                        onChange={(e) => setHealthMetrics(prev => ({ ...prev, sleep_hours: parseFloat(e.target.value) || 0 }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-lg font-semibold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">BP (sys/dia)</label>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          value={healthMetrics.blood_pressure_systolic}
                          onChange={(e) => setHealthMetrics(prev => ({ ...prev, blood_pressure_systolic: parseInt(e.target.value) || 0 }))}
                          className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm font-semibold"
                          placeholder="120"
                        />
                        <input
                          type="number"
                          value={healthMetrics.blood_pressure_diastolic}
                          onChange={(e) => setHealthMetrics(prev => ({ ...prev, blood_pressure_diastolic: parseInt(e.target.value) || 0 }))}
                          className="w-1/2 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-white text-sm font-semibold"
                          placeholder="80"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ECG Monitor - Sporty+ */}
                <FeatureGate requiredPlan="sporty" featureName="ECG Monitor" description="Medical-grade ECG waveform with P-QRS-T complex analysis">
                  <ECGChart heartRate={healthMetrics.heart_rate} />
                </FeatureGate>
                
                {/* Health Stats Overview */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    Today's Progress
                  </h3>
                  <HealthStats metrics={healthMetrics} />
                </div>

                {/* Safety Tips */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                  <SafetyTips />
                </div>

                {/* Emergency First Aid Guide */}
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                  <FirstAidGuide />
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}