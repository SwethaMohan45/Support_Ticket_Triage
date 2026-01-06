import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Ticket } from '../types';

function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadTickets();
  }, [filter]);

  const loadTickets = async () => {
    try {
      const data = await api.getTickets(filter ? { status: filter } : undefined);
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>All Tickets ({tickets.length})</h2>
          <Link to="/create" className="btn btn-primary">
            Create New Ticket
          </Link>
        </div>

        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <label style={{ marginRight: '12px', fontWeight: 500 }}>Filter by status:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="">All</option>
            <option value="pending_analysis">Pending Analysis</option>
            <option value="pending_review">Pending Review</option>
            <option value="routed">Routed</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No tickets found.</p>
            <Link to="/create" style={{ color: '#5c6ac4' }}>Create your first ticket</Link>
          </div>
        ) : (
          <div className="ticket-list">
            {tickets.map(ticket => (
              <Link 
                key={ticket.id} 
                to={`/tickets/${ticket.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="ticket-item">
                  <div className="ticket-header">
                    <div style={{ flex: 1 }}>
                      <div className="ticket-title">{ticket.input.title}</div>
                      <div className="ticket-meta">
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
                        {ticket.routingDecision && (
                          <span className="badge badge-queue">
                            → {ticket.routingDecision.targetQueue.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', textAlign: 'right' }}>
                      <div>{formatDate(ticket.createdAt)}</div>
                      {ticket.routingDecision && (
                        <div style={{ marginTop: '4px' }}>
                          <span className="badge" style={{ 
                            background: ticket.routingDecision.decisionType === 'auto' ? '#e8f5e9' : '#fff3e0',
                            color: ticket.routingDecision.decisionType === 'auto' ? '#2e7d32' : '#f57c00'
                          }}>
                            {ticket.routingDecision.decisionType}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ticket-description">
                    {ticket.input.description.substring(0, 150)}
                    {ticket.input.description.length > 150 && '...'}
                  </div>

                  {ticket.aiAnalysis && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="confidence-label">
                          AI Confidence: {Math.round(ticket.aiAnalysis.confidence * 100)}%
                        </span>
                      </div>
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
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketList;

