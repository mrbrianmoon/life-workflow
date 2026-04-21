import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from './supabaseClient.js';
import './Layout.css';

export default function Layout() {
  const [authed, setAuthed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(function() {
    supabase.auth.getSession().then(function({ data: { session } }) {
      setAuthed(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(function(event, session) {
      setAuthed(!!session);
    });

    return function() { subscription.unsubscribe(); };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.removeItem('tdw_login_at');
    setMenuOpen(false);
  }

  return (
    <div className="layout">
      <nav className="top-nav">
        <div className="nav-brand">Life Workflow</div>

        {/* ── Desktop links ── */}
        <div className="nav-links">
          <NavLink to="/" end className={function({ isActive }) { return isActive ? 'nav-link active' : 'nav-link'; }}>
            Home
          </NavLink>
          <NavLink to="/todo" className={function({ isActive }) { return isActive ? 'nav-link active' : 'nav-link'; }}>
            To Do
          </NavLink>
          <NavLink to="/lawn-care" className={function({ isActive }) { return isActive ? 'nav-link active' : 'nav-link'; }}>
            Lawn Care
          </NavLink>
          {authed && (
            <button className="nav-signout" onClick={handleSignOut}>
              ↩ Sign out
            </button>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={function() { setMenuOpen(function(prev) { return !prev; }); }}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" end className={function({ isActive }) { return isActive ? 'mobile-menu-link active' : 'mobile-menu-link'; }}
            onClick={function() { setMenuOpen(false); }}>
            Home
          </NavLink>
          <NavLink to="/todo" className={function({ isActive }) { return isActive ? 'mobile-menu-link active' : 'mobile-menu-link'; }}
            onClick={function() { setMenuOpen(false); }}>
            To Do
          </NavLink>
          <NavLink to="/lawn-care" className={function({ isActive }) { return isActive ? 'mobile-menu-link active' : 'mobile-menu-link'; }}
            onClick={function() { setMenuOpen(false); }}>
            Lawn Care
          </NavLink>
          {authed && (
            <button className="mobile-menu-signout" onClick={handleSignOut}>
              ↩ Sign out
            </button>
          )}
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
