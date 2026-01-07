import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { TicketInput } from '../types';

function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<TicketInput>({
    title: '',
    description: '',
    customerType: 'free',
    metadata: {
      tags: [],
      previousTickets: 0
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ticket = await api.createTicket(formData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate(`/tickets/${ticket.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create ticket');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="card">
      <h2>Create Support Ticket</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Submit a ticket and watch it get automatically triaged and routed by the AI system.
      </p>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          Ticket created successfully! Redirecting to ticket details...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Ticket Title *</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue. More detail helps the AI make better routing decisions."
            required
            disabled={loading}
          />
          <small style={{ color: '#666', fontSize: '13px' }}>
            Tip: Include keywords like "billing", "bug", "feature request", or "urgent" for better classification.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="customerType">Customer Type *</label>
          <select
            id="customerType"
            name="customerType"
            value={formData.customerType}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <small style={{ color: '#666', fontSize: '13px' }}>
            Customer type affects urgency prioritization.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="previousTickets">Previous Tickets (Optional)</label>
          <input
            id="previousTickets"
            type="number"
            min="0"
            value={formData.metadata?.previousTickets || 0}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                previousTickets: parseInt(e.target.value) || 0
              }
            }))}
            disabled={loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Ticket...' : 'Create Ticket'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tickets')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;

