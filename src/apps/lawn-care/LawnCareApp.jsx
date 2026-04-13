import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';
import ZoneManager from './ZoneManager';
import SeasonalSchedule from './SeasonalSchedule';
import './LawnCareApp.css';

export default function LawnCareApp() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(function () {
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    await loadZones();
    setLoading(false);
  }

  async function loadZones() {
    const { data, error } = await supabase
      .from('lc_zones')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Load zones error:', error);
      return;
    }
    setZones(data || []);
  }

  if (loading) {
    return <div className="lawn-care"><p className="loading-msg">Loading...</p></div>;
  }

  if (authenticated === false) {
    return (
      <div className="lawn-care">
        <h1>Lawn Care</h1>
        <div className="auth-notice">
          <p>Sign in to access your lawn care schedule.</p>
          <p className="auth-hint">
            Use the same Supabase credentials from your To Do app.
            Auth will be unified in a future update.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lawn-care">
      <h1>Lawn Care</h1>
      <p className="lawn-subtitle">Central Indiana · Cool-season turf · Zone 6a/6b</p>

      <ZoneManager zones={zones} onZonesChange={loadZones} />
      <SeasonalSchedule zones={zones} />
    </div>
  );
}
