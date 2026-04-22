import { useState, useEffect } from 'react';
import styles from './EntryModal.module.css';
import { VEHICLES } from './carUtils';

export default function EntryModal({ initialVehicle, initialNote, isLogService, onSave, onClose }) {
  const [vehicle,     setVehicle]     = useState(initialVehicle || 'Fusion');
  const [mileage,     setMileage]     = useState('');
  const [month,       setMonth]       = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [year,        setYear]        = useState(String(new Date().getFullYear()));
  const [note,        setNote]        = useState(initialNote || '');
  const [nextService, setNextService] = useState('');
  const [nextMileage, setNextMileage] = useState('');
  const [nextMonth,   setNextMonth]   = useState('');
  const [nextYear,    setNextYear]    = useState('');
  const [error,       setError]       = useState('');

  // If opened from a drag-to-log, sync the vehicle pill to initialVehicle
  useEffect(function () {
    if (initialVehicle) setVehicle(initialVehicle);
    if (initialNote)    setNote(initialNote);
  }, [initialVehicle, initialNote]);

  function getPillClass(key) {
    const base = styles.pill;
    const colorClass = styles['pill' + key]; // e.g. styles.pillFusion
    const activeClass = vehicle === key ? styles.pillActive : '';
    return [base, colorClass, activeClass].filter(Boolean).join(' ');
  }

  function handleSave() {
    if (!note.trim()) {
      setError('Notes are required.');
      return;
    }
    setError('');

    const entryDate = (month && year) ? month.padStart(2, '0') + '/' + year : (year || '');

    const reminder = nextService.trim()
      ? {
          vehicle,
          service:     nextService.trim(),
          due_mileage: nextMileage.trim(),
          due_month:   nextMonth.trim().padStart(2, '0'),
          due_year:    nextYear.trim(),
        }
      : null;

    onSave({ vehicle, mileage: mileage.trim(), entryDate, note: note.trim() }, reminder);
  }

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2>{isLogService ? 'Log Service' : 'Add Entry'}</h2>

        {/* Vehicle */}
        <label>Vehicle</label>
        <div className={styles.vehiclePills}>
          {VEHICLES.map(function ({ key, label }) {
            return (
              <button
                key={key}
                className={getPillClass(key)}
                onClick={function () { setVehicle(key); }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Mileage + Date */}
        <div className={styles.row2}>
          <div>
            <label>Mileage</label>
            <input
              type="text"
              placeholder="e.g. 89,000"
              value={mileage}
              onChange={function (e) { setMileage(e.target.value); }}
            />
          </div>
          <div>
            <label>Date</label>
            <div className={styles.dateInputs}>
              <input
                type="text"
                className={styles.mmInput}
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={function (e) { setMonth(e.target.value); }}
              />
              <input
                type="text"
                className={styles.yyyyInput}
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={function (e) { setYear(e.target.value); }}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <label>Notes</label>
        <textarea
          value={note}
          onChange={function (e) { setNote(e.target.value); }}
          onKeyDown={function (e) { if (e.key === 'Enter' && e.metaKey) handleSave(); }}
        />

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* ── Next Service ── */}
        <hr className={styles.nextDivider} />
        <div className={styles.nextHeading}>
          Schedule Next Service <em>optional</em>
        </div>

        <label>Service Name</label>
        <input
          type="text"
          placeholder="e.g. Oil Change"
          value={nextService}
          onChange={function (e) { setNextService(e.target.value); }}
        />

        <div className={styles.row2}>
          <div>
            <label>Due Mileage</label>
            <input
              type="text"
              placeholder="e.g. 94,000"
              value={nextMileage}
              onChange={function (e) { setNextMileage(e.target.value); }}
            />
          </div>
          <div>
            <label>Due Date</label>
            <div className={styles.dateInputs}>
              <input
                type="text"
                className={styles.mmInput}
                placeholder="MM"
                maxLength={2}
                value={nextMonth}
                onChange={function (e) { setNextMonth(e.target.value); }}
              />
              <input
                type="text"
                className={styles.yyyyInput}
                placeholder="YYYY"
                maxLength={4}
                value={nextYear}
                onChange={function (e) { setNextYear(e.target.value); }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnSave}   onClick={handleSave}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}
