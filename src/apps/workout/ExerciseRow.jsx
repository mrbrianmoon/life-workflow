import { useState, useEffect, useRef } from 'react';
import { Trash2, Check } from 'lucide-react';
import styles from './WorkoutApp.module.css';

// ── One exercise row ──────────────────────────────────────────────
// Text fields (name/weight/sets/reps/rest) edit a LOCAL copy and flush
// to the DB on a short debounce + on blur, so we're not writing a row
// per keystroke. Set chips write immediately — a tap is a deliberate
// discrete action, not a stream of input.
//
// Set tracking is a single integer (sets_done): tapping chip N sets the
// count to N; tapping the highest filled chip steps it back by one.

const DEBOUNCE_MS = 600;

export default function ExerciseRow({ exercise, routineId, onUpdate, onDelete }) {
  // Local mirror of the editable text fields
  const [fields, setFields] = useState({
    name:   exercise.name   || '',
    weight: exercise.weight || '',
    sets:   exercise.sets   || '',
    reps:   exercise.reps   || '',
    rest:   exercise.rest   || '',
  });

  const timer = useRef(null);
  const pending = useRef({});

  // Keep local fields in sync if the exercise changes from outside
  // (e.g. a server resync) — but only when we have no pending edits,
  // so we never clobber what the user is mid-typing.
  useEffect(function () {
    if (Object.keys(pending.current).length > 0) return;
    setFields({
      name:   exercise.name   || '',
      weight: exercise.weight || '',
      sets:   exercise.sets   || '',
      reps:   exercise.reps   || '',
      rest:   exercise.rest   || '',
    });
  }, [exercise.name, exercise.weight, exercise.sets, exercise.reps, exercise.rest]);

  // Clear any pending timer on unmount
  useEffect(function () {
    return function () { if (timer.current) clearTimeout(timer.current); };
  }, []);

  function flush() {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    if (Object.keys(pending.current).length === 0) return;
    const patch = pending.current;
    pending.current = {};
    onUpdate(routineId, exercise.id, patch);
  }

  function handleField(field, value) {
    setFields(function (prev) { return { ...prev, [field]: value }; });
    pending.current = { ...pending.current, [field]: value };

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, DEBOUNCE_MS);
  }

  // ── Set chips (count-based) ─────────────────────────────────────
  const target = parseInt(fields.sets) || 0;
  const done   = exercise.sets_done || 0;

  function handleChip(index) {
    // index is 0-based; chip position is index + 1
    const position = index + 1;
    // Tapping the chip that's currently the "last done" steps back one;
    // tapping any other chip sets the count up to that position.
    const next = (position === done) ? done - 1 : position;
    onUpdate(routineId, exercise.id, { sets_done: next });
  }

  return (
    <div className={styles.exBlock}>
      <div className={styles.exRow}>
        <input
          className={styles.smallInput}
          placeholder="Exercise"
          value={fields.name}
          onChange={function (e) { handleField('name', e.target.value); }}
          onBlur={flush}
        />
        <input
          className={styles.smallInput}
          placeholder="lb"
          value={fields.weight}
          onChange={function (e) { handleField('weight', e.target.value); }}
          onBlur={flush}
        />
        <input
          className={styles.smallInput}
          placeholder="3"
          value={fields.sets}
          onChange={function (e) { handleField('sets', e.target.value); }}
          onBlur={flush}
        />
        <input
          className={styles.smallInput}
          placeholder="8"
          value={fields.reps}
          onChange={function (e) { handleField('reps', e.target.value); }}
          onBlur={flush}
        />
        <input
          className={styles.smallInput}
          placeholder="90s"
          value={fields.rest}
          onChange={function (e) { handleField('rest', e.target.value); }}
          onBlur={flush}
        />
        <button
          className={styles.iconBtn}
          onClick={function () { onDelete(routineId, exercise.id); }}
          aria-label="Delete exercise"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className={styles.setRow}>
        <span className={styles.setLabel}>Sets</span>
        {target === 0 ? (
          <span className={styles.setHint}>Enter a set count to track them</span>
        ) : (
          Array.from({ length: target }, function (_, i) {
            const isDone = i < done;
            return (
              <div
                key={i}
                className={`${styles.setChip}${isDone ? ' ' + styles.setChipDone : ''}`}
                onClick={function () { handleChip(i); }}
                title={`Set ${i + 1}`}
              >
                {isDone ? <Check size={15} /> : i + 1}
              </div>
            );
          })
        )}
        {target > 0 && (
          <span className={`${styles.setCount}${done >= target ? ' ' + styles.setCountDone : ''}`}>
            {Math.min(done, target)}/{target}
          </span>
        )}
        {fields.rest && fields.rest.trim() && (
          <span className={styles.restNote}>Rest {fields.rest.trim()}</span>
        )}
      </div>
    </div>
  );
}
