import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface WorkoutSuggestion {
  _id?: string;
  title: string;
  focus?: string;
  minutes?: number;
  difficulty?: string;
  reason?: string;
}

interface WorkoutsResponse {
  suggestions: WorkoutSuggestion[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<WorkoutSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<WorkoutsResponse>('/api/workouts/suggestions/mona@example.com')
      .then((data) => {
        if (active) {
          setSuggestions(data.suggestions || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(`Unable to load workout suggestions: ${err.message || 'Error occurred'}`);
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
        <h2 className="card-title h4">Workout suggestions</h2>
        <p className="card-text text-muted">Recommend workouts from activity patterns.</p>

        {loading && <div role="status" className="text-secondary">Loading workout suggestions...</div>}

        {error && <div role="alert" className="alert alert-danger">{error}</div>}

        {!loading && !error && suggestions.length === 0 && (
          <p className="text-muted">No workout suggestions found.</p>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <div className="row g-3">
            {suggestions.map((suggestion, index) => (
              <div key={suggestion._id || index} className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <h5>{suggestion.title}</h5>
                  {suggestion.focus && <p className="mb-1 text-muted">Focus: {suggestion.focus}</p>}
                  {suggestion.minutes && <p className="mb-1 text-muted">Duration: {suggestion.minutes} mins</p>}
                  {suggestion.reason && <p className="badge bg-info text-dark text-wrap">{suggestion.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
