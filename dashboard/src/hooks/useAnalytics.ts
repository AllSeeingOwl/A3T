import { useState, useEffect, useCallback } from 'react';

export interface OverviewData {
  total_games: number;
  total_players: number;
  total_sessions_today: number;
  avg_players_per_game: number;
  avg_score: number;
  total_answers_submitted: number;
  overall_accuracy: number;
}

export interface QuestionStat {
  question_id: string;
  question: string;
  times_asked: number;
  times_correct: number;
  accuracy: number;
  difficulty_intended: string;
  difficulty_actual: string;
  difficulty_match: number;
  avg_time_taken: number;
  category: string;
  status: 'active' | 'hidden';
}

export interface DailyStat {
  date: string;
  games_played: number;
  unique_players: number;
  total_answers: number;
  avg_accuracy: number;
}

export interface PlayerRank {
  rank: number;
  player_name: string;
  games_played: number;
  total_score: number;
  avg_score: number;
  accuracy: number;
  last_played: string;
}

export interface CategoryBreakdown {
  [category: string]: {
    questions: number;
    avg_accuracy: number;
    most_difficult: string;
    easiest: string;
  };
}

export interface DifficultyBreakdown {
  [tier: string]: {
    avg_accuracy: number;
    total_answers: number;
  };
}

export interface FlaggedQuestion {
  flag_id: string;
  question_id: string;
  reason: string;
  suggested_fix?: string;
  flagged_at: string;
  flagged_by: string;
  status: string;
}

export interface WsEvent {
  event: string;
  data: any;
}

const API_BASE = '/api';

export function useAnalytics() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [questions, setQuestions] = useState<QuestionStat[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [leaderboard, setLeaderboard] = useState<PlayerRank[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown | null>(null);
  const [difficultyBreakdown, setDifficultyBreakdown] = useState<DifficultyBreakdown | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<FlaggedQuestion[]>([]);

  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('a3t_admin_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('a3t_admin_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [livePlayerCount, setLivePlayerCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<WsEvent[]>([]);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/overview`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch (e) {
      console.error('Error fetching overview', e);
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.error('Error fetching questions analytics', e);
    }
  }, []);

  const fetchDailyStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/daily-stats`);
      if (res.ok) {
        const data = await res.json();
        setDailyStats(data);
      }
    } catch (e) {
      console.error('Error fetching daily stats', e);
    }
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/player-leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Error fetching leaderboard', e);
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/category-breakdown`);
      if (res.ok) {
        const data = await res.json();
        setCategoryBreakdown(data);
      }
    } catch (e) {
      console.error('Error fetching category breakdown', e);
    }
  }, []);

  const fetchDifficultyBreakdown = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/difficulty-breakdown`);
      if (res.ok) {
        const data = await res.json();
        setDifficultyBreakdown(data);
      }
    } catch (e) {
      console.error('Error fetching difficulty breakdown', e);
    }
  }, []);

  const fetchFlaggedQuestions = useCallback(async (token?: string) => {
    const activeToken = token || adminToken;
    if (!activeToken) return;
    try {
      const res = await fetch(`${API_BASE}/admin/flagged-questions`, {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFlaggedQuestions(data);
      }
    } catch (e) {
      console.error('Error fetching flagged questions', e);
    }
  }, [adminToken]);

  const authenticate = async (password: string): Promise<boolean> => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE}/admin/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('a3t_admin_token', data.token);
        fetchFlaggedQuestions(data.token);
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.detail || 'Authentication failed');
        return false;
      }
    } catch (e) {
      setError('Failed to authenticate');
      return false;
    }
  };

  const logout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('a3t_admin_token');
  };

  const hideQuestion = async (questionId: string, reason: string): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`${API_BASE}/admin/hide-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ question_id: questionId, reason }),
      });
      if (res.ok) {
        fetchQuestions();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error hiding question', e);
      return false;
    }
  };

  const unhideQuestion = async (questionId: string): Promise<boolean> => {
    if (!adminToken) return false;
    try {
      const res = await fetch(`${API_BASE}/admin/unhide-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ question_id: questionId }),
      });
      if (res.ok) {
        fetchQuestions();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error unhiding question', e);
      return false;
    }
  };

  const flagQuestion = async (questionId: string, reason: string, suggestedFix?: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/admin/flag-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, reason, suggested_fix: suggestedFix }),
      });
      if (res.ok) {
        if (isAuthenticated) fetchFlaggedQuestions();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error flagging question', e);
      return false;
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview(),
      fetchQuestions(),
      fetchDailyStats(),
      fetchLeaderboard(),
      fetchCategoryBreakdown(),
      fetchDifficultyBreakdown(),
      isAuthenticated ? fetchFlaggedQuestions() : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [fetchOverview, fetchQuestions, fetchDailyStats, fetchLeaderboard, fetchCategoryBreakdown, fetchDifficultyBreakdown, fetchFlaggedQuestions, isAuthenticated]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/analytics`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setRecentEvents((prev) => [parsed, ...prev.slice(0, 19)]);

          if (parsed.event === 'player_joined') {
            setLivePlayerCount((prev) => prev + 1);
          } else if (parsed.event === 'game_completed') {
            fetchOverview();
            fetchLeaderboard();
          } else if (parsed.event === 'question_flagged') {
            if (isAuthenticated) fetchFlaggedQuestions();
          }
        } catch (err) {
          console.error('Error parsing WS message', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Analytics WebSocket error:', err);
      };
    } catch (e) {
      console.warn('Could not establish Analytics WebSocket connection:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [fetchOverview, fetchLeaderboard, fetchFlaggedQuestions, isAuthenticated]);

  return {
    overview,
    questions,
    dailyStats,
    leaderboard,
    categoryBreakdown,
    difficultyBreakdown,
    flaggedQuestions,
    isAuthenticated,
    loading,
    error,
    livePlayerCount,
    recentEvents,
    authenticate,
    logout,
    hideQuestion,
    unhideQuestion,
    flagQuestion,
    refetchAll: () => {
      fetchOverview();
      fetchQuestions();
      fetchDailyStats();
      fetchLeaderboard();
      fetchCategoryBreakdown();
      fetchDifficultyBreakdown();
      if (isAuthenticated) fetchFlaggedQuestions();
    },
  };
}
