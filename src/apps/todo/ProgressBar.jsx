import styles from './ProgressBar.module.css';

export default function ProgressBar({ plan }) {
  const taskItems = plan.filter(function(item) { return item.type === 'task'; });
  const total = taskItems.length;
  const done  = taskItems.filter(function(item) { return item.row.done; }).length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className={styles.wrap}>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: pct + '%' }} />
      </div>
      <div className={styles.label}>
        {total ? `${done} of ${total} complete` : '0 of 0 complete'}
      </div>
    </div>
  );
}
