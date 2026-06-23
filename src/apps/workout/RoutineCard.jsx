import { Trash2, ChevronDown, ChevronRight, Plus, RotateCcw, Save, History } from 'lucide-react';
import styles from './WorkoutApp.module.css';
import ExerciseRow from './ExerciseRow';

// ── Volume ────────────────────────────────────────────────────────
// weight * sets * reps summed across exercises; rows missing any of the
// three numeric values contribute 0. (Same rule as the prototype.)
export function routineVolume(exercises) {
  return exercises.reduce(function (sum, e) {
    const w = parseFloat(e.weight);
    const s = parseFloat(e.sets);
    const r = parseFloat(e.reps);
    return sum + ((isNaN(w) || isNaN(s) || isNaN(r)) ? 0 : w * s * r);
  }, 0);
}

// ── One routine card ──────────────────────────────────────────────
export default function RoutineCard({
  routine,
  open,
  onToggle,
  sessions,
  historyOpen,
  onToggleHistory,
  onDeleteRoutine,
  onAddExercise,
  onUpdateExercise,
  onDeleteExercise,
  onResetSets,
  onLogSession,
  onDeleteSession,
}) {
  const exercises = routine.exercises || [];
  const total = exercises.length;

  // An exercise is "done" when its completed-set count reaches its target.
  const doneCount = exercises.filter(function (e) {
    const target = parseInt(e.sets) || 0;
    return target > 0 && (e.sets_done || 0) >= target;
  }).length;

  const volume = routineVolume(exercises);

  function handleLog() {
    const readout = exercises
      .filter(function (e) { return (e.name || '').trim(); })
      .map(function (e) {
        return { name: e.name, weight: e.weight, sets: e.sets, reps: e.reps, rest: e.rest || '' };
      });
    onLogSession(routine.id, volume, readout);
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead} onClick={function () { onToggle(routine.id); }}>
        <span className={styles.rName}>
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          {routine.name}
        </span>
        <span className={styles.cardMeta}>
          {volume > 0 && (
            <span className={styles.volBadge}>{volume.toLocaleString()} lb vol</span>
          )}
          <span className={styles.doneCount}>{doneCount}/{total} done</span>
          <button
            className={styles.iconBtn}
            onClick={function (e) { e.stopPropagation(); onDeleteRoutine(routine.id); }}
            aria-label="Delete routine"
          >
            <Trash2 size={16} />
          </button>
        </span>
      </div>

      {open && (
        <div className={styles.body}>
          {total > 0 && (
            <div className={styles.exHead}>
              <span>Exercise</span>
              <span>Weight</span>
              <span>Sets</span>
              <span>Reps</span>
              <span>Rest</span>
              <span></span>
            </div>
          )}

          {exercises.map(function (ex) {
            return (
              <ExerciseRow
                key={ex.id}
                exercise={ex}
                routineId={routine.id}
                onUpdate={onUpdateExercise}
                onDelete={onDeleteExercise}
              />
            );
          })}

          <div className={styles.foot}>
            <button className={styles.ghost} onClick={function () { onAddExercise(routine.id); }}>
              <Plus size={14} /> Add exercise
            </button>
            {total > 0 && (
              <button className={styles.ghost} onClick={function () { onResetSets(routine.id); }}>
                <RotateCcw size={13} /> Reset checks
              </button>
            )}
            {total > 0 && (
              <button className={styles.primaryGhost} onClick={handleLog}>
                <Save size={13} /> Log session
              </button>
            )}
            {sessions.length > 0 && (
              <button
                className={styles.ghost}
                onClick={function () { onToggleHistory(routine.id); }}
              >
                <History size={13} /> History ({sessions.length})
              </button>
            )}
          </div>

          {historyOpen && sessions.length > 0 && (
            <div className={styles.histPanel}>
              <div className={styles.histTitle}>Logged sessions</div>
              {sessions.map(function (h) {
                const list = h.exercises || [];
                return (
                  <div key={h.id} className={styles.histRow}>
                    <div className={styles.histTop}>
                      <span>
                        {new Date(h.logged_at).toLocaleDateString(undefined, {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                      <span>
                        <span className={styles.histVolume}>
                          {Number(h.volume).toLocaleString()} lb
                        </span>
                        <button
                          className={styles.histDelete}
                          onClick={function () { onDeleteSession(h.id); }}
                          aria-label="Delete session"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                    <div className={styles.histDetail}>
                      {list.length === 0
                        ? 'No named exercises'
                        : list.map(function (e) {
                            return `${e.name} ${e.weight || '?'}x${e.sets || '?'}x${e.reps || '?'}`;
                          }).join('  ·  ')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
