import { useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { CATEGORIES, MONTH_NAMES } from './scheduleTemplate';

// Props:
//   items           - lc_schedule_items rows (owned by parent LawnCareApp)
//   year            - current year (owned by parent)
//   onToggleItem    - function(id, currentDone) — parent handles DB write + state update
//   onItemsChanged  - function() — parent reloads items after insert/delete
export default function SeasonalSchedule({ items, year, onToggleItem, onItemsChanged }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [saving, setSaving] = useState(false);

  async function addCustomItem() {
    if (!newTitle.trim()) return;
    setSaving(true);

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('lc_schedule_items').insert([{
      user_id: authData.user.id,
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      category: newCategory,
      month_start: selectedMonth,
      gantt_key: null,
      is_template: false,
      done: false,
      year: year,
      position: items.length,
    }]);

    if (error) {
      console.error('Add item error:', error);
      setSaving(false);
      return;
    }

    setNewTitle('');
    setNewDesc('');
    setNewCategory('general');
    setShowAddForm(false);
    setSaving(false);
    onItemsChanged();
  }

  async function deleteItem(id) {
    if (!confirm('Delete this schedule item?')) return;
    await supabase.from('lc_schedule_items').delete().eq('id', id);
    onItemsChanged();
  }

  // ── Filter items for selected month ──
  var monthItems = items.filter(function (item) {
    if (item.month_end) {
      return selectedMonth >= item.month_start && selectedMonth <= item.month_end;
    }
    return item.month_start === selectedMonth;
  });

  var activeItems = monthItems.filter(function (i) { return !i.done; });
  var completedItems = monthItems.filter(function (i) { return i.done; });

  var totalMonth = monthItems.length;
  var doneMonth = completedItems.length;

  var totalYear = items.length;
  var doneYear = items.filter(function (i) { return i.done; }).length;
  var pctYear = totalYear > 0 ? Math.round((doneYear / totalYear) * 100) : 0;

  return (
    <div className="seasonal-schedule">
      <div className="schedule-top-bar">
        <h3>Seasonal Schedule</h3>
      </div>

      {/* Year progress */}
      <div className="year-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pctYear + '%' }}></div>
        </div>
        <span className="progress-text">{doneYear} of {totalYear} tasks complete this year</span>
      </div>

      {/* Month selector */}
      <div className="month-selector">
        {MONTH_NAMES.map(function (name, idx) {
          var monthNum = idx + 1;
          var monthItemCount = items.filter(function (i) {
            if (i.month_end) return monthNum >= i.month_start && monthNum <= i.month_end;
            return i.month_start === monthNum;
          });
          var allDone = monthItemCount.length > 0 && monthItemCount.every(function (i) { return i.done; });
          var hasTasks = monthItemCount.length > 0;
          var isActive = monthNum === selectedMonth;
          var isCurrent = monthNum === (new Date().getMonth() + 1) && year === new Date().getFullYear();

          var classes = 'month-pill';
          if (isActive) classes += ' active';
          if (isCurrent) classes += ' current';
          if (allDone) classes += ' all-done';
          if (!hasTasks) classes += ' empty';

          return (
            <button
              key={monthNum}
              className={classes}
              onClick={function () { setSelectedMonth(monthNum); }}
            >
              {name.slice(0, 3)}
            </button>
          );
        })}
      </div>

      {/* Month header + progress */}
      <div className="month-header">
        <h4>{MONTH_NAMES[selectedMonth - 1]}</h4>
        {totalMonth > 0 && (
          <span className="month-progress">{doneMonth}/{totalMonth} done</span>
        )}
      </div>

      {/* Empty state */}
      {activeItems.length === 0 && completedItems.length === 0 && (
        <div className="month-empty">
          No tasks for {MONTH_NAMES[selectedMonth - 1]}.
        </div>
      )}

      {activeItems.map(function (item) {
        var cat = CATEGORIES[item.category] || CATEGORIES.general;

        return (
          <div key={item.id} className="schedule-item">
            <div
              className="schedule-checkbox"
              onClick={function () { onToggleItem(item.id, item.done); }}
            >
              <div className="schedule-cb-box"></div>
            </div>
            <div className="schedule-body">
              <div className="schedule-title">
                <span className="schedule-cat-icon">{cat.icon}</span>
                {item.title}
                {item.is_template && <span className="template-badge">Template</span>}
              </div>
              {item.description && (
                <div className="schedule-desc">{item.description}</div>
              )}
            </div>
            <button
              className="schedule-delete"
              onClick={function () { deleteItem(item.id); }}
              title="Delete"
            >
              ✕
            </button>
          </div>
        );
      })}

      {/* Completed items */}
      {completedItems.length > 0 && (
        <>
          <div className="completed-divider">Completed</div>
          {completedItems.map(function (item) {
            var cat = CATEGORIES[item.category] || CATEGORIES.general;
            return (
              <div key={item.id} className="schedule-item done">
                <div
                  className="schedule-checkbox checked"
                  onClick={function () { onToggleItem(item.id, item.done); }}
                >
                  <div className="schedule-cb-box">
                    <svg width="10" height="8" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="schedule-body">
                  <div className="schedule-title">
                    <span className="schedule-cat-icon">{cat.icon}</span>
                    {item.title}
                  </div>
                  {item.done_date && (
                    <div className="schedule-done-date">Completed {item.done_date}</div>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Add custom item */}
      <div className="add-item-section">
        {showAddForm ? (
          <div className="add-item-form">
            <input
              type="text"
              placeholder="Task title"
              value={newTitle}
              onChange={function (e) { setNewTitle(e.target.value); }}
              onKeyDown={function (e) { if (e.key === 'Enter') addCustomItem(); }}
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={function (e) { setNewDesc(e.target.value); }}
              rows={2}
            />
            <div className="add-item-row">
              <select value={newCategory} onChange={function (e) { setNewCategory(e.target.value); }}>
                {Object.entries(CATEGORIES).map(function ([key, val]) {
                  return <option key={key} value={key}>{val.icon} {val.label}</option>;
                })}
              </select>
            </div>
            <div className="add-item-actions">
              <button onClick={function () { setShowAddForm(false); }}>Cancel</button>
              <button className="save-btn" onClick={addCustomItem} disabled={saving}>
                {saving ? 'Saving...' : 'Add Task'}
              </button>
            </div>
          </div>
        ) : (
          <button className="add-item-btn" onClick={function () { setShowAddForm(true); }}>
            + Add Custom Task for {MONTH_NAMES[selectedMonth - 1]}
          </button>
        )}
      </div>
    </div>
  );
}