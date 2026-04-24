import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';
import LoginScreen from '../todo/LoginScreen';
import styles from './CarApp.module.css';
import { VEHICLES } from './carUtils';
import { useCarEntries }   from './useCarEntries';
import { useCarReminders } from './useCarReminders';
import ReminderStrip  from './ReminderStrip';
import VehicleSection from './VehicleSection';
import EntryModal     from './EntryModal';

// ── Auth shell ────────────────────────────────────────────────────
// Matches the null/false/true pattern from TodoApp

export default function CarApp() {
  const [authReady, setAuthReady] = useState(null); // null=checking, false=login, true=app

  useEffect(function () {
    supabase.auth.getSession().then(function ({ data: { session } }) {
      setAuthReady(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(function (_event, session) {
      setAuthReady(!!session);
    });

    return function () { subscription.unsubscribe(); };
  }, []);

  if (authReady === null) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      </div>
    );
  }

  if (authReady === false) {
    return <LoginScreen onLogin={function () { setAuthReady(true); }} />;
  }

  return <CarAppInner />;
}

// ── Inner app (only mounts when authenticated) ────────────────────
function CarAppInner() {
  const [userId,       setUserId]       = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  
  useEffect(function () {
    supabase.auth.getUser().then(function ({ data: { user } }) {
      if (user) setUserId(user.id);
    });
  }, []);

  const {
    entries, loading: entriesLoading, error: entriesError,
    addEntry, updateEntry, deleteEntry,
  } = useCarEntries(userId);

  const {
    reminders, loading: remindersLoading, error: remindersError,
    addReminder, deleteReminder,
  } = useCarReminders(userId);

  // Modal state
  const [showModal,   setShowModal]   = useState(false);
  const [modalVehicle, setModalVehicle] = useState('Fusion');
  const [modalNote,    setModalNote]    = useState('');
  const [isLogService, setIsLogService] = useState(false);
  const [fromRemId,    setFromRemId]    = useState(null);
  const [modalMileage, setModalMileage] = useState('');
  const [modalMonth,   setModalMonth]   = useState('');
  const [modalYear,    setModalYear]    = useState('');

  // Drag drop highlight
  const [dropTarget, setDropTarget] = useState(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState('');
  const [isError,   setIsError]   = useState(false);

  function showStatus(msg, err) {
    setStatusMsg(msg);
    setIsError(!!err);
    setTimeout(function () { setStatusMsg(''); }, 2500);
  }

  function handleEditEntry(entry, vehicleKey) {
    const [entryMonth, entryYear] = (entry.entry_date || '').split('/');
    setModalVehicle(entry.vehicle || vehicleKey);
    setModalNote(entry.note || '');
    setModalMileage(entry.mileage || '');
    setModalMonth(entryMonth || '');
    setModalYear(entryYear || '');
    setIsLogService(false);
    setFromRemId(null);
    setEditingEntry(entry);
    setShowModal(true);
  }

  // ── Open modal from Add button ─────────────────────────────────
  function openAddModal() {
    setModalVehicle('Fusion');
    setModalNote('');
    setIsLogService(false);
    setFromRemId(null);
    setShowModal(true);
  }

  // ── Handle reminder drop onto a vehicle section ────────────────
  function handleDrop(vehicleKey, isConfirmed, reminder) {
    if (!isConfirmed) {
      // Just hovering — update highlight
      setDropTarget(vehicleKey);
      return;
    }

    // Confirmed drop — open modal pre-filled with reminder's vehicle + service name
    setDropTarget(null);
    setModalVehicle(reminder.vehicle);
    setModalNote(reminder.service);
    setIsLogService(true);
    setFromRemId(reminder.id);
    setShowModal(true);
  }

  // ── Save from modal ────────────────────────────────────────────
  async function handleSave(entryData, reminderData) {
    setShowModal(false);

    const { vehicle, mileage, entryDate, note } = entryData;

    if (editingEntry) {
      const { error } = await updateEntry(editingEntry.id, editingEntry.vehicle, mileage, entryDate, note);
      if (error) showStatus('Failed to update entry', true);
      else showStatus('✓ Updated');
      setEditingEntry(null);
      return;
    }

    const { error } = await addEntry(vehicle, mileage, entryDate, note);
    if (error) { showStatus('Failed to save entry', true); return; }

    if (reminderData) {
      const { error: remErr } = await addReminder(
        vehicle,
        reminderData.service,
        reminderData.due_mileage,
        reminderData.due_month,
        reminderData.due_year
      );
      if (remErr) showStatus('Entry saved but reminder failed', true);
    }

    if (fromRemId !== null) {
      await deleteReminder(fromRemId);
      setFromRemId(null);
    }

    showStatus('✓ Saved');
  }

  async function handleDeleteEntry(id, vehicle) {
    const { error } = await deleteEntry(id, vehicle);
    if (error) showStatus('Failed to delete entry', true);
  }

  async function handleDeleteReminder(id) {
    const { error } = await deleteReminder(id);
    if (error) showStatus('Failed to delete reminder', true);
  }

  const loading = entriesLoading || remindersLoading;
  const error   = entriesError   || remindersError;

  if (loading) {
    return (
      <div className={styles.root}>
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      </div>
    );
  }

  return (
    <div className={styles.root}>

      {/* Header */}
      <div className={styles.header}>
        <h1>Car Maintenance</h1>
        <p>Service history &amp; upcoming reminders across all vehicles</p>
      </div>

      {/* Status bar */}
      <div className={`${styles.statusBar}${isError ? ' ' + styles.error : ''}`}>
        {error ? '✕ ' + error : statusMsg}
      </div>

      {/* Reminder strip */}
      <div className={styles.reminderWrap}>
        <ReminderStrip
          reminders={reminders}
          entries={entries}
          onDelete={handleDeleteReminder}
          onDrop={handleDrop}
        />
      </div>

      {/* Add pill */}
      <div className={styles.addPillWrap}>
        <button className={styles.addPill} onClick={openAddModal}>
          <span className={styles.plus}>+</span>
          Add Entry
        </button>
      </div>

      {/* Quadrant grid */}
      <div className={styles.grid}>
        {VEHICLES.map(function ({ key, label }) {
          return (
            <VehicleSection
              key={key}
              vehicleKey={key}
              label={label}
              entries={entries[key] || []}
              isDropTarget={dropTarget === key}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={handleEditEntry}
            />
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
      <EntryModal
      initialVehicle={modalVehicle}
      initialNote={modalNote}
      initialMileage={modalMileage}
      initialMonth={modalMonth}
      initialYear={modalYear}
      isLogService={isLogService}
      onSave={handleSave}
      onClose={function () { setShowModal(false); setFromRemId(null); setEditingEntry(null); }}
    />
      )}
    </div>
  );
}
