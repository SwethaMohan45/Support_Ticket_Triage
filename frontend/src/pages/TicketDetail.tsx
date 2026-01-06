import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Ticket, TeamQueue } from '../types';

function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    newQueue: '' as TeamQueue,
    reason: '',
    overriddenBy: ''
  });
  const [overrideLoading, setOverrideLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const data = await api.getTicket(id!);
      setTicket(data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideLoading(true);

    try {
      const updated = await api.overrideRouting(
        id!,
        overrideForm.newQueue,
        overrideForm.reason,
        overrideForm.overriddenBy
      );
      setTicket(updated);
      setShowOverride(false);
      setOverrideForm({ newQueue: '' as TeamQueue, reason: '', overriddenBy: '' });
    } catch (error) {
      console.error('Failed to override routing:', error);
      alert('Failed to override routing');
    } finally {
      setOverrideLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading ticket...</div>;
  }

  if (!ticket) {
    return (
      <div className="card">
        <h2>Ticket Not Found</h2>
        <p>The ticket you're looking for doesn't exist.</p>
        <Link to="/tickets" className="btn btn-primary">Back to Tickets</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/tickets" style={{ color: '#5c6ac4', textDecoration: 'none' }}>
          ← Back to Tickets
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{ticket.input.title}</h2>
            <div className="ticket-meta" style={{ marginTop: '12px' }}>
              <span className="badge badge-status">{ticket.status.replace(/_/g, ' ')}</span>
              <span className="badge" style={{ background: '#e3f2fd', color: '#1976d2' }}>
                {ticket.input.customerType}
              </span>
              {ticket.aiAnalysis && (
                <>
                  <span className={`badge-urgency ${ticket.aiAnalysis.urgency}`}>
                    {ticket.aiAnalysis.urgency}
                  </span>
                  <span className="badge badge-category">
                    {ticket.aiAnalysis.category.replace(/_/g, ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#666', textAlign: 'right' }}>
            <div>Created: {formatDate(ticket.createdAt)}</div>
            <div>Updated: {formatDate(ticket.updatedAt)}</div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3>Description</h3>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#2c3e50' }}>
            {ticket.input.description}
          </p>
        </div>

        {ticket.input.metadata && (
          <div style={{ marginTop: '24px' }}>
            <h3>Metadata</h3>
            <div className="info-box">
              {ticket.input.metadata.customerId && (
                <p><strong>Customer ID:</strong> {ticket.input.metadata.customerId}</p>
              )}
              {ticket.input.metadata.previousTickets !== undefined && (
                <p><strong>Previous Tickets:</strong> {ticket.input.metadata.previousTickets}</p>
              )}
              {ticket.input.metadata.tags && ticket.input.metadata.tags.length > 0 && (
                <p><strong>Tags:</strong> {ticket.input.metadata.tags.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {ticket.aiAnalysis && (
        <div className="card">
          <h2>AI Analysis</h2>
          
          <div className="info-box">
            <p><strong>Category:</strong> {ticket.aiAnalysis.category.replace(/_/g, ' ')}</p>
            <p><strong>Urgency:</strong> {ticket.aiAnalysis.urgency}</p>
            <p><strong>Suggested Team:</strong> {ticket.aiAnalysis.suggestedTeam.replace(/_/g, ' ')}</p>
            <p><strong>Confidence:</strong> {Math.round(ticket.aiAnalysis.confidence * 100)}%</p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ 
                  width: `${ticket.aiAnalysis.confidence * 100}%`,
                  background: ticket.aiAnalysis.confidence > 0.8 ? '#4caf50' : 
                             ticket.aiAnalysis.confidence > 0.6 ? '#ff9800' : '#f44336'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Explanation</h3>
            <p style={{ color: '#2c3e50', lineHeight: '1.6' }}>
              {ticket.aiAnalysis.explanation}
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Reasoning Factors</h3>
            <ul style={{ paddingLeft: '24px', lineHeight: '1.8' }}>
              {ticket.aiAnalysis.reasoningFactors.map((factor, idx) => (
                <li key={idx}>{factor}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {ticket.routingDecision && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Routing Decision</h2>
            {!showOverride && (
              <button 
                className="btn btn-secondary"
                onClick={() => setShowOverride(true)}
              >
                Override Routing
              </button>
            )}
          </div>

          <div className="info-box">
            <p>
              <strong>Target Queue:</strong>{' '}
              <span className="badge badge-queue">
                {ticket.routingDecision.targetQueue.replace(/_/g, ' ')}
              </span>
            </p>
            <p>
              <strong>Decision Type:</strong>{' '}
              <span className="badge" style={{ 
                background: ticket.routingDecision.decisionType === 'auto' ? '#e8f5e9' : '#fff3e0',
                color: ticket.routingDecision.decisionType === 'auto' ? '#2e7d32' : '#f57c00'
              }}>
                {ticket.routingDecision.decisionType}
              </span>
            </p>
            <p><strong>Requires Review:</strong> {ticket.routingDecision.requiresReview ? 'Yes' : 'No'}</p>
            <p><strong>Reason:</strong> {ticket.routingDecision.reason}</p>
            <p><strong>Timestamp:</strong> {formatDate(ticket.routingDecision.timestamp)}</p>
          </div>

          {showOverride && (
            <div style={{ marginTop: '24px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
              <h3>Override Routing Decision</h3>
              <form onSubmit={handleOverride}>
                <div className="form-group">
                  <label>New Queue</label>
                  <select
                    value={overrideForm.newQueue}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, newQueue: e.target.value as TeamQueue }))}
                    required
                  >
                    <option value="">Select a queue...</option>
                    <option value="billing">Billing</option>
                    <option value="engineering">Engineering</option>
                    <option value="product">Product</option>
                    <option value="support">Support</option>
                    <option value="manual_review">Manual Review</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason for Override</label>
                  <textarea
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Why are you overriding the routing decision?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Your Name</label>
                  <input
                    type="text"
                    value={overrideForm.overriddenBy}
                    onChange={(e) => setOverrideForm(prev => ({ ...prev, overriddenBy: e.target.value }))}
                    placeholder="Enter your name for audit trail"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn btn-primary" disabled={overrideLoading}>
                    {overrideLoading ? 'Saving...' : 'Save Override'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowOverride(false)}
                    disabled={overrideLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {ticket.overrideHistory.length > 0 && (
        <div className="card">
          <h2>Override History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ticket.overrideHistory.map((override, idx) => (
              <div key={idx} className="info-box">
                <p>
                  <strong>Changed from:</strong> {override.previousQueue.replace(/_/g, ' ')} →{' '}
                  <strong>to:</strong> {override.newQueue.replace(/_/g, ' ')}
                </p>
                <p><strong>Reason:</strong> {override.reason}</p>
                <p><strong>By:</strong> {override.overriddenBy}</p>
                <p><strong>When:</strong> {formatDate(override.timestamp)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetail;

