import React, { useState } from 'react';
import { FlaggedQuestion, QuestionStat } from '../hooks/useAnalytics';
import { Lock, Flag, EyeOff, Eye, CheckCircle2, Key } from 'lucide-react';

interface AdminPanelProps {
  flaggedQuestions: FlaggedQuestion[];
  questions: QuestionStat[];
  isAuthenticated: boolean;
  error: string | null;
  onAuthenticate: (password: string) => Promise<boolean>;
  onLogout: () => void;
  onHideQuestion: (questionId: string, reason: string) => Promise<boolean>;
  onUnhideQuestion: (questionId: string) => Promise<boolean>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  flaggedQuestions,
  questions,
  isAuthenticated,
  error,
  onAuthenticate,
  onLogout,
  onHideQuestion,
  onUnhideQuestion,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    await onAuthenticate(passwordInput);
    setAuthLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Authentication Required</h2>
          <p className="text-xs text-gray-400">Enter password to access content moderation controls</p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-3 py-2 rounded text-xs" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Admin Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-md disabled:opacity-50"
          >
            {authLoading ? 'Authenticating...' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Admin Moderation Console</h3>
            <p className="text-xs text-gray-400">Authenticated (JWT session active)</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          type="button"
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded-lg transition"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4 shadow-md">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Flagged Questions ({flaggedQuestions.length})</h3>
          </div>
        </div>

        {flaggedQuestions.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-4">No questions are currently flagged for review.</p>
        ) : (
          <div className="space-y-3">
            {flaggedQuestions.map((flag) => {
              const matchedQ = questions.find((q) => q.question_id === flag.question_id);
              const isHidden = matchedQ?.status === 'hidden';

              return (
                <div key={flag.flag_id} className="bg-gray-900 border border-gray-700/80 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        {flag.flag_id} • Question {flag.question_id}
                      </span>
                      {matchedQ && (
                        <p className="text-sm font-medium text-white">{matchedQ.question}</p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 bg-amber-900/40 text-amber-300 text-xs rounded uppercase font-bold">
                      {flag.status}
                    </span>
                  </div>

                  <div className="bg-gray-800/80 p-3 rounded text-xs space-y-1 text-gray-300">
                    <p><span className="text-gray-500 font-semibold">Reason:</span> {flag.reason}</p>
                    {flag.suggested_fix && (
                      <p><span className="text-gray-500 font-semibold">Suggested Fix:</span> {flag.suggested_fix}</p>
                    )}
                    <p className="text-gray-500 text-[10px]">
                      Flagged by {flag.flagged_by} at {new Date(flag.flagged_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    {isHidden ? (
                      <button
                        onClick={() => onUnhideQuestion(flag.question_id)}
                        type="button"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Unhide Question
                      </button>
                    ) : (
                      <button
                        onClick={() => onHideQuestion(flag.question_id, flag.reason)}
                        type="button"
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-md flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" /> Hide Question
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
