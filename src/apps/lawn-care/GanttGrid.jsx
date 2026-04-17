import { makeGanttKey, GANTT_MONTHS } from './ganttData';
import styles from './GanttGrid.module.css';

// completions: Map of gantt_key → { total: number, done: number }
// onBarClick: function(ganttKey, title, body)
// activeKey: currently open bar key (for highlight)
export default function GanttGrid({ tasks, completions, onBarClick, activeKey, panel }) {
  return (
    <div className={styles.grid}>
      {/* Month header row */}
      <div className={styles.headerRow}>
        <div className={styles.labelCell}></div>
        {GANTT_MONTHS.map(function (m) {
          return (
            <div key={m} className={styles.monthLabel}>{m}</div>
          );
        })}
      </div>

      {/* Task rows */}
      {tasks.map(function (task) {
        return (
          <div key={task.label} className={styles.taskRow}>
            <div className={styles.taskLabel} title={task.label}>
              {task.label}
            </div>
            {GANTT_MONTHS.map(function (m, monthIndex) {
              const isActive = task.active.includes(monthIndex);
              const hasDetail = isActive && task.details[monthIndex];
              const key = hasDetail ? makeGanttKey(panel, task.label, monthIndex) : null;
              const completion = key ? completions[key] : null;
              const isDone = completion && completion.total > 0 && completion.done === completion.total;
              const isOpen = key && key === activeKey;

              var barClass = styles.bar;
              if (isActive) barClass += ' ' + styles.barOn;
              if (isDone) barClass += ' ' + styles.barDone;
              if (isOpen) barClass += ' ' + styles.barOpen;

              return (
                <div
                  key={monthIndex}
                  className={barClass}
                  style={isActive ? { background: task.color } : undefined}
                  onClick={hasDetail ? function () {
                    onBarClick(key, task.details[monthIndex].title, task.details[monthIndex].body);
                  } : undefined}
                  title={hasDetail ? task.details[monthIndex].title : undefined}
                >
                  {isDone && <span className={styles.checkmark}>✓</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
