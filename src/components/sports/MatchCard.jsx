import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Trophy } from 'lucide-react';
import { format } from 'date-fns';

const sportIcons = {
  football: '🏈',
  basketball: '🏀',
  soccer: '⚽',
  baseball: '⚾',
  hockey: '🏒'
};

const sportColors = {
  football: 'from-amber-600 to-amber-800',
  basketball: 'from-orange-500 to-red-600',
  soccer: 'from-green-500 to-emerald-700',
  baseball: 'from-red-600 to-rose-800',
  hockey: 'from-blue-500 to-indigo-700'
};

export default function MatchCard({ match, onClick }) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${sportColors[match.sport]} p-[1px]`}>
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${isLive ? 'bg-red-500 animate-pulse' : isFinished ? 'bg-slate-600' : 'bg-blue-500'} text-white border-0`}>
              {isLive && <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />}
              {isLive ? 'LIVE' : isFinished ? 'FINISHED' : 'UPCOMING'}
            </Badge>
            <span className="text-3xl">{sportIcons[match.sport]}</span>
          </div>
          
          {/* Teams */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center mb-2 border border-slate-600">
                <span className="text-xl font-bold text-white">{match.team_home?.slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-white font-semibold text-sm truncate">{match.team_home}</p>
              {(isLive || isFinished) && (
                <p className="text-3xl font-bold text-white mt-1">{match.home_score}</p>
              )}
            </div>
            
            <div className="px-4">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600">
                <span className="text-slate-400 font-bold text-sm">VS</span>
              </div>
            </div>
            
            <div className="flex-1 text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center mb-2 border border-slate-600">
                <span className="text-xl font-bold text-white">{match.team_away?.slice(0, 2).toUpperCase()}</span>
              </div>
              <p className="text-white font-semibold text-sm truncate">{match.team_away}</p>
              {(isLive || isFinished) && (
                <p className="text-3xl font-bold text-white mt-1">{match.away_score}</p>
              )}
            </div>
          </div>
          
          {/* Match Info */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[120px]">{match.stadium || 'TBA'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>{match.match_date ? format(new Date(match.match_date), 'MMM d, h:mm a') : 'TBA'}</span>
            </div>
          </div>
          
          {/* Prediction Badge */}
          {match.prediction && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-3 border border-amber-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium">AI Prediction</span>
                </div>
                <span className="text-white font-bold">{match.prediction}</span>
              </div>
              {match.prediction_confidence && (
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${match.prediction_confidence}%` }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1 text-right">{match.prediction_confidence}% confidence</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}