import styles from './TaskCard.module.css';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseNote(raw) {
  if (!raw) return [];
  return raw.split('\n').map(function(line) {
    let indent = 0;
    let rest = line;
    const spaceMatch = rest.match(/^( +)/);
    if (spaceMatch) {
      indent = Math.min(2, Math.floor(spaceMatch[1].length / 2));
      rest = rest.slice(spaceMatch[1].length);
    }
    if (rest.startsWith('- ')) return { type: 'bullet', text: rest.slice(2), indent };
    if (rest.startsWith('[ ] ')) return { type: 'checkbox', checked: false, text: rest.slice(4), indent };
    if (rest.startsWith('[x] ') || rest.startsWith('[X] ')) return { type: 'checkbox', checked: true, text: rest.slice(4), indent };
    return { type: 'plain', text: rest, indent };
  });
}

function NoteDisplay({ note, taskId, onSubtaskToggle }) {
  const lines = parseNote(note);
  if (!lines.length || (lines.length === 1 && lines[0].text === '')) return null;

  return (
    <div className={styles.noteSub}>
      {lines.map(function(line, i) {
        const indentClass = line.indent === 1 ? styles.indent1 : line.indent === 2 ? styles.indent2 : '';
        if (line.type === 'bullet') {
          return (
            <div key={i} className={`${styles.noteLine} ${styles.noteBullet} ${indentClass}`}>
              <span>{escapeHtml(line.text)}</span>
            </div>
          );
        }
        
        if (line.type === 'checkbox') {
          return (
            <div key={i} className={`${styles.noteLine} ${indentClass}`}>
         <button
              type="button"
              className={`${styles.noteCb} ${line.checked ? styles.noteCbChecked : ''}`}
               data-nocb="1"
               style={{ cursor: 'pointer' }}
           onClick={function(e) {
                e.stopPropagation();
          if (onSubtaskToggle) onSubtaskToggle(taskId, i);
  }}
>
  {line.checked && (
    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )}
              </button>
              <span className={line.checked ? styles.noteCbTextChecked : ''}>
                {escapeHtml(line.text)}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className={`${styles.noteLine} ${indentClass}`}>
            <span>{escapeHtml(line.text)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TaskCard({ task, onToggle, onEdit, onDelete, onForward, onSubtaskToggle }) {
  const fwdCount = task.fwd_count || 0;
  const showForward = onForward && task.tab !== 'personal' && task.category !== 'Ongoing';

  return (
    <div className={`${styles.task} ${task.done ? styles.done : ''}`}>
      <div
        className={`${styles.checkbox} ${task.done ? styles.checkboxDone : ''}`}
        onClick={function() { onToggle(task.id); }}
      >
        {task.done && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className={styles.taskBody}>
        <div className={`${styles.taskTitle} ${task.done ? styles.taskTitleDone : ''}`}>
          {task.name}
          {fwdCount > 0 && (
            <span className={styles.fwdBadge}>↪ Forwarded x{fwdCount}</span>
          )}
        </div>
        <NoteDisplay note={task.note} taskId={task.id} onSubtaskToggle={onSubtaskToggle} />
        <div className={styles.taskMeta}>
          Added {task.origin_date || ''}
          {task.completed_date ? ` · Completed ${task.completed_date}` : ''}
        </div>
      </div>
      <div className={styles.taskActions}>
        <button className={styles.editBtn} onClick={function() { onEdit(task); }} title="Edit">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"/>
          </svg>
        </button>
        {showForward && (
          <button className={styles.forwardBtn} onClick={function() { onForward(task.id); }} title="Forward to tomorrow">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4"/>
            </svg>
          </button>
        )}
        <button className={styles.deleteBtn} onClick={function() { onDelete(task.id); }} title="Remove">✕</button>
      
      </div>
      
    </div>
  );
}