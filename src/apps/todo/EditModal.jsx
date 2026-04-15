import { useState } from 'react';
import styles from './AddModal.module.css';

export default function EditModal({ task, sections, onSave, onClose }) {
  const [name, setName] = useState(task.name || '');
  const [note, setNote] = useState(task.note || '');
  const [category, setCategory] = useState(task.category || 'Students');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isPersonal = task.tab === 'personal';

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    setError('');

    const result = await onSave(task.id, {
      name: name.trim(),
      note,
      category,
      priority: null
    });

    setSaving(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    onClose();
  }

  return (
    <div className={styles.overlay} onClick={function(e) { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Edit Item</h2>

        <label className={styles.label}>Name / Task</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={function(e) { setName(e.target.value); }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit(); }}
          autoFocus
        />

        <label className={styles.label}>Note (optional)</label>
        <textarea
          className={styles.textarea}
          value={note}
          onChange={function(e) { setNote(e.target.value); }}
          rows={3}
        />

        {!isPersonal && (
          <>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={category}
              onChange={function(e) { setCategory(e.target.value); }}
            >
              <option value="Students">Students</option>
              <option value="Action Items">Action Items</option>
              <option value="Ongoing">Ongoing</option>
            </select>
          </>
        )}

        {isPersonal && (
          <>
            <label className={styles.label}>Section</label>
            <select
              className={styles.select}
              value={category}
              onChange={function(e) { setCategory(e.target.value); }}
            >
              {sections.map(function(s) {
                return <option key={s} value={s}>{s}</option>;
              })}
            </select>
          </>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnAdd} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}