import { CATEGORIES } from './scheduleTemplate';
import styles from './DetailPanel.module.css';

// props:
//   activeKey     - currently selected gantt_key string
//   title         - bar detail title
//   body          - bar detail description
//   linkedItems   - lc_schedule_items rows where gantt_key === activeKey
//   onToggleItem  - function(id, currentDone)
//   onClose       - function()
export default function DetailPanel({ activeKey, title, body, linkedItems, onToggleItem, onClose }) {
  if (!activeKey) return null;

  var total = linkedItems.length;
  var doneCount = linkedItems.filter(function (i) { return i.done; }).length;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button className={styles.closeBtn} onClick={onClose} title="Close">✕</button>
      </div>

      <p className={styles.body}>{body}</p>

      <div className={styles.divider}></div>

      <div className={styles.tasksSection}>
        <div className={styles.tasksHeader}>
          <span className={styles.tasksLabel}>Linked tasks</span>
          {total > 0 && (
            <span className={styles.tasksCount}>{doneCount} of {total} done</span>
          )}
        </div>

        {total === 0 ? (
          <p className={styles.noTasks}>
            No tasks linked to this bar yet. Load the Indiana template or add a custom task for this month.
          </p>
        ) : (
          <div className={styles.taskList}>
            {linkedItems.map(function (item) {
              var cat = CATEGORIES[item.category] || CATEGORIES.general;
              return (
                <div
                  key={item.id}
                  className={item.done ? styles.taskItem + ' ' + styles.taskItemDone : styles.taskItem}
                  onClick={function () { onToggleItem(item.id, item.done); }}
                >
                  <div className={item.done ? styles.checkbox + ' ' + styles.checkboxDone : styles.checkbox}>
                    {item.done && (
                      <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2"
                              strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={styles.taskIcon}>{cat.icon}</span>
                  <span className={styles.taskTitle}>{item.title}</span>
                  {item.done && item.done_date && (
                    <span className={styles.doneDate}>{item.done_date}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
