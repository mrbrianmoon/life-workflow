import { useState, useEffect } from 'react';
import { supabase } from '../../shared/supabaseClient';
import { lawnTasks, lawnSeasons } from './ganttData';
import GanttGrid from './GanttGrid';
import DetailPanel from './DetailPanel';
import SeasonCards from './SeasonCards';
import SeasonalSchedule from './SeasonalSchedule';
import ArborvitaeTab from './ArborvitaeTab';
import './LawnCareApp.css';

export default function LawnCareApp() {
  const [activeTab, setActiveTab] = useState('lawn');
  const [items, setItems] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(null);

  // Gantt detail panel state (lawn tab only)
  const [activeDetail, setActiveDetail] = useState(null);
  // activeDetail: { key, title, body } | null

  useEffect(function () {
    checkAuthAndLoad();
  }, []);

  useEffect(function () {
    if (authenticated) {
      loadItems();
    }
  }, [year, authenticated]);

  async function checkAuthAndLoad() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    await loadItems();
    setLoading(false);
  }

  async function loadItems() {
    const { data, error } = await supabase
      .from('lc_schedule_items')
      .select('*')
      .eq('year', year)
      .order('month_start', { ascending: true })
      .order('position', { ascending: true });

    if (error) {
      console.error('Load items error:', error);
      return;
    }

    var all = data || [];
    setItems(all);
  }

  function formatDate(d) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  // ── Toggle a task item (shared between SeasonalSchedule and DetailPanel) ──
  async function handleToggleItem(id, currentDone) {
    var newDone = !currentDone;
    var doneDate = newDone ? formatDate(new Date()) : null;

    // Optimistic update
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

  // ── Compute completions map for Gantt ──
  // Returns: gantt_key → { total: N, done: N }
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

  // ── Gantt bar click ──
  function handleBarClick(key, title, body) {
    if (activeDetail && activeDetail.key === key) {
      setActiveDetail(null);
    } else {
      setActiveDetail({ key, title, body });
    }
  }

  if (loading) {
    return <div className="lawn-care"><p className="loading-msg">Loading...</p></div>;
  }

  if (authenticated === false) {
    return (
      <div className="lawn-care">
        <h1>Lawn Care</h1>
        <div className="auth-notice">
          <p>Sign in to access your lawn care schedule.</p>
        </div>
      </div>
    );
  }

  // Only lawn items feed the Gantt (tree items use ArborvitaeTab's own completions)
  var lawnItems = items.filter(function (i) {
    return !i.gantt_key || !i.gantt_key.startsWith('tree:');
  });
  var treeItems = items.filter(function (i) {
    return i.gantt_key && i.gantt_key.startsWith('tree:');
  });
  var completions = buildCompletions(lawnItems);

  var linkedItems = activeDetail
    ? lawnItems.filter(function (i) { return i.gantt_key === activeDetail.key; })
    : [];

  return (
    <div className="lawn-care">
      {/* ── Inner tab bar: Lawn | Arborvitae ── */}
      <div className="lawn-tab-bar">
        <button
          className={'lawn-tab-btn' + (activeTab === 'lawn' ? ' active' : '')}
          onClick={function () { setActiveTab('lawn'); }}
        >
          Lawn
        </button>
        <button
          className={'lawn-tab-btn' + (activeTab === 'arborvitae' ? ' active arborvitae' : '')}
          onClick={function () { setActiveTab('arborvitae'); }}
        >
          Arborvitae
        </button>
      </div>

      {/* ── Lawn tab ── */}
      {activeTab === 'lawn' && (
        <div className="lawn-tab-content">
          <h1>Lawn Care</h1>
          <p className="lawn-subtitle">Central Indiana · Cool-season turf · Zone 6a/6b</p>

          {/* Year navigation */}
          <div className="year-nav">
            <button onClick={function () { setYear(year - 1); }}>‹</button>
            <span>{year}</span>
            <button onClick={function () { setYear(year + 1); }}>›</button>
          </div>

          {/* Gantt grid */}
          <div className="section-label-lc">Annual schedule — click any bar for details</div>
          <GanttGrid
            tasks={lawnTasks}
            completions={completions}
            onBarClick={handleBarClick}
            activeKey={activeDetail ? activeDetail.key : null}
            panel="lawn"
          />

          {/* Detail panel — inline below Gantt */}
          {activeDetail && (
            <DetailPanel
              activeKey={activeDetail.key}
              title={activeDetail.title}
              body={activeDetail.body}
              linkedItems={linkedItems}
              onToggleItem={handleToggleItem}
              onClose={function () { setActiveDetail(null); }}
            />
          )}

          {/* Task list */}
          <SeasonalSchedule
            items={lawnItems}
            year={year}
            onToggleItem={handleToggleItem}
            onItemsChanged={loadItems}
          />

          {/* Season cards */}
          <div className="section-label-lc" style={{ marginTop: '2rem' }}>Key actions by season</div>
          <SeasonCards seasons={lawnSeasons} />
        </div>
      )}

      {/* ── Arborvitae tab ── */}
      {activeTab === 'arborvitae' && (
        <div className="lawn-tab-content">
          <ArborvitaeTab
            items={treeItems}
            year={year}
            onToggleItem={handleToggleItem}
            onItemsChanged={loadItems}
          />
        </div>
      )}
    </div>
  );
}
