import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardItem {
  teamId?: string;
  teamName: string;
  totalPoints: number;
  rank: number;
  mascot?: string;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardItem[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then((data) => {
        if (active) {
          setLeaderboard(data.leaderboard || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(`Unable to load leaderboard: ${err.message || 'Error occurred'}`);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="card">
      <div className="card-body">
        <h2 className="card-title h4">Leaderboard</h2>
        <p className="card-text text-muted">Compare team point totals.</p>

        {loading && <div role="status" className="text-secondary">Loading leaderboard...</div>}

        {error && <div role="alert" className="alert alert-danger">{error}</div>}

        {!loading && !error && leaderboard.length === 0 && (
          <p className="text-muted">No leaderboard scores available yet.</p>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <table className="table table-striped mt-3">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, index) => (
                <tr key={item.teamId || index}>
                  <td>#{item.rank}</td>
                  <td>{item.teamName}</td>
                  <td>{item.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
