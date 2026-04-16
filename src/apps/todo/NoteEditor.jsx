import { useState, useRef } from 'react';
import styles from './NoteEditor.module.css';

function parseNote(raw) {
  if (!raw) return [{ type: 'plain', text: '', indent: 0, checked: false }];
  const lines = raw.split('\n').map(function(line) {
    let indent = 0;
    let rest = line;
    const spaceMatch = rest.match(/^( +)/);
    if (spaceMatch) {
      indent = Math.min(2, Math.floor(spaceMatch[1].length / 2));
      rest = rest.slice(spaceMatch[1].length);
    }
    if (rest.startsWith('- ')) return { type: 'bullet', text: rest.slice(2), indent, checked: false };
    if (rest.startsWith('[ ] ')) return { type: 'checkbox', text: rest.slice(4), indent, checked: false };
    if (rest.startsWith('[x] ') || rest.startsWith('[X] ')) return { type: 'checkbox', text: rest.slice(4), indent, checked: true };
    return { type: 'plain', text: rest, indent, checked: false };
  });
  if (!lines.length) return [{ type: 'plain', text: '', indent: 0, checked: false }];
  return lines;
}

export function serializeNote(lines) {
  const result = lines.map(function(l) {
    const pad = '  '.repeat(l.indent || 0);
    if (l.type === 'bullet') return pad + '- ' + l.text;
    if (l.type === 'checkbox') return pad + (l.checked ? '[x] ' : '[ ] ') + l.text;
    return pad + l.text;
  }).join('\n');
  const trimmed = result.trimEnd();
  return trimmed === '' ? '' : trimmed;
}

export default function NoteEditor({ initialNote, onChange }) {
  const [lines, setLines] = useState(function() { return parseNote(initialNote); });
  const inputRefs = useRef([]);

  function updateLines(newLines) {
    setLines(newLines);
    onChange(serializeNote(newLines));
  }

  function handleTextChange(index, value) {
    const newLines = lines.map(function(l, i) {
      return i === index ? { ...l, text: value } : l;
    });
    updateLines(newLines);
  }

  function handleCheckToggle(index) {
    const newLines = lines.map(function(l, i) {
      return i === index ? { ...l, checked: !l.checked } : l;
    });
    updateLines(newLines);
  }

  function handleKeyDown(e, index) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const current = lines[index];
      const isEmpty = current.text === '';
      const newType = isEmpty && current.type !== 'plain' ? 'plain' : current.type;
      const newLine = { type: newType, text: '', indent: current.indent, checked: false };
      const newLines = [...lines.slice(0, index + 1), newLine, ...lines.slice(index + 1)];
      updateLines(newLines);
      setTimeout(function() {
        if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
      }, 0);
      return;
    }

    if (e.key === 'Backspace' && lines[index].text === '') {
      if (lines.length <= 1) return;
      e.preventDefault();
      const newLines = lines.filter(function(_, i) { return i !== index; });
      updateLines(newLines);
      setTimeout(function() {
        const prevIndex = Math.max(0, index - 1);
        if (inputRefs.current[prevIndex]) inputRefs.current[prevIndex].focus();
      }, 0);
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const newLines = lines.map(function(l, i) {
        if (i !== index) return l;
        const newIndent = e.shiftKey ? Math.max(0, l.indent - 1) : Math.min(2, l.indent + 1);
        return { ...l, indent: newIndent };
      });
      updateLines(newLines);
      return;
    }
  }

  function toolAction(action) {
    const focused = inputRefs.current.findIndex(function(el) { return el === document.activeElement; });
    const index = focused >= 0 ? focused : lines.length - 1;
    const current = lines[index];

    if (action === 'bullet' || action === 'checkbox') {
      const newLines = lines.map(function(l, i) {
        return i === index ? { ...l, type: action } : l;
      });
      updateLines(newLines);
    } else if (action === 'indent') {
      const newLines = lines.map(function(l, i) {
        return i === index ? { ...l, indent: Math.min(2, l.indent + 1) } : l;
      });
      updateLines(newLines);
    } else if (action === 'outdent') {
      const newLines = lines.map(function(l, i) {
        return i === index ? { ...l, indent: Math.max(0, l.indent - 1) } : l;
      });
      updateLines(newLines);
    }

    setTimeout(function() {
      if (inputRefs.current[index]) inputRefs.current[index].focus();
    }, 0);
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.toolBtn} onClick={function() { toolAction('bullet'); }}>• Bullet</button>
        <button type="button" className={styles.toolBtn} onClick={function() { toolAction('checkbox'); }}>☐ Check</button>
        <div className={styles.toolSep} />
        <button type="button" className={styles.toolBtn} onClick={function() { toolAction('indent'); }}>→ In</button>
        <button type="button" className={styles.toolBtn} onClick={function() { toolAction('outdent'); }}>← Out</button>
      </div>
      <div className={styles.lines}>
        {lines.map(function(line, index) {
          const indentClass = line.indent === 1 ? styles.indent1 : line.indent === 2 ? styles.indent2 : '';
          return (
            <div key={index} className={`${styles.line} ${indentClass}`}>
              {line.type === 'bullet' && (
                <div className={styles.bulletPrefix}>•</div>
              )}
              {line.type === 'checkbox' && (
                <div
                  className={`${styles.cbPrefix} ${line.checked ? styles.cbChecked : ''}`}
                  onClick={function() { handleCheckToggle(index); }}
                />
              )}
              {line.type === 'plain' && (
                <div className={styles.plainPrefix} />
              )}
              <input
                ref={function(el) { inputRefs.current[index] = el; }}
                type="text"
                className={`${styles.lineInput} ${line.type === 'checkbox' && line.checked ? styles.checkedText : ''}`}
                value={line.text}
                onChange={function(e) { handleTextChange(index, e.target.value); }}
                onKeyDown={function(e) { handleKeyDown(e, index); }}
                autoComplete="off"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}