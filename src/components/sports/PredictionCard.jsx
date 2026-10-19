import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Sparkles, Trophy, TrendingUp, Loader2, Zap, AlertCircle, Globe, Lock, Rocket } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';

export default function PredictionCard({ onPredictionComplete }) {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const { plan, getPredictionStatus, recordPrediction } = useSubscription();

  const predStatus = getPredictionStatus();
  const isFree = plan === 'free';
  const canPredict = predStatus.allowed;

  const handlePredict = async () => {
    if (!teamA || !teamB || !sport) return;
    if (!canPredict) return;

    setLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sports analyst AI. I need you to predict the winner of this ${sport} match:
        Team A: ${teamA}
        Team B: ${teamB}
        
        IMPORTANT INSTRUCTIONS:
        1. First, verify if BOTH teams are real, legitimate ${sport} teams that actually exist (professional, college, or well-known teams).
        2. If either team does NOT exist or you cannot find information about them, set "teams_valid" to false and explain which team(s) don't exist in the "error_message" field.
        3. If both teams are valid, use current information from the internet to analyze:
           - Recent performance and current standings
           - Head-to-head records
           - Key player injuries or transfers
           - Home/away performance
           - Current form and momentum
        4. Provide a prediction based on real data and statistics.
        
        Be accurate and use real sports data from your search.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            teams_valid: { type: "boolean", description: "True if both teams are real existing teams, false otherwise" },
            error_message: { type: "string", description: "Error message if teams are invalid, null otherwise" },
            winner: { type: "string", description: "Name of the predicted winning team (only if teams_valid is true)" },
            confidence: { type: "number", description: "Confidence percentage (60-95)" },
            reasoning: { type: "string", description: "Brief explanation based on real stats (2-3 sentences)" },
            predicted_score: { type: "string", description: "Predicted final score like '3-1'" },
            key_factors: { type: "array", items: { type: "string" }, description: "3 key factors for the prediction based on real data" },
            data_sources: { type: "string", description: "Brief mention of what real data was used (e.g., 'Current season stats, recent form')" }
          }
        }
      });

      if (!result.teams_valid) {
        setError(result.error_message || `Could not verify one or both teams. Please enter valid ${sport} team names.`);
        return;
      }

      setPrediction(result);
      onPredictionComplete?.({
        team_home: teamA,
        team_away: teamB,
        sport,
        prediction: result.winner,
        prediction_confidence: result.confidence
      });

      // Record prediction for free users (daily limit tracking)
      if (isFree) {
        await recordPrediction();
      }
    } catch (error) {
      console.error('Prediction failed:', error);
      setError('Failed to get prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-orange-600/20 rounded-3xl" />

      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-orange-500 rounded-2xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">AI Match Predictor</h2>
            <p className="text-slate-400 text-sm">Powered by advanced analytics</p>
          </div>
          {/* Prediction counter for free users */}
          {isFree && (
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${canPredict ? 'bg-slate-800 text-slate-300' : 'bg-red-500/20 text-red-400'}`}>
              {canPredict ? `${predStatus.remaining} left today` : 'Limit reached'}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Team A</label>
              <Input
                placeholder="e.g. Lakers"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-sm mb-2 block">Team B</label>
              <Input
                placeholder="e.g. Warriors"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm mb-2 block">Sport</label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="football">🏈 Football</SelectItem>
                <SelectItem value="basketball">🏀 Basketball</SelectItem>
                <SelectItem value="soccer">⚽ Soccer</SelectItem>
                <SelectItem value="baseball">⚾ Baseball</SelectItem>
                <SelectItem value="hockey">🏒 Hockey</SelectItem>
                <SelectItem value="cricket">🏏 Cricket</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handlePredict}
            disabled={loading || !teamA || !teamB || !sport || !canPredict}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold py-6 rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Searching Real Data...
              </>
            ) : !canPredict ? (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Daily Limit Reached
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Get Prediction
              </>
            )}
          </Button>

          {/* Limit reached upgrade prompt */}
          <AnimatePresence>
            {isFree && !canPredict && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-orange-500/30 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">You've used all 5 free predictions today</p>
                    <p className="text-slate-400 text-xs mt-0.5">Upgrade to Zeno Sporty for unlimited predictions</p>
                  </div>
                  <Link
                    to="/Subscriptions"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 text-white text-sm font-semibold rounded-lg hover:opacity-90 whitespace-nowrap"
                  >
                    Upgrade
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Team Not Found</p>
                  <p className="text-red-300/80 text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Prediction Result */}
        <AnimatePresence>
          {prediction && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-5 border border-amber-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-amber-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Predicted Winner</p>
                    <p className="text-2xl font-bold text-white">{prediction.winner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Confidence</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prediction.confidence}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        />
                      </div>
                      <span className="text-green-400 font-bold">{prediction.confidence}%</span>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Predicted Score</p>
                    <p className="text-white font-bold text-lg mt-1">{prediction.predicted_score}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-3 mb-3">
                  <p className="text-slate-400 text-xs mb-2">Analysis</p>
                  <p className="text-slate-300 text-sm">{prediction.reasoning}</p>
                </div>

                <div>
                  <p className="text-slate-400 text-xs mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Key Factors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.key_factors?.map((factor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-slate-800 rounded-full text-slate-300 text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {prediction.data_sources && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <p className="text-slate-500 text-xs">Source: {prediction.data_sources}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}