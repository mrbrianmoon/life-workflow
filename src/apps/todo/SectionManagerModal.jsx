import { useState } from 'react';
import styles from './AddModal.module.css';
import mgr from './SectionManagerModal.module.css';

export default function SectionManagerModal({ sections, onAdd, onRename, onDelete, onClose }) {
  const [newName, setNewName] = useState('');
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    if (sections.includes(name)) { setError('Section already exists'); return; }
    setSaving(true);
    setError('');
    const result = await onAdd(name);
    setSaving(false);
    if (result?.error) { setError(result.error); return; }
    setNewName('');
  }

  async function handleRename(oldName) {
    const input = window.prompt('Rename section:', oldName);
    if (!input) return;
    const newName = input.trim();
    if (!newName || newName === oldName) return;
    if (sections.includes(newName)) { setError('Section already exists'); return; }
    setError('');
    const result = await onRename(oldName, newName);
    if (result?.error) setError(result.error);
  }

  async function handleDelete(name) {
    if (sections.length <= 1) { setError('Must have at least one section'); return; }
    const fallback = sections[0] === name ? sections[1] : sections[0];
    const confirmed = window.confirm(`Delete "${name}"? Tasks will be moved to "${fallback}".`);
    if (!confirmed) return;
    setError('');
    const result = await onDelete(name, fallback);
    if (result?.error) setError(result.error);
  }

  return (
    <div className={styles.overlay} onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Manage Sections</h2>

        <div className={mgr.list}>
          {sections.map(function(s) {
            return (
              <div key={s} className={mgr.item}>
                <span className={mgr.itemName}>{s}</span>
                <button className={mgr.renameBtn} onClick={function() { handleRename(s); }} title="Rename">✎</button>
                <button className={mgr.deleteBtn} onClick={function() { handleDelete(s); }} title="Delete">✕</button>
              </div>
            );
          })}
        </div>

        <div className={mgr.addRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="New section name"
            value={newName}
            onChange={function(e) { setNewName(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleAdd(); }}
            style={{ marginBottom: 0 }}
          />
          <button className={mgr.addBtn} onClick={handleAdd} disabled={saving}>
            {saving ? '…' : 'Add'}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions} style={{ marginTop: '16px' }}>
          <button className={styles.btnCancel} onClick={onClose} style={{ flex: 1 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
