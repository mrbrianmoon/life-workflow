import { useState, useRef } from 'react';
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
import { useTasks, formatShortDate } from './useTasks.js';
import { usePersonalSections } from './usePersonalSections.js';
import { buildRenderPlan } from './buildRenderPlan.js';
import TabBar from './TabBar.jsx';
import DateNav from './DateNav.jsx';
import SortableTaskCard from './SortableTaskCard.jsx';
import TaskCard from './TaskCard.jsx';
import SectionLabel from './SectionLabel.jsx';
import AddModal from './AddModal.jsx';
import EditModal from './EditModal.jsx';

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TodoApp() {
  const {
    tasks, tasksRef, setTasks, loading: tasksLoading, error,
    addTask, updateTask, toggleTask, deleteTask, savePositions
  } = useTasks();
  const { sections, loading: sectionsLoading } = usePersonalSections();
  const [activeTab, setActiveTab] = useState('work');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
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
  
    // Assign fresh sequential positions to the reordered visible tasks
    const updatedById = {};
    reordered.forEach(function(t, i) {
      updatedById[String(t.id)] = i;
    });
  
    // Rebuild the full tasks array with updated positions for visible tasks
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

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', marginBottom: '8px' }}>
            {activeTab === 'work' ? 'Work' : 'Personal'}
          </h2>
          {activeTab === 'work' && (
            <DateNav selectedDate={selectedDate} onShift={handleShiftDay} />
          )}
        </div>
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

      {plan.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#555c63', padding: '40px 20px',
          border: '1.5px dashed #9fa5ab', borderRadius: '16px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
          No items yet — hit + to add your first task
        </div>
      )}

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
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
    </div>
  );
}