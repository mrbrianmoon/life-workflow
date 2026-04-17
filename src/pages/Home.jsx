import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <h1 className="home-title">Life Workflow</h1>
      <p className="home-subtitle">Your personal productivity hub</p>

      <div className="app-cards">
        <Link to="/todo" className="app-card">
          <div className="app-card-icon">✓</div>
          <h2>To Do Workstream</h2>
          <p>Task management with priorities, sections, and real-time sync.</p>
          <span className="app-card-status status-live">Live</span>
        </Link>

        <Link to="/lawn-care" className="app-card">
          <div className="app-card-icon">🌱</div>
          <h2>Lawn Care</h2>
          <p>Track zones, treatments, schedules, and seasonal plans.</p>
          <span className="app-card-status status-live">Live</span>
        </Link>
      </div>
    </div>
  );
}
