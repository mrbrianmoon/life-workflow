import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { supabase } from '../../shared/supabaseClient.js';
import { useTasks, formatShortDate } from './useTasks.js';
import { usePersonalSections } from './usePersonalSections.js';
import { buildRenderPlan } from './buildRenderPlan.js';
import TabBar from './TabBar.jsx';
import DateNav from './DateNav.jsx';
import ClockWidget from './ClockWidget.jsx';
import SortableTaskCard from './SortableTaskCard.jsx';
import TaskCard from './TaskCard.jsx';
import SectionLabel from './SectionLabel.jsx';
import AddModal from './AddModal.jsx';
import EditModal from './EditModal.jsx';
import SectionManagerModal from './SectionManagerModal.jsx';
import ProgressBar from './ProgressBar.jsx';
import LoginScreen from './LoginScreen.jsx';

const SESSION_TIMEOUT_MS = 12 * 60 * 60 * 1000;

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSessionExpired() {
  const loginTimestamp = parseInt(localStorage.getItem('tdw_login_at') || '0', 10);
  return Date.now() - loginTimestamp >= SESSION_TIMEOUT_MS;
}

export default function TodoApp() {
  const [authed, setAuthed] = useState(null); // null = checking, false = logged out, true = logged in

  // ── Auth check on mount ──────────────────────────────────────
  useEffect(function() {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !isSessionExpired()) {
        setAuthed(true);
      } else {
        if (session) {
          await supabase.auth.signOut();
          localStorage.removeItem('tdw_login_at');
        }
        setAuthed(false);
      }
    }
    checkSession();
  }, []);

  // ── Periodic 12h timeout check ───────────────────────────────
  useEffect(function() {
    const interval = setInterval(async function() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && isSessionExpired()) {
        await supabase.auth.signOut();
        localStorage.removeItem('tdw_login_at');
        setAuthed(false);
      }
    }, 60 * 1000);
    return function() { clearInterval(interval); };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.removeItem('tdw_login_at');
    setAuthed(false);
  }

  // ── Show nothing while checking session ─────────────────────
  if (authed === null) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#555c63' }}>Loading…</div>;
  }

  // ── Show login screen if not authenticated ───────────────────
  if (authed === false) {
    return <LoginScreen onLogin={function() { setAuthed(true); }} />;
  }

  // ── Authenticated app ────────────────────────────────────────
  return <TodoAppInner onSignOut={handleSignOut} />;
}

