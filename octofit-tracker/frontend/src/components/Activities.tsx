import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface ActivityItem {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt?: string;
}

interface ActivitiesResponse {
  activities: ActivityItem[];
}

export default function Activities() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => {
        if (active) {
          setActivities(data.activities || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(`Unable to load activities: ${err.message || 'Error occurred'}`);
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
        <h2 className="card-title h4">Activities</h2>
        <p className="card-text text-muted">Track student activity minutes and points.</p>

        {loading && <div role="status" className="text-secondary">Loading activities...</div>}

        {error && <div role="alert" className="alert alert-danger">{error}</div>}

        {!loading && !error && activities.length === 0 && (
          <p className="text-muted">No activities recorded yet (empty state).</p>
        )}

        {!loading && !error && activities.length > 0 && (
          <ul className="list-group">
            {activities.map((act, index) => (
              <li key={act._id || index} className="list-group-item d-flex justify-content-between align-items-center">
                <span>{act.type} - {act.minutes} mins</span>
                <span className="badge bg-primary rounded-pill">{act.points} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
