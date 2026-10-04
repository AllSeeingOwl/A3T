import React, { useState, useMemo } from 'react';
import { PlayerRank } from '../hooks/useAnalytics';
import { Award, Search, Trophy, ArrowUpDown } from 'lucide-react';

interface PlayerLeaderboardProps {
  leaderboard: PlayerRank[];
}

type SortField = 'rank' | 'total_score' | 'avg_score' | 'accuracy' | 'games_played';

export const PlayerLeaderboard: React.FC<PlayerLeaderboardProps> = ({ leaderboard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredAndSortedLeaderboard = useMemo(() => {
    let list = leaderboard.filter((p) =>
      p.player_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return list;
  }, [leaderboard, searchTerm, sortField, sortAsc]);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-gray-400">
          Showing Top <span className="font-bold text-white">{filteredAndSortedLeaderboard.length}</span> players
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto shadow-md">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-900/60 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-700">
            <tr>
              <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-white" onClick={() => handleSort('rank')}>
                <div className="flex items-center justify-center gap-1">
                  Rank <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3">Player Name</th>
              <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-white" onClick={() => handleSort('games_played')}>
                <div className="flex items-center justify-center gap-1">
                  Games Played <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-white" onClick={() => handleSort('total_score')}>
                <div className="flex items-center justify-center gap-1">
                  Total Score <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-white" onClick={() => handleSort('avg_score')}>
                <div className="flex items-center justify-center gap-1">
                  Avg Score <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-center cursor-pointer select-none hover:text-white" onClick={() => handleSort('accuracy')}>
                <div className="flex items-center justify-center gap-1">
                  Accuracy <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">Last Played</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredAndSortedLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No players found.
                </td>
              </tr>
            ) : (
              filteredAndSortedLeaderboard.map((p) => {
                const isTop3 = p.rank <= 3;
                return (
                  <tr key={p.rank + p.player_name} className="hover:bg-gray-750/50">
                    <td className="px-4 py-3 text-center font-bold">
                      {p.rank === 1 && <Trophy className="w-5 h-5 text-amber-400 inline" />}
                      {p.rank === 2 && <Award className="w-5 h-5 text-gray-300 inline" />}
                      {p.rank === 3 && <Award className="w-5 h-5 text-amber-700 inline" />}
                      {p.rank > 3 && <span className="text-gray-400 font-mono">#{p.rank}</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                      {p.player_name}
                      {isTop3 && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] uppercase font-bold rounded">
                          Elite
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono">{p.games_played}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-indigo-300">
                      {p.total_score.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-xs">{p.avg_score}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-900/40 text-emerald-300 rounded font-bold text-xs">
                        {Math.round(p.accuracy * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">{p.last_played}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
