import styles from './TabBar.module.css';

export default function TabBar({ activeTab, onSwitch }) {
  return (
    <div className={styles.tabBar}>
      <button
        className={`${styles.tabBtn} ${activeTab === 'work' ? styles.active : ''}`}
        onClick={function() { onSwitch('work'); }}
      >
        Work
      </button>
      <button
        className={`${styles.tabBtn} ${activeTab === 'personal' ? styles.active : ''}`}
        onClick={function() { onSwitch('personal'); }}
      >
        Personal
      </button>
    </div>
  );
}