import { useState } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { CATEGORIES, MONTH_NAMES, ARBORVITAE_TEMPLATE } from './scheduleTemplate';
import { treeTasks, treeSeasons } from './ganttData';
import GanttGrid from './GanttGrid';
import DetailPanel from './DetailPanel';
import SeasonCards from './SeasonCards';
import styles from './ArborvitaeTab.module.css';

// props:
//   items         - lc_schedule_items rows with tree: gantt_key prefix
//   year          - current year (owned by parent)
//   onToggleItem  - function(id, currentDone)
//   onItemsChanged - function() — parent reloads after insert/delete
export default function ArborvitaeTab({ items, year, onToggleItem, onItemsChanged }) {
  const [activeDetail, setActiveDetail] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('watering');
  const [saving, setSaving] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Build completions map: gantt_key → { total, done }
  function buildCompletions(rows) {
    var map = {};
    rows.forEach(function (row) {
      if (!row.gantt_key) return;
      if (!map[row.gantt_key]) {
        map[row.gantt_key] = { total: 0, done: 0 };
      }
      map[row.gantt_key].total += 1;
      if (row.done) map[row.gantt_key].done += 1;
    });
    return map;
  }

  var completions = buildCompletions(items);

  function handleBarClick(key, title, body) {
    if (activeDetail && activeDetail.key === key) {
      setActiveDetail(null);
    } else {
      setActiveDetail({ key, title, body });
    }
  }

  async function loadTemplate() {
    if (loadingTemplate) return;
    if (items.length > 0) {
      if (!confirm('This will add the arborvitae template items to your schedule. Items you already have won\'t be duplicated. Continue?')) {
        return;
      }
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    // Deduplicate: prefer gantt_key match, fall back to title + month_start
    const existingGanttKeys = new Set(
      items.filter(function (i) { return i.gantt_key; })
        .map(function (i) { return i.gantt_key; })
    );
    const existingTitleKeys = new Set(
      items.map(function (i) { return i.title + ':' + i.month_start; })
    );

    const newItems = ARBORVITAE_TEMPLATE
      .filter(function (t) {
        if (t.gantt_key) return !existingGanttKeys.has(t.gantt_key);
        return !existingTitleKeys.has(t.title + ':' + t.month_start);
      })
      .map(function (t, idx) {
        return {
          user_id: authData.user.id,
          title: t.title,
          description: t.description,
          category: t.category,
          month_start: t.month_start,
          month_end: t.month_end || null,
          gantt_key: t.gantt_key,
          is_template: true,
          done: false,
          year: year,
          position: idx,
        };
      });

    if (newItems.length === 0) {
      alert('Template already loaded — all items exist.');
      return;
    }

    setLoadingTemplate(true);
    const { error } = await supabase.from('lc_schedule_items').insert(newItems);
    setLoadingTemplate(false);

    if (error) {
      console.error('Arborvitae template load error:', error);
      return;
    }

    onItemsChanged();
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
    setNewCategory('watering');
    setShowAddForm(false);
    setSaving(false);
    onItemsChanged();
  }

  async function deleteItem(id) {
    if (!confirm('Delete this schedule item?')) return;
    await supabase.from('lc_schedule_items').delete().eq('id', id);
    onItemsChanged();
  }

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  // Filter items for the selected month
  var monthItems = items.filter(function (item) {
    if (item.month_end) {
      return selectedMonth >= item.month_start && selectedMonth <= item.month_end;
    }
    return item.month_start === selectedMonth;
  });

  var activeItems = monthItems.filter(function (i) { return !i.done; });
  var completedItems = monthItems.filter(function (i) { return i.done; });

  var totalYear = items.length;
  var doneYear = items.filter(function (i) { return i.done; }).length;
  var pctYear = totalYear > 0 ? Math.round((doneYear / totalYear) * 100) : 0;

  var linkedItems = activeDetail
    ? items.filter(function (i) { return i.gantt_key === activeDetail.key; })
    : [];

  return (
    <div className={styles.tab}>
      <h1 className={styles.heading}>Arborvitae Care</h1>
      <p className={styles.sub}>10 Giant Arborvitae (Thuja plicata) — year 2 establishment, central Indiana</p>

      {/* Gantt */}
      <div className={styles.sectionLabel}>Annual schedule — click any bar for details</div>
      <GanttGrid
        tasks={treeTasks}
        completions={completions}
        onBarClick={handleBarClick}
        activeKey={activeDetail ? activeDetail.key : null}
        panel="tree"
      />

      {activeDetail && (
        <DetailPanel
          activeKey={activeDetail.key}
          title={activeDetail.title}
          body={activeDetail.body}
          linkedItems={linkedItems}
          onToggleItem={onToggleItem}
          onClose={function () { setActiveDetail(null); }}
        />
      )}

      {/* Year progress */}
      <div className="year-progress" style={{ marginTop: '24px' }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pctYear + '%' }}></div>
        </div>
        <span className="progress-text">{doneYear} of {totalYear} tasks complete this year</span>
      </div>

      {/* Template loader */}
      {items.length === 0 && !loadingTemplate && (
        <div className="template-prompt">
          <p>Start with a pre-built arborvitae care calendar for central Indiana?</p>
          <button className="template-btn" onClick={loadTemplate} disabled={loadingTemplate}>
            {loadingTemplate ? 'Loading...' : 'Load Arborvitae Template'}
          </button>
        </div>
      )}
      {loadingTemplate && <p className="loading-msg">Loading template...</p>}

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

      {/* Month header */}
      <div className="month-header">
        <h4>{MONTH_NAMES[selectedMonth - 1]}</h4>
        {monthItems.length > 0 && (
          <span className="month-progress">
            {completedItems.length}/{monthItems.length} done
          </span>
        )}
      </div>

      {/* Active items */}
      {activeItems.length === 0 && completedItems.length === 0 && (
        <div className="month-empty">
          No tasks for {MONTH_NAMES[selectedMonth - 1]}.
          {items.length === 0 && ' Load the arborvitae template to get started.'}
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

      {items.length > 0 && (
        <button className="template-btn-small" onClick={loadTemplate}>
          + Load missing template items
        </button>
      )}

      {/* Season cards */}
      <div className={styles.sectionLabel} style={{ marginTop: '2rem' }}>Key actions by season</div>
      <SeasonCards seasons={treeSeasons} />
    </div>
  );
}
