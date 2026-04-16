import { useState } from 'react';
import { supabase } from '../../shared/supabaseClient.js';
import styles from './LoginScreen.module.css';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error || !data.session) {
      setError(error?.message || 'Sign in failed. Please try again.');
      return;
    }

    localStorage.setItem('tdw_login_at', String(Date.now()));
    onLogin();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <h1 className={styles.title}>To Do</h1>
        <p className={styles.subtitle}>Sign in to access your workspace</p>

        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          autoComplete="email"
          value={email}
          onChange={function(e) { setEmail(e.target.value); }}
          onKeyDown={function(e) { if (e.key === 'Enter') document.getElementById('tdw-password').focus(); }}
          autoFocus
        />

        <label className={styles.label}>Password</label>
        <input
          id="tdw-password"
          className={styles.input}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={function(e) { setPassword(e.target.value); }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit(); }}
        />

        <button
          className={styles.submit}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
