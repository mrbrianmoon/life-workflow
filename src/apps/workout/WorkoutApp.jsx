import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../shared/supabaseClient';
import LoginScreen from '../todo/LoginScreen';
import styles from './WorkoutApp.module.css';
import { useRoutines } from './useRoutines';
import { useSessions } from './useSessions';
import RoutineCard from './RoutineCard';

// ── Auth shell ────────────────────────────────────────────────────
// Matches the null/false/true pattern from CarApp / TodoApp

export default function WorkoutApp() {
  const [authReady, setAuthReady] = useState(null); // null=checking, false=login, true=app

  useEffect(function () {
    supabase.auth.getSession().then(function ({ data: { session } }) {
      setAuthReady(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(function (_event, session) {
      setAuthReady(!!session);
    });

    return function () { subscription.unsubscribe(); };
  }, []);

  if (authReady === null) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      </div>
    );
  }

  if (authReady === false) {
    return <LoginScreen onLogin={function () { setAuthReady(true); }} />;
  }

  return <WorkoutAppInner />;
}

// ── Inner app (only mounts when authenticated) ────────────────────
function WorkoutAppInner() {
  const [userId, setUserId] = useState(null);

  useEffect(function () {
    supabase.auth.getUser().then(function ({ data: { user } }) {
      if (user) setUserId(user.id);
    });
  }, []);

  const {
    routines, loading: routinesLoading, error: routinesError,
    addRoutine, deleteRoutine,
    addExercise, updateExercise, deleteExercise, resetSets,
  } = useRoutines(userId);

  const {
    loading: sessionsLoading, error: sessionsError,
    logSession, deleteSession, sessionsFor,
  } = useSessions(userId);

  const [newRoutine,  setNewRoutine]  = useState('');
  const [openId,      setOpenId]      = useState(null);
  const [historyId,   setHistoryId]   = useState(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState('');
  const [isError,   setIsError]   = useState(false);

  function showStatus(msg, err) {
    setStatusMsg(msg);
    setIsError(!!err);
    setTimeout(function () { setStatusMsg(''); }, 2500);
  }

  async function handleAddRoutine() {
    const name = newRoutine.trim();
    if (!name) return;
    const { data, error } = await addRoutine(name);
    if (error) { showStatus('Could not add routine', true); return; }
    setNewRoutine('');
    if (data) setOpenId(data.id);
  }

  async function handleDeleteRoutine(id) {
    const { error } = await deleteRoutine(id);
    if (error) showStatus('Could not delete routine', true);
  }

  async function handleAddExercise(id) {
    const { error } = await addExercise(id);
    if (error) showStatus('Could not add exercise', true);
  }

  async function handleUpdateExercise(routineId, exerciseId, patch) {
    const { error } = await updateExercise(routineId, exerciseId, patch);
    if (error) showStatus('Could not save change', true);
  }

  async function handleDeleteExercise(routineId, exerciseId) {
    const { error } = await deleteExercise(routineId, exerciseId);
    if (error) showStatus('Could not delete exercise', true);
  }

  async function handleResetSets(id) {
    const { error } = await resetSets(id);
    if (error) showStatus('Could not reset checks', true);
  }

  async function handleLogSession(routineId, volume, readout) {
    const { error } = await logSession(routineId, volume, readout);
    if (error) { showStatus('Could not log session', true); return; }
    // Clear the set checks for next time, same as the prototype did
    await resetSets(routineId);
    showStatus('✓ Logged');
  }

  async function handleDeleteSession(id) {
    const { error } = await deleteSession(id);
    if (error) showStatus('Could not delete session', true);
  }

  function toggleRoutine(id) {
    setOpenId(function (cur) { return cur === id ? null : id; });
  }

  function toggleHistory(id) {
    setHistoryId(function (cur) { return cur === id ? null : id; });
  }

  const loading = routinesLoading || sessionsLoading;
  const error   = routinesError   || sessionsError;

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1>Lift Log</h1>
        <p>Build routines, track your sets. Everything saves as you go.</p>
      </div>

      <div className={`${styles.statusBar}${isError ? ' ' + styles.error : ''}`}>
        {error ? '✕ ' + error : statusMsg}
      </div>

      <div className={styles.addBar}>
        <input
          className={styles.input}
          placeholder="New routine name (e.g. Push Day A)"
          value={newRoutine}
          onChange={function (e) { setNewRoutine(e.target.value); }}
          onKeyDown={function (e) { if (e.key === 'Enter') handleAddRoutine(); }}
        />
        <button className={styles.addBtn} onClick={handleAddRoutine}>
          <Plus size={16} /> Add
        </button>
      </div>

      {routines.length === 0 && (
        <div className={styles.empty}>No routines yet. Add one above to get started.</div>
      )}

      {routines.map(function (r) {
        return (
          <RoutineCard
            key={r.id}
            routine={r}
            open={openId === r.id}
            onToggle={toggleRoutine}
            sessions={sessionsFor(r.id)}
            historyOpen={historyId === r.id}
            onToggleHistory={toggleHistory}
            onDeleteRoutine={handleDeleteRoutine}
            onAddExercise={handleAddExercise}
            onUpdateExercise={handleUpdateExercise}
            onDeleteExercise={handleDeleteExercise}
            onResetSets={handleResetSets}
            onLogSession={handleLogSession}
            onDeleteSession={handleDeleteSession}
          />
        );
      })}
    </div>
  );
}
