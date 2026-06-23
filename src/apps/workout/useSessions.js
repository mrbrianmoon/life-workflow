import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';

// ── Logged sessions (history) ─────────────────────────────────────
// Each logged session is an immutable snapshot of a routine's numbers
// at the moment it was logged. Stored with the exercise readout as a
// jsonb array, matching the prototype's history entry shape.
//
// Same conventions as useRoutines: RLS-scoped selects, getUser() on
// insert, optimistic delete with resync-on-failure. No update path —
// snapshots don't change once logged (the DB has no update policy).

export function useSessions(userId) {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(function () {
    if (!userId) return;
    loadSessions();
  }, [userId]);

  async function loadSessions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .order('logged_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSessions(data || []);
    setLoading(false);
  }

  // Snapshot a routine into a dated history entry.
  // `volume` and `exercises` are computed by the caller from current
  // routine state (the readout array of { name, weight, sets, reps, rest }).
  async function logSession(routineId, volume, exercises) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert([{
        user_id:    authData.user.id,
        routine_id: routineId,
        volume:     volume || 0,
        exercises:  exercises || [],
      }])
      .select()
      .single();

    if (error) return { error: error.message };

    setSessions(function (prev) { return [data, ...prev]; });
    return { data };
  }

  async function deleteSession(id) {
    setSessions(function (prev) { return prev.filter(function (s) { return s.id !== id; }); });

    const { error } = await supabase.from('workout_sessions').delete().eq('id', id);
    if (error) {
      loadSessions();
      return { error: error.message };
    }
    return {};
  }

  // Convenience selector: history entries for one routine, newest first.
  function sessionsFor(routineId) {
    return sessions.filter(function (s) { return s.routine_id === routineId; });
  }

  return { sessions, loading, error, logSession, deleteSession, sessionsFor };
}
