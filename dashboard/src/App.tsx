import React, { useState } from 'react';
import { useAnalytics } from './hooks/useAnalytics';
import { Overview } from './components/Overview';
import { QuestionAnalytics } from './components/QuestionAnalytics';
import { PlayerLeaderboard } from './components/PlayerLeaderboard';
import { AdminPanel } from './components/AdminPanel';
import { LayoutDashboard, HelpCircle, Trophy, ShieldAlert, RefreshCw, Radio } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'leaderboard' | 'admin'>('overview');
  const analytics = useAnalytics();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">A3T ANALYTICS & ADMIN</h1>
            <p className="text-xs text-gray-400">Always A Trivial Triple Threat Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full text-xs">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-gray-300">Live Active Players:</span>
            <span className="font-bold text-emerald-400">{analytics.livePlayerCount}</span>
          </div>

          <button
            onClick={() => analytics.refetchAll()}
            type="button"
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      <nav className="bg-gray-800/60 border-b border-gray-700 px-6 pt-3 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400 bg-gray-800/80 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'questions'
              ? 'border-indigo-500 text-indigo-400 bg-gray-800/80 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Question Performance
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
            activeTab === 'leaderboard'
              ? 'border-indigo-500 text-indigo-400 bg-gray-800/80 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          type="button"
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition relative ${
            activeTab === 'admin'
              ? 'border-indigo-500 text-indigo-400 bg-gray-800/80 rounded-t-lg'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Admin Panel
          {analytics.flaggedQuestions.length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-gray-900 font-extrabold text-[10px] rounded-full">
              {analytics.flaggedQuestions.length}
            </span>
          )}
        </button>
      </nav>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {analytics.loading && !analytics.overview ? (
          <div className="flex justify-center items-center h-64" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <span className="ml-3 text-gray-400">Loading Dashboard...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <Overview
                overview={analytics.overview}
                dailyStats={analytics.dailyStats}
                categoryBreakdown={analytics.categoryBreakdown}
                difficultyBreakdown={analytics.difficultyBreakdown}
                livePlayerCount={analytics.livePlayerCount}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionAnalytics
                questions={analytics.questions}
                onHideQuestion={analytics.hideQuestion}
                onUnhideQuestion={analytics.unhideQuestion}
                onFlagQuestion={analytics.flagQuestion}
                isAuthenticated={analytics.isAuthenticated}
              />
            )}

            {activeTab === 'leaderboard' && (
              <PlayerLeaderboard leaderboard={analytics.leaderboard} />
            )}

            {activeTab === 'admin' && (
              <AdminPanel
                flaggedQuestions={analytics.flaggedQuestions}
                questions={analytics.questions}
                isAuthenticated={analytics.isAuthenticated}
                error={analytics.error}
                onAuthenticate={analytics.authenticate}
                onLogout={analytics.logout}
                onHideQuestion={analytics.hideQuestion}
                onUnhideQuestion={analytics.unhideQuestion}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
export default App;
