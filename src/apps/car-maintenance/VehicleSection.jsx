import styles from './VehicleSection.module.css';
import { VEHICLE_COLORS } from './carUtils';

const TAG_CLASS = {
  Fusion:    styles.tagFusion,
  Odyssey:   styles.tagOdyssey,
  Silverado: styles.tagSilverado,
  Toro:      styles.tagToro,
};

export default function VehicleSection({ vehicleKey, label, entries, isDropTarget, onDeleteEntry }) {
  const color   = VEHICLE_COLORS[vehicleKey] || '#9fa5ab';
  const count   = entries.length;
  const tagClass = TAG_CLASS[vehicleKey] || '';

  return (
    <div
      id={'cm-section-' + vehicleKey}
      className={`${styles.section}${isDropTarget ? ' ' + styles.dropTarget : ''}`}
      style={{ borderTop: '3px solid ' + color }}
    >
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>{label}</span>
        <div className={styles.headerRight}>
          <span className={`${styles.countTag} ${tagClass}`}>
            {count} {count === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>

      {/* Entries or empty state */}
      {count === 0
        ? (
          <div className={`${styles.empty}${isDropTarget ? ' ' + styles.dropHighlight : ''}`}>
            {isDropTarget ? 'Drop here to log service' : 'No entries yet — hit Add Entry above'}
          </div>
        )
        : entries.map(function (entry) {
            const hasMileage = entry.mileage && entry.mileage !== '—' && entry.mileage !== '';
            return (
              <div className={styles.entry} key={entry.id}>
                <div className={styles.entryTop}>
                  <div className={styles.entryMeta}>
                    {hasMileage && (
                      <span className={styles.entryMileage}>{entry.mileage} mi</span>
                    )}
                    {entry.entry_date && (
                      <span className={styles.entryDate}>{entry.entry_date}</span>
                    )}
                  </div>
                  <div className={styles.entryActions}>
                    <button
                      className={styles.entryActBtn}
                      title="Delete"
                      onClick={function () { onDeleteEntry(entry.id, vehicleKey); }}
                    >✕</button>
                  </div>
                </div>
                {entry.note && <div className={styles.entryNote}>{entry.note}</div>}
              </div>
            );
          })
      }
    </div>
  );
}
