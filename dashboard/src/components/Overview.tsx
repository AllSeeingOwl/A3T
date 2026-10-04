import React from 'react';
import { OverviewData, DailyStat, CategoryBreakdown, DifficultyBreakdown } from '../hooks/useAnalytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Gamepad2, Users, Calendar, Target, Activity } from 'lucide-react';

interface OverviewProps {
  overview: OverviewData | null;
  dailyStats: DailyStat[];
  categoryBreakdown: CategoryBreakdown | null;
  difficultyBreakdown: DifficultyBreakdown | null;
  livePlayerCount: number;
}

export const Overview: React.FC<OverviewProps> = ({
  overview,
  dailyStats,
  categoryBreakdown,
  difficultyBreakdown,
  livePlayerCount,
}) => {
  if (!overview) {
    return (
      <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-gray-400">Loading overview stats...</span>
      </div>
    );
  }

  const chartDailyStats = dailyStats.map((d) => ({
    ...d,
    accuracyPct: Math.round(d.avg_accuracy * 100),
  }));

  const categoryChartData = categoryBreakdown
    ? Object.entries(categoryBreakdown).map(([cat, val]) => ({
        category: cat,
        accuracy: Math.round(val.avg_accuracy * 100),
        questions: val.questions,
      }))
    : [];

  const difficultyChartData = difficultyBreakdown
    ? Object.entries(difficultyBreakdown).map(([tier, val]) => ({
        tier,
        accuracy: Math.round(val.avg_accuracy * 100),
        answers: val.total_answers,
      }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Games Played</p>
            <p className="text-2xl font-bold text-white mt-1">{overview.total_games.toLocaleString()}</p>
            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3 inline" /> Avg {overview.avg_players_per_game} players/game
            </p>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Gamepad2 className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Total Unique Players</p>
            <p className="text-2xl font-bold text-white mt-1">{overview.total_players.toLocaleString()}</p>
            <p className="text-xs text-emerald-400 mt-1">
              Live Active: <span className="font-semibold">{livePlayerCount}</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Users className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Sessions Today</p>
            <p className="text-2xl font-bold text-white mt-1">{overview.total_sessions_today}</p>
            <p className="text-xs text-amber-400 mt-1">Avg Score: {overview.avg_score} pts</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
            <Calendar className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">Overall Accuracy</p>
            <p className="text-2xl font-bold text-white mt-1">
              {Math.round(overview.overall_accuracy * 100)}%
            </p>
            <p className="text-xs text-purple-400 mt-1">
              {overview.total_answers_submitted.toLocaleString()} total answers
            </p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
            <Target className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">30-Day Games Played & Accuracy Trend</h3>
            <p className="text-xs text-gray-400">Daily volume and answer accuracy percentage over time</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartDailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#818CF8" />
              <YAxis yAxisId="right" orientation="right" stroke="#34D399" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="games_played" name="Games Played" stroke="#818CF8" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="accuracyPct" name="Accuracy %" stroke="#34D399" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold text-white mb-2">Accuracy by Category</h3>
          <p className="text-xs text-gray-400 mb-4">Percentage of correct responses across trivia domains</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', borderRadius: '0.5rem' }}
                  formatter={(val: number) => [`${val}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-md">
          <h3 className="text-lg font-bold text-white mb-2">Accuracy by Difficulty Tier</h3>
          <p className="text-xs text-gray-400 mb-4">Performance across Casual, Fan, Hardcore, and Expert tiers</p>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="tier" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#4B5563', borderRadius: '0.5rem' }}
                  formatter={(val: number) => [`${val}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
