import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="nav-brand">Life Workflow</div>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/todo" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            To Do
          </NavLink>
          <NavLink to="/lawn-care" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Lawn Care
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
