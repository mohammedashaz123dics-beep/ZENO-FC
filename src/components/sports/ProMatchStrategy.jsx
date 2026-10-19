import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Brain, Loader2, Target, Shield, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ProMatchStrategy() {
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [sport, setSport] = useState('');
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);

  const handleAnalyze = async () => {
    if (!teamA || !teamB || !sport) return;
    setLoading(true);
    setStrategy(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an elite sports tactician and strategy coach. Analyze this ${sport} matchup and provide a comprehensive strategic breakdown:

        Team A: ${teamA}
        Team B: ${teamB}

        Provide a deep tactical analysis including:
        1. Both teams' playing styles and formations
        2. Key player matchups that will decide the game
        3. Opponent weaknesses Team A should exploit
        4. Recommended game strategy and approach for Team A
        5. Predicted game flow and pivotal moments
        6. X-factors that could swing the outcome

        Use real, current data about these teams.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            tactical_analysis: { type: "string", description: "Analysis of both teams' playing styles and formations" },
            key_matchups: { type: "array", items: { type: "string" }, description: "Key player matchups to watch" },
            weaknesses: { type: "array", items: { type: "string" }, description: "Opponent weaknesses to exploit" },
            recommended_strategy: { type: "string", description: "Recommended game strategy for Team A" },
            predicted_flow: { type: "string", description: "Predicted game flow and pivotal moments" },
            x_factors: { type: "array", items: { type: "string" }, description: "X-factors that could decide the game" },
          }
        }
      });
      setStrategy(result);
    } catch (error) {
      console.error('Strategy analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden mt-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-transparent to-yellow-600/20 rounded-3xl" />

      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-amber-500/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Pro Match Strategy AI
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">PEAK</span>
            </h2>
            <p className="text-slate-400 text-sm">AI-powered tactical analysis & game strategy</p>
          </div>
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
                placeholder="e.g. Celtics"
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
            onClick={handleAnalyze}
            disabled={loading || !teamA || !teamB || !sport}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-semibold py-6 rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Tactics...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Strategy
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {strategy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 overflow-hidden"
            >
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-2xl p-5 border border-amber-500/20 space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3" /> TACTICAL ANALYSIS
                  </p>
                  <p className="text-slate-300 text-sm">{strategy.tactical_analysis}</p>
                </div>

                {strategy.key_matchups?.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> KEY MATCHUPS
                    </p>
                    <ul className="space-y-1.5">
                      {strategy.key_matchups.map((m, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span> {m}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {strategy.weaknesses?.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-semibold mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> OPPONENT WEAKNESSES
                    </p>
                    <ul className="space-y-1.5">
                      {strategy.weaknesses.map((w, i) => (
                        <li key={i} className="text-slate-300 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-green-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> RECOMMENDED STRATEGY
                  </p>
                  <p className="text-slate-300 text-sm">{strategy.recommended_strategy}</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-4">
                  <p className="text-blue-400 text-xs font-semibold mb-2">PREDICTED GAME FLOW</p>
                  <p className="text-slate-300 text-sm">{strategy.predicted_flow}</p>
                </div>

                {strategy.x_factors?.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-purple-400 text-xs font-semibold mb-2">X-FACTORS</p>
                    <div className="flex flex-wrap gap-2">
                      {strategy.x_factors.map((x, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-700/50 rounded-full text-slate-300 text-xs">
                          {x}
                        </span>
                      ))}
                    </div>
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