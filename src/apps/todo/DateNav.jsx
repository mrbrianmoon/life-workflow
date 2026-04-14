import styles from './DateNav.module.css';

const DAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday',
                   'Thursday','Friday','Saturday'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DateNav({ selectedDate, onShift }) {
  const label = `${DAYS_FULL[selectedDate.getDay()]} · ${MONTH_SHORT[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;

  return (
    <div className={styles.dateRow}>
      <div className={styles.badge}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="1" y="2" width="12" height="11" rx="2"/>
          <path d="M1 6h12M5 1v2M9 1v2"/>
        </svg>
        <span>{label}</span>
      </div>
      <div className={styles.navPill}>
        <button className={styles.navBtn} onClick={function() { onShift(-1); }}>&#8249;</button>
        <div className={styles.divider} />
        <button className={styles.navBtn} onClick={function() { onShift(1); }}>&#8250;</button>
      </div>
    </div>
  );
}