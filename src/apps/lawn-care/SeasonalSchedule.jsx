import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { CATEGORIES, MONTH_NAMES, INDIANA_TEMPLATE } from './scheduleTemplate';

export default function SeasonalSchedule({ zones }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed
  const [showAddForm, setShowAddForm] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());

  // ── New item form state ──
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newZone, setNewZone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(function () {
    loadSchedule();
  }, [year]);

  async function loadSchedule() {
    setLoading(true);
    const { data, error } = await supabase
      .from('lc_schedule_items')
      .select('*')
      .eq('year', year)
      .order('month_start', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      console.error('Load schedule error:', error);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }

  async function loadTemplate() {
    if (items.length > 0) {
      if (!confirm('This will add the Indiana template items to your schedule. Items you already have won\'t be duplicated. Continue?')) {
        return;
      }
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    // Check which template items already exist (by title + month)
    const existingKeys = new Set(
      items.filter(function (i) { return i.is_template; })
        .map(function (i) { return i.title + ':' + i.month_start; })
    );

    const newItems = INDIANA_TEMPLATE
      .filter(function (t) { return !existingKeys.has(t.title + ':' + t.month_start); })
      .map(function (t, idx) {
        return {
          user_id: authData.user.id,
          title: t.title,
          description: t.description,
          category: t.category,
          month_start: t.month_start,
          month_end: t.month_end || null,
          is_template: true,
          done: false,
          year: year,
          position: idx
        };
      });

    if (newItems.length === 0) {
      alert('Template already loaded — all items exist.');
      return;
    }

    const { error } = await supabase.from('lc_schedule_items').insert(newItems);
    if (error) {
      console.error('Template load error:', error);
      return;
    }

    await loadSchedule();
  }

  async function toggleItem(id, currentDone) {
    const newDone = !currentDone;
    const doneDate = newDone ? formatDate(new Date()) : null;

    // Optimistic UI update
    setItems(function (prev) {
      return prev.map(function (item) {
        if (item.id === id) {
          return { ...item, done: newDone, done_date: doneDate };
        }
        return item;
      });
    });

    await supabase.from('lc_schedule_items')
      .update({ done: newDone, done_date: doneDate })
      .eq('id', id);
  }

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
      zone_id: newZone || null,
      is_template: false,
      done: false,
      year: year,
      position: items.length
    }]);

    if (error) {
      console.error('Add item error:', error);
      setSaving(false);
      return;
    }

    setNewTitle('');
    setNewDesc('');
    setNewCategory('general');
    setNewZone('');
    setShowAddForm(false);
    setSaving(false);
    await loadSchedule();
  }

  async function deleteItem(id) {
    if (!confirm('Delete this schedule item?')) return;
    await supabase.from('lc_schedule_items').delete().eq('id', id);
    setItems(function (prev) { return prev.filter(function (i) { return i.id !== id; }); });
  }

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
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

  // ── Progress for this month ──
  var totalMonth = monthItems.length;
  var doneMonth = completedItems.length;
  var pctMonth = totalMonth > 0 ? Math.round((doneMonth / totalMonth) * 100) : 0;

  // ── Overall year progress ──
  var totalYear = items.length;
  var doneYear = items.filter(function (i) { return i.done; }).length;
  var pctYear = totalYear > 0 ? Math.round((doneYear / totalYear) * 100) : 0;

  if (loading) {
    return <div className="schedule-loading">Loading schedule...</div>;
  }

  return (
    <div className="seasonal-schedule">
      <div className="schedule-top-bar">
        <h3>Seasonal Schedule</h3>
        <div className="schedule-year">
          <button onClick={function () { setYear(year - 1); }}>‹</button>
          <span>{year}</span>
          <button onClick={function () { setYear(year + 1); }}>›</button>
        </div>
      </div>

      {/* Year progress */}
      <div className="year-progress">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pctYear + '%' }}></div>
        </div>
        <span className="progress-text">{doneYear} of {totalYear} tasks complete this year</span>
      </div>

      {/* Template loader */}
      {items.length === 0 && (
        <div className="template-prompt">
          <p>Start with a pre-built Indiana cool-season lawn care calendar?</p>
          <button className="template-btn" onClick={loadTemplate}>
            Load Indiana Template
          </button>
        </div>
      )}

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

      {/* Active items */}
      {activeItems.length === 0 && completedItems.length === 0 && (
        <div className="month-empty">
          No tasks for {MONTH_NAMES[selectedMonth - 1]}.
          {items.length === 0 && ' Load the Indiana template to get started.'}
        </div>
      )}

      {activeItems.map(function (item) {
        var cat = CATEGORIES[item.category] || CATEGORIES.general;
        var zoneName = '';
        if (item.zone_id) {
          var z = zones.find(function (z) { return z.id === item.zone_id; });
          if (z) zoneName = z.name;
        }

        return (
          <div key={item.id} className="schedule-item">
            <div
              className="schedule-checkbox"
              onClick={function () { toggleItem(item.id, item.done); }}
            >
              <div className="schedule-cb-box"></div>
            </div>
            <div className="schedule-body">
              <div className="schedule-title">
                <span className="schedule-cat-icon">{cat.icon}</span>
                {item.title}
                {item.is_template && <span className="template-badge">Template</span>}
                {zoneName && <span className="zone-badge">{zoneName}</span>}
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
                  onClick={function () { toggleItem(item.id, item.done); }}
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
              {zones.length > 0 && (
                <select value={newZone} onChange={function (e) { setNewZone(e.target.value); }}>
                  <option value="">All zones</option>
                  {zones.map(function (z) {
                    return <option key={z.id} value={z.id}>{z.name}</option>;
                  })}
                </select>
              )}
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

      {/* Template button (if items exist but user wants to add template) */}
      {items.length > 0 && (
        <button className="template-btn-small" onClick={loadTemplate}>
          + Load missing template items
        </button>
      )}
    </div>
  );
}