function TodoAppInner({ onSignOut }) {
  const {
    tasks, tasksRef, setTasks, loading: tasksLoading, error,
    addTask, updateTask, toggleTask, deleteTask, forwardTask, savePositions
  } = useTasks();
  const {
    sections, loading: sectionsLoading,
    addSection, renameSection, deleteSection
  } = usePersonalSections();

  const [activeTab, setActiveTab]           = useState('work');
  const [selectedDate, setSelectedDate]     = useState(getToday());
  const [showAddModal, setShowAddModal]     = useState(false);
  const [editingTask, setEditingTask]       = useState(null);
  const [showSectionMgr, setShowSectionMgr] = useState(false);
  const [activeTask, setActiveTask]         = useState(null);
  const isDragging = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 }
    })
  );

  function handleShiftDay(dir) {
    setSelectedDate(function(prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + dir);
      return next;
    });
  }

  function handlePickDate(date) {
    setSelectedDate(date);
  }

  function handleDragStart(event) {
    if (isDragging.current) return;
    isDragging.current = true;
    const task = tasks.find(function(t) {
      return String(t.id) === String(event.active.id);
    });
    setActiveTask(task || null);
  }

  async function handleDragEnd(event) {
    setActiveTask(null);
    if (!isDragging.current) return;
    isDragging.current = false;

    const { active, over } = event;
    if (!over || String(active.id) === String(over.id)) return;

    const currentTasks = tasksRef.current;

    const plan = buildRenderPlan(currentTasks, activeTab, selectedDate, sections, formatShortDate);
    const taskItems = plan
      .filter(function(item) { return item.type === 'task'; })
      .map(function(item) { return item.row; });

    const oldIndex = taskItems.findIndex(function(t) {
      return String(t.id) === String(active.id);
    });
    const newIndex = taskItems.findIndex(function(t) {
      return String(t.id) === String(over.id);
    });
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(taskItems, oldIndex, newIndex);

    const updatedById = {};
    reordered.forEach(function(t, i) {
      updatedById[String(t.id)] = i;
    });

    const newTasks = currentTasks.map(function(t) {
      if (updatedById.hasOwnProperty(String(t.id))) {
        return { ...t, position: updatedById[String(t.id)] };
      }
      return t;
    });

    setTasks(newTasks);
    tasksRef.current = newTasks;

    await savePositions(reordered);
  }

  if (tasksLoading || sectionsLoading) {
    return <p style={{ padding: '40px' }}>Loading...</p>;
  }

  if (error) {
    return <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>;
  }

  const plan = buildRenderPlan(tasks, activeTab, selectedDate, sections, formatShortDate);
  const taskIds = plan
    .filter(function(item) { return item.type === 'task'; })
    .map(function(item) { return item.row.id; });

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: '8px' }}>
            {activeTab === 'work' ? 'Work' : 'Personal'}
          </h2>
          <DateNav
            selectedDate={selectedDate}
            onShift={handleShiftDay}
            onPickDate={handlePickDate}
            showPill={activeTab === 'work'}
          />
          {activeTab === 'personal' && (
            <button
              onClick={function() { setShowSectionMgr(true); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                marginTop: '8px',
                background: '#2e3236', color: '#e8e4dc',
                fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem',
                fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '5px 14px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              ✎ Manage Sections
            </button>
          )}
          <button
            onClick={onSignOut}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '8px', marginLeft: '8px',
              background: 'transparent', color: '#555c63',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.72rem',
              fontWeight: 500, letterSpacing: '0.04em',
              padding: '4px 10px', borderRadius: '99px',
              border: '1px solid #9fa5ab', cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, border-color 0.2s'
            }}
          >
            ↩ Sign out
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexShrink: 0 }}>
          <ClockWidget />
          <button
            onClick={function() { setShowAddModal(true); }}
            style={{
              marginTop: '6px', width: '42px', height: '42px', borderRadius: '50%',
              background: '#111', color: 'white', border: 'none', fontSize: '1.5rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)', flexShrink: 0
            }}
            title="Add item"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Progress Bar ── */}
      <ProgressBar plan={plan} />

      {plan.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#555c63', padding: '40px 20px',
          border: '1.5px dashed #9fa5ab', borderRadius: '16px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
          No items yet — hit + to add your first task
        </div>
      )}

      {/* ── Task List ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {plan.map(function(item) {
            if (item.type === 'label') {
              return <SectionLabel key={item.key} text={item.text} completed={item.completed} />;
            }
            return (
              <SortableTaskCard
                key={item.key}
                task={item.row}
                onToggle={toggleTask}
                onEdit={setEditingTask}
                onDelete={deleteTask}
                onForward={forwardTask}
              />
            );
          })}
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div style={{ opacity: 0.95, cursor: 'grabbing' }}>
              <TaskCard
                task={activeTask}
                onToggle={function() {}}
                onEdit={function() {}}
                onDelete={function() {}}
                onForward={null}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddModal
          activeTab={activeTab}
          sections={sections}
          defaultDate={formatShortDate(selectedDate)}
          onAdd={addTask}
          onClose={function() { setShowAddModal(false); }}
        />
      )}

      {editingTask && (
        <EditModal
          task={editingTask}
          sections={sections}
          onSave={updateTask}
          onClose={function() { setEditingTask(null); }}
        />
      )}

      {showSectionMgr && (
        <SectionManagerModal
          sections={sections}
          onAdd={addSection}
          onRename={renameSection}
          onDelete={deleteSection}
          onClose={function() { setShowSectionMgr(false); }}
        />
      )}
    </div>
  );
}
