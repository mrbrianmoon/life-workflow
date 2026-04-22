import { useRef, useState } from 'react';
import styles from './ReminderStrip.module.css';
import {
  VEHICLES,
  VEHICLE_COLORS,
  getReminderStatus,
  STATUS_META,
  formatDueParts,
  getVehicleLabel,
} from './carUtils';

export default function ReminderStrip({ reminders, entries, onDelete, onDrop }) {
  const [draggingId, setDraggingId] = useState(null);
  const offsetRef   = useRef({ x: 0, y: 0 });
  const ghostRef    = useRef(null);

  function onMouseDown(e, reminderId) {
    if (e.button !== 0) return;
    e.preventDefault();

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Build ghost
    const ghost = document.createElement('div');
    ghost.className = styles.ghost;
    ghost.innerHTML = card.innerHTML;
    ghost.style.width = rect.width + 'px';
    ghost.style.left  = (e.clientX - offsetRef.current.x) + 'px';
    ghost.style.top   = (e.clientY - offsetRef.current.y) + 'px';

    // Mirror the vehicle color stripe on the ghost
    const reminder = reminders.find(function (r) { return r.id === reminderId; });
    if (reminder) {
      ghost.style.borderTop = '3px solid ' + (VEHICLE_COLORS[reminder.vehicle] || '#9fa5ab');
    }

    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    setDraggingId(reminderId);

    function onMove(ev) {
      ghost.style.left = (ev.clientX - offsetRef.current.x) + 'px';
      ghost.style.top  = (ev.clientY - offsetRef.current.y) + 'px';

      // Highlight drop target via onDrop(vehicleKey | null, false)
      let hit = null;
      VEHICLES.forEach(function (v) {
        const el = document.getElementById('cm-section-' + v.key);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right &&
            ev.clientY >= r.top  && ev.clientY <= r.bottom) {
          hit = v.key;
        }
      });
      onDrop(hit, false); // false = just hovering, update highlight only
    }

    function onUp(ev) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
      ghost.remove();
      ghostRef.current = null;
      setDraggingId(null);
      onDrop(null, false); // clear highlight

      let dropped = null;
      VEHICLES.forEach(function (v) {
        const el = document.getElementById('cm-section-' + v.key);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (ev.clientX >= r.left && ev.clientX <= r.right &&
            ev.clientY >= r.top  && ev.clientY <= r.bottom) {
          dropped = v.key;
        }
      });

      if (dropped) {
        const rem = reminders.find(function (r) { return r.id === reminderId; });
        if (rem) onDrop(dropped, true, rem); // true = confirmed drop
      }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>Upcoming Service</div>
      <div className={styles.strip}>
        {reminders.length === 0
          ? <div className={styles.empty}>No upcoming service reminders</div>
          : reminders.map(function (r) {
              const status   = getReminderStatus(r, entries);
              const meta     = STATUS_META[status];
              const dueParts = formatDueParts(r);
              const vLabel   = getVehicleLabel(r.vehicle);
              const color    = VEHICLE_COLORS[r.vehicle] || '#9fa5ab';

              return (
                <div
                  key={r.id}
                  className={`${styles.card}${draggingId === r.id ? ' ' + styles.dragging : ''}`}
                  style={{ borderTop: '3px solid ' + color }}
                  onMouseDown={function (e) { onMouseDown(e, r.id); }}
                  title="Drag onto a vehicle card to log this service"
                >
                  <button
                    className={styles.deleteBtn}
                    onMouseDown={function (e) { e.stopPropagation(); }}
                    onClick={function () { onDelete(r.id); }}
                    title="Remove reminder"
                  >✕</button>

                  <div className={styles.vehicleName}>{vLabel}</div>
                  <div className={styles.serviceName}>{r.service}</div>

                  <div className={styles.dueRow}>
                    {dueParts.map(function (d, i) {
                      return <span key={i} className={styles.dueBadge}>{d}</span>;
                    })}
                  </div>

                  <span className={`${styles.statusBadge} ${styles[meta.cssClass]}`}>
                    {meta.dot} {meta.text}
                  </span>

                  <div className={styles.dragHint}>drag to log →</div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
