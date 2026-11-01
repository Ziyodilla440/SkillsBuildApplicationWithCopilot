import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface TeamItem {
  _id?: string;
  name: string;
  mascot?: string;
  members?: (string | { name: string })[];
}

interface TeamsResponse {
  teams: TeamItem[];
}

export default function Teams() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<TeamsResponse>('/api/teams')
      .then((data) => {
        if (active) {
          setTeams(data.teams || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(`Unable to load teams: ${err.message || 'Error occurred'}`);
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
        <h2 className="card-title h4">Teams</h2>
        <p className="card-text text-muted">Manage teams and members.</p>

        {loading && <div role="status" className="text-secondary">Loading teams...</div>}

        {error && <div role="alert" className="alert alert-danger">{error}</div>}

        {!loading && !error && teams.length === 0 && (
          <p className="text-muted">No teams found.</p>
        )}

        {!loading && !error && teams.length > 0 && (
          <div className="row g-3">
            {teams.map((team, index) => (
              <div key={team._id || index} className="col-md-6">
                <div className="border rounded p-3">
                  <h5>{team.name}</h5>
                  {team.mascot && <p className="mb-1 text-muted">Mascot: {team.mascot}</p>}
                  {team.members && team.members.length > 0 && (
                    <small className="text-secondary">
                      Members: {team.members.map((m) => (typeof m === 'object' ? m.name : m)).join(', ')}
                    </small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
