import { useState } from 'react';
import styles from './DateNav.module.css';

const DAYS_FULL   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_LABELS  = ['S','M','T','W','T','F','S'];

function formatBadge(d) {
  return `${DAYS_FULL[d.getDay()]} · ${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DateNav({ selectedDate, onShift, onPickDate, showPill }) {
  const [calOpen, setCalOpen]   = useState(false);
  const [calYear, setCalYear]   = useState(selectedDate.getFullYear());
  const [calMonth, setCalMonth] = useState(selectedDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function toggleCal() {
    if (!calOpen) {
      setCalYear(selectedDate.getFullYear());
      setCalMonth(selectedDate.getMonth());
    }
    setCalOpen(function(prev) { return !prev; });
  }

  function changeMonth(dir) {
    var next = calMonth + dir;
    if (next > 11) { setCalYear(function(y) { return y + 1; }); setCalMonth(0); return; }
    if (next < 0)  { setCalYear(function(y) { return y - 1; }); setCalMonth(11); return; }
    setCalMonth(next);
  }

  function pickDate(y, m, d) {
    onPickDate(new Date(y, m, d));
    setCalOpen(false);
  }

  function buildCalDays() {
    var days        = [];
    var firstDay    = new Date(calYear, calMonth, 1).getDay();
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    var daysInPrev  = new Date(calYear, calMonth, 0).getDate();

    for (var i = firstDay - 1; i >= 0; i--) {
      days.push({ day: daysInPrev - i, otherMonth: true });
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var thisDate = new Date(calYear, calMonth, d);
      days.push({
        day: d, otherMonth: false,
        isToday:    thisDate.toDateString() === today.toDateString(),
        isSelected: thisDate.toDateString() === selectedDate.toDateString(),
        y: calYear, m: calMonth
      });
    }
    var filled    = firstDay + daysInMonth;
    var remaining = filled % 7 === 0 ? 0 : 7 - (filled % 7);
    for (var r = 1; r <= remaining; r++) {
      days.push({ day: r, otherMonth: true });
    }
    return days;
  }

  var calDays = buildCalDays();

  return (
    <div className={styles.dateRow}>
      <div className={styles.badgeWrap}>
        <button className={styles.badge} onClick={toggleCal}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="1" y="2" width="12" height="11" rx="2"/>
            <path d="M1 6h12M5 1v2M9 1v2"/>
          </svg>
          <span className={styles.badgeText}>{formatBadge(selectedDate)}</span>
        </button>

        {calOpen && (
          <div className={styles.calPopover}>
            <div className={styles.calHeader}>
              <button className={styles.calNav} onClick={function() { changeMonth(-1); }}>&#8249;</button>
              <span className={styles.calMonthLabel}>{MONTH_NAMES[calMonth]} {calYear}</span>
              <button className={styles.calNav} onClick={function() { changeMonth(1); }}>&#8250;</button>
            </div>
            <div className={styles.calGrid}>
              {DAY_LABELS.map(function(l, i) {
                return <div key={i} className={styles.calDayLabel}>{l}</div>;
              })}
              {calDays.map(function(cell, i) {
                var cls = styles.calDay;
                if (cell.otherMonth) cls += ' ' + styles.otherMonth;
                if (cell.isToday)    cls += ' ' + styles.today;
                if (cell.isSelected) cls += ' ' + styles.selected;
                return (
                  <div
                    key={i}
                    className={cls}
                    onClick={cell.otherMonth ? undefined : function() { pickDate(cell.y, cell.m, cell.day); }}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showPill && (
        <div className={styles.navPill}>
          <button className={styles.navBtn} onClick={function() { onShift(-1); }}>&#8249;</button>
          <div className={styles.divider} />
          <button className={styles.navBtn} onClick={function() { onShift(1); }}>&#8250;</button>
        </div>
      )}
    </div>
  );
}
