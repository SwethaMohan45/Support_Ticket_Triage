import { Routes, Route, Link, useLocation } from 'react-router-dom';
import CreateTicket from './pages/CreateTicket';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import Queues from './pages/Queues';
import Dashboard from './pages/Dashboard';

function App() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Support Ticket Triage System</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            AI-powered ticket routing with human-in-the-loop control
          </p>
          <nav>
            <Link to="/" className={isActive('/')}>Dashboard</Link>
            <Link to="/create" className={isActive('/create')}>Create Ticket</Link>
            <Link to="/tickets" className={isActive('/tickets')}>All Tickets</Link>
            <Link to="/queues" className={isActive('/queues')}>Queues</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTicket />} />
          <Route path="/tickets" element={<TicketList />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/queues" element={<Queues />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

