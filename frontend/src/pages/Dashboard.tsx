import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, healthData] = await Promise.all([
        api.getStats(),
        api.getHealth()
      ]);
      setStats(statsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>System Overview</h2>
        
        {health && (
          <div className="info-box">
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>AI Service:</strong> {health.services?.ai || 'unknown'}</p>
            <p><strong>Storage:</strong> {health.services?.storage || 'unknown'}</p>
          </div>
        )}

        {stats && (
          <div style={{ marginTop: '24px' }}>
            <h3>Ticket Statistics</h3>
            <div className="queue-grid" style={{ marginTop: '16px' }}>
              <div className="queue-card">
                <h3>Total Tickets</h3>
                <div className="queue-count">{stats.total || 0}</div>
              </div>
              
              {stats.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="queue-card">
                  <h3>{status.replace(/_/g, ' ')}</h3>
                  <div className="queue-count">{count as number}</div>
                </div>
              ))}
            </div>

            {stats.byQueue && Object.keys(stats.byQueue).length > 0 && (
              <div>
                <h3 style={{ marginTop: '32px', marginBottom: '16px' }}>Tickets by Queue</h3>
                <div className="queue-grid">
                  {Object.entries(stats.byQueue).map(([queue, count]) => (
                    <div key={queue} className="queue-card">
                      <h3>{queue.replace(/_/g, ' ')}</h3>
                      <div className="queue-count">{count as number}</div>
                      <Link to={`/queues`} style={{ fontSize: '14px', color: '#5c6ac4' }}>
                        View Details →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
          <Link to="/create" className="btn btn-primary">Create New Ticket</Link>
          <Link to="/tickets" className="btn btn-secondary">View All Tickets</Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

