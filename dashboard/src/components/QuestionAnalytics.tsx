import React, { useState, useMemo } from 'react';
import { QuestionStat } from '../hooks/useAnalytics';
import { Search, Filter, AlertTriangle, Flag, EyeOff, Eye } from 'lucide-react';

interface QuestionAnalyticsProps {
  questions: QuestionStat[];
  onHideQuestion: (questionId: string, reason: string) => Promise<boolean>;
  onUnhideQuestion: (questionId: string) => Promise<boolean>;
  onFlagQuestion: (questionId: string, reason: string, suggestedFix?: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

export const QuestionAnalytics: React.FC<QuestionAnalyticsProps> = ({
  questions,
  onHideQuestion,
  onUnhideQuestion,
  onFlagQuestion,
  isAuthenticated,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [flagModalQ, setFlagModalQ] = useState<QuestionStat | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagFix, setFlagFix] = useState('');
  const [flagSuccessMsg, setFlagSuccessMsg] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(questions.map((q) => q.category));
    return ['All', ...Array.from(set)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.question_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchesDifficulty =
        selectedDifficulty === 'All' ||
        q.difficulty_intended.toLowerCase().includes(selectedDifficulty.toLowerCase()) ||
        q.difficulty_actual.toLowerCase().includes(selectedDifficulty.toLowerCase());
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [questions, searchTerm, selectedCategory, selectedDifficulty]);

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModalQ || !flagReason.trim()) return;
    const ok = await onFlagQuestion(flagModalQ.question_id, flagReason, flagFix);
    if (ok) {
      setFlagSuccessMsg(`Question ${flagModalQ.question_id} flagged successfully.`);
      setTimeout(() => setFlagSuccessMsg(null), 4000);
      setFlagModalQ(null);
      setFlagReason('');
      setFlagFix('');
    }
  };

  return (
    <div className="space-y-4">
      {flagSuccessMsg && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-lg" role="status">
          {flagSuccessMsg}
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none"
            >
              <option value="All">All Difficulties</option>
              <option value="Casual">Casual</option>
              <option value="Fan">Fan</option>
              <option value="Hardcore">Hardcore</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto shadow-md">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/60 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-700">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-center">Times Asked</th>
              <th className="px-4 py-3 text-center">Accuracy</th>
              <th className="px-4 py-3">Difficulty (Intended vs Actual)</th>
              <th className="px-4 py-3 text-center">Avg Time</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-400">
                  No questions match your current filters.
                </td>
              </tr>
            ) : (
              filteredQuestions.map((q) => {
                const isLowAcc = q.accuracy < 0.4;
                const isHighAcc = q.accuracy >= 0.8;
                return (
                  <tr key={q.question_id} className="hover:bg-gray-750/50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-300">{q.question_id}</td>
                    <td className="px-4 py-3 max-w-md font-medium text-white">{q.question}</td>
                    <td className="px-4 py-3 text-gray-400">{q.category}</td>
                    <td className="px-4 py-3 text-center font-mono">{q.times_asked}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          isLowAcc
                            ? 'bg-red-900/50 text-red-300 border border-red-700'
                            : isHighAcc
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        {Math.round(q.accuracy * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-gray-300">{q.difficulty_intended}</div>
                      <div className="text-gray-500 font-semibold">Actual: {q.difficulty_actual}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{q.avg_time_taken}s</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          q.status === 'active' ? 'bg-emerald-900/40 text-emerald-300' : 'bg-amber-900/40 text-amber-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setFlagModalQ(q)}
                        className="p-1.5 bg-gray-700 hover:bg-amber-600/30 text-amber-300 rounded transition"
                        title="Flag Question"
                        type="button"
                      >
                        <Flag className="w-4 h-4" />
                      </button>
                      {isAuthenticated && (
                        q.status === 'active' ? (
                          <button
                            onClick={() => onHideQuestion(q.question_id, 'Admin flagged low accuracy')}
                            className="p-1.5 bg-gray-700 hover:bg-red-600/30 text-red-300 rounded transition"
                            title="Hide Question"
                            type="button"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onUnhideQuestion(q.question_id)}
                            className="p-1.5 bg-gray-700 hover:bg-emerald-600/30 text-emerald-300 rounded transition"
                            title="Unhide Question"
                            type="button"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {flagModalQ && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Flag Question {flagModalQ.question_id}
            </h3>
            <p className="text-sm text-gray-300 bg-gray-900 p-3 rounded">{flagModalQ.question}</p>
            <form onSubmit={handleFlagSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Reason for Flagging</label>
                <textarea
                  required
                  rows={3}
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="e.g. Ambiguous wording, typo, or multiple correct answers..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Suggested Fix (Optional)</label>
                <textarea
                  rows={2}
                  value={flagFix}
                  onChange={(e) => setFlagFix(e.target.value)}
                  placeholder="Suggested revised question text..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFlagModalQ(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold rounded-lg"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
