// ── Vehicle definitions ────────────────────────────────────────────
export const VEHICLES = [
  { key: 'Fusion',    label: '2011 Fusion SE' },
  { key: 'Odyssey',   label: '2025 Odyssey Touring' },
  { key: 'Silverado', label: '1997 Silverado' },
  { key: 'Toro',      label: '1998 Toro T-Bar Mower' },
];

export const VEHICLE_COLORS = {
  Fusion:    '#9b1c1c',
  Odyssey:   '#c8c4bc',
  Silverado: '#1a1a1a',
  Toro:      '#3a6b4a',
};

// ── Reminder status ────────────────────────────────────────────────
// Returns 'overdue' | 'coming-up' | 'scheduled'
export function getReminderStatus(reminder, entries) {
  const now = new Date();

  // Date-based check
  if (reminder.due_month && reminder.due_year) {
    const due  = new Date(parseInt(reminder.due_year), parseInt(reminder.due_month) - 1, 1);
    const diff = (due - now) / 86400000; // days
    if (diff < 0)   return 'overdue';
    if (diff <= 45) return 'coming-up';
  }

  // Mileage-based check against the most recent log entry for that vehicle
  if (reminder.due_mileage) {
    const vehicleEntries = entries[reminder.vehicle] || [];
    const last = vehicleEntries[0]; // already newest-first
    if (last && last.mileage && last.mileage !== '—') {
      const cur = parseInt(last.mileage.replace(/,/g, ''));
      const due = parseInt(reminder.due_mileage.replace(/,/g, ''));
      if (!isNaN(cur) && !isNaN(due)) {
        const diff = due - cur;
        if (diff <= 0)   return 'overdue';
        if (diff <= 500) return 'coming-up';
      }
    }
  }

  return 'scheduled';
}

export const STATUS_META = {
  'scheduled':  { dot: '⚪', text: 'Scheduled',  cssClass: 'scheduled' },
  'coming-up':  { dot: '🟡', text: 'Coming Up',  cssClass: 'comingUp' },
  'overdue':    { dot: '🔴', text: 'Overdue',    cssClass: 'overdue' },
};

// ── Format due date display ────────────────────────────────────────
export function formatDueParts(reminder) {
  const parts = [];
  if (reminder.due_mileage) parts.push(reminder.due_mileage + ' mi');
  if (reminder.due_month && reminder.due_year) {
    parts.push(reminder.due_month + '/' + reminder.due_year);
  }
  return parts;
}

// ── Vehicle label lookup ───────────────────────────────────────────
export function getVehicleLabel(key) {
  const v = VEHICLES.find(function (v) { return v.key === key; });
  return v ? v.label : key;
}
