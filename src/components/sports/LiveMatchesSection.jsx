import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Loader2, 
  RefreshCw, 
  Calendar, 
  Clock, 
  MapPin,
  Trophy,
  Radio,
  RefreshCcwDot
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const sportEmojis = {
  football: '🏈',
  basketball: '🏀',
  soccer: '⚽',
  baseball: '⚾',
  hockey: '🏒',
  cricket: '🏏'
};

const sportColors = {
  football: 'from-green-600 to-emerald-700',
  basketball: 'from-orange-500 to-red-600',
  soccer: 'from-green-500 to-teal-600',
  baseball: 'from-red-600 to-rose-700',
  hockey: 'from-blue-500 to-indigo-600',
  cricket: 'from-amber-500 to-orange-600'
};

function MatchCard({ match, isLive }) {
  const sportColor = sportColors[match.sport] || 'from-slate-600 to-slate-700';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sportEmojis[match.sport]}</span>
          <span className="text-slate-400 text-xs capitalize">{match.sport}</span>
        </div>
        {isLive ? (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-medium">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE{match.match_period ? ` • ${match.match_period}` : ''}
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Upcoming
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 text-center">
          <p className="text-white font-semibold text-sm">{match.team_home}</p>
        </div>
        <div className="px-3">
          {isLive ? (
            <motion.div 
              key={`${match.home_score}-${match.away_score}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="bg-slate-900 rounded-lg px-3 py-1"
            >
              <span className="text-white font-bold">{match.home_score || 0}</span>
              <span className="text-slate-500 mx-1">-</span>
              <span className="text-white font-bold">{match.away_score || 0}</span>
            </motion.div>
          ) : (
            <span className="text-slate-500 text-lg font-bold">VS</span>
          )}
        </div>
        <div className="flex-1 text-center">
          <p className="text-white font-semibold text-sm">{match.team_away}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {match.date}
        </div>
        {match.time && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {match.time}
          </div>
        )}
      </div>
      
      {match.venue && (
        <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3" />
          {match.venue}
        </div>
      )}
    </motion.div>
  );
}

export default function LiveMatchesSection() {
  const { toast } = useToast();
  const [activeSport, setActiveSport] = useState('all');
  const [matches, setMatches] = useState({ live: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevScoresRef = React.useRef({});

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sports data assistant. Get me the current REAL live matches happening RIGHT NOW and upcoming matches for the next 7 days across these sports: Football (NFL/College), Basketball (NBA/College), Soccer (Premier League, La Liga, Champions League, MLS), Baseball (MLB), Hockey (NHL), and Cricket (IPL, International matches).

Search for REAL matches that are actually scheduled or happening today and this week. Use current date context.

For each match provide:
- The two teams playing
- The sport type (must be one of: football, basketball, soccer, baseball, hockey, cricket)
- Date and time
- Venue/Stadium if known
- Current score if it's a live match
- The current match period/status (e.g. "Q2", "2nd Half", "Innings 1", "7th Inning", "3rd Period")
- Whether it's live or upcoming

Return at least 3-5 matches per sport if available. Include major league games and tournaments.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            live_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  team_home: { type: "string" },
                  team_away: { type: "string" },
                  sport: { type: "string", enum: ["football", "basketball", "soccer", "baseball", "hockey", "cricket"] },
                  home_score: { type: "number" },
                  away_score: { type: "number" },
                  match_period: { type: "string", description: "Current period/innings/status e.g. Q2, 2nd Half, Innings 1" },
                  date: { type: "string" },
                  time: { type: "string" },
                  venue: { type: "string" }
                }
              }
            },
            upcoming_matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  team_home: { type: "string" },
                  team_away: { type: "string" },
                  sport: { type: "string", enum: ["football", "basketball", "soccer", "baseball", "hockey", "cricket"] },
                  date: { type: "string" },
                  time: { type: "string" },
                  venue: { type: "string" }
                }
              }
            }
          }
        }
      });

      const liveMatches = result.live_matches || [];
      const upcomingMatches = result.upcoming_matches || [];

      // Detect score changes for in-app notifications
      const matchKey = (m) => `${m.team_home}|${m.team_away}|${m.sport}`;
      const prev = prevScoresRef.current;
      const updates = [];
      liveMatches.forEach((m) => {
        const key = matchKey(m);
        const old = prev[key];
        if (old && (old.home_score !== m.home_score || old.away_score !== m.away_score)) {
          updates.push({
            team_home: m.team_home,
            team_away: m.team_away,
            home_score: m.home_score,
            away_score: m.away_score,
            sport: m.sport,
            match_period: m.match_period
          });
        }
      });
      // Rebuild prevScores from current live matches
      const newPrev = {};
      liveMatches.forEach((m) => { newPrev[matchKey(m)] = { home_score: m.home_score, away_score: m.away_score }; });
      prevScoresRef.current = newPrev;

      // Fire toast notifications for score updates (silent refreshes only)
      if (silent && updates.length > 0) {
        updates.forEach((u) => {
          toast({
            title: `⚽ Score Update: ${u.team_home} vs ${u.team_away}`,
            description: `${u.team_home} ${u.home_score} - ${u.away_score} ${u.team_away}${u.match_period ? ` • ${u.match_period}` : ''}`,
            duration: 6000,
          });
        });
      }

      setMatches({ live: liveMatches, upcoming: upcomingMatches });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMatches();
  }, []);

  // Auto-refresh polling for live scores every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMatches(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const sports = ['all', 'football', 'basketball', 'soccer', 'baseball', 'hockey', 'cricket'];
  
  const filteredLive = activeSport === 'all' 
    ? matches.live 
    : matches.live.filter(m => m.sport === activeSport);
    
  const filteredUpcoming = activeSport === 'all' 
    ? matches.upcoming 
    : matches.upcoming.filter(m => m.sport === activeSport);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Live & Upcoming Matches
          </h2>
          {lastUpdated && (
            <p className="text-slate-500 text-xs mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = !autoRefresh;
              setAutoRefresh(next);
              toast({
                title: next ? '🔔 Notifications On' : '🔕 Notifications Off',
                description: next
                  ? "You'll be alerted when tracked match scores change."
                  : 'Score update alerts are paused.',
                duration: 3000,
              });
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
              autoRefresh
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <RefreshCcwDot className="w-4 h-4" />
            {autoRefresh ? 'Auto-Sync ON' : 'Auto-Sync OFF'}
          </button>
          <button
            onClick={() => fetchMatches()}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Sport Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sports.map(sport => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeSport === sport
                ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            }`}
          >
            {sport !== 'all' && <span>{sportEmojis[sport]}</span>}
            <span className="capitalize">{sport === 'all' ? 'All Sports' : sport}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
          <p className="text-slate-400">Fetching real-time match data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Matches */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              Live Now
              {filteredLive.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {filteredLive.length}
                </span>
              )}
            </h3>
            {filteredLive.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLive.map((match, idx) => (
                  <MatchCard key={`live-${idx}`} match={match} isLive={true} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center">
                <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No live matches right now</p>
                <p className="text-slate-600 text-sm">Check back later for live action</p>
              </div>
            )}
          </div>

          {/* Upcoming Matches */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              Upcoming
              {filteredUpcoming.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {filteredUpcoming.length}
                </span>
              )}
            </h3>
            {filteredUpcoming.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUpcoming.map((match, idx) => (
                  <MatchCard key={`upcoming-${idx}`} match={match} isLive={false} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/30 rounded-xl p-8 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No upcoming matches found</p>
                <p className="text-slate-600 text-sm">Try selecting a different sport</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}