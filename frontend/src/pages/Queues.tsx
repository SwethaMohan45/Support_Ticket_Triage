import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { QueueStats } from '../types';

function Queues() {
  const [queues, setQueues] = useState<QueueStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueues();
  }, []);

  const loadQueues = async () => {
    try {
      const data = await api.getQueues();
      setQueues(data);
    } catch (error) {
      console.error('Failed to load queues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading queues...</div>;
  }

  return (
    <div>
      <div className="card">
        <h2>Queue Overview</h2>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          View all team queues and their current ticket loads.
        </p>

        <div className="queue-grid">
          {queues.map(queue => (
            <div key={queue.queueName} className="queue-card">
              <h3>{queue.queueName.replace(/_/g, ' ')}</h3>
              <div className="queue-count">{queue.ticketCount}</div>
              <div className="queue-stats">
                <p>
                  <strong>Avg Confidence:</strong>{' '}
                  {Math.round(queue.avgConfidence * 100)}%
                </p>
                <p>
                  <strong>Auto-routed:</strong> {queue.autoRoutedCount}
                </p>
                <p>
                  <strong>Manual:</strong> {queue.manualRoutedCount}
                </p>
              </div>
              {queue.ticketCount > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <Link 
                    to={`/tickets?queue=${queue.queueName}`}
                    style={{ 
                      color: '#5c6ac4', 
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    View Tickets →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {queues.every(q => q.ticketCount === 0) && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No tickets in any queue yet.</p>
            <Link to="/create" style={{ color: '#5c6ac4' }}>Create your first ticket</Link>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Queue Descriptions</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="info-box">
            <h3 style={{ marginBottom: '8px' }}>Billing</h3>
            <p>Payment issues, invoices, subscriptions, and pricing questions.</p>
          </div>
          <div className="info-box">
            <h3 style={{ marginBottom: '8px' }}>Engineering</h3>
            <p>Bugs, technical issues, outages, and system errors.</p>
          </div>
          <div className="info-box">
            <h3 style={{ marginBottom: '8px' }}>Product</h3>
            <p>Feature requests, product feedback, and enhancement suggestions.</p>
          </div>
          <div className="info-box">
            <h3 style={{ marginBottom: '8px' }}>Support</h3>
            <p>General questions, how-to inquiries, and miscellaneous support.</p>
          </div>
          <div className="info-box">
            <h3 style={{ marginBottom: '8px' }}>Manual Review</h3>
            <p>Tickets that require human review before routing (low confidence or ambiguous).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Queues;

