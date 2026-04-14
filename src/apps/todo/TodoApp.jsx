import { useState } from 'react';
import { useTasks, formatShortDate } from './useTasks.js';
import TabBar from './TabBar.jsx';
import DateNav from './DateNav.jsx';
import TaskCard from './TaskCard.jsx';

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function filterTasks(tasks, activeTab, selectedDate) {
  const currentDateStr = formatShortDate(selectedDate);

  return tasks.filter(function(row) {
    const taskTab = row.tab || 'work';
    if (taskTab !== activeTab) return false;
    if (activeTab === 'work') {
      if (row.category === 'Ongoing') return true;
      const taskDate = row.display_date || row.origin_date;
      return taskDate === currentDateStr;
    }
    return true;
  });
}

export default function TodoApp() {
  const { tasks, loading, error } = useTasks();
  const [activeTab, setActiveTab] = useState('work');
  const [selectedDate, setSelectedDate] = useState(getToday());

  function handleShiftDay(dir) {
    setSelectedDate(function(prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + dir);
      return next;
    });
  }

  if (loading) {
    return <p style={{ padding: '40px' }}>Loading tasks...</p>;
  }

  if (error) {
    return <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>;
  }

  const visible = filterTasks(tasks, activeTab, selectedDate);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

      {activeTab === 'work' && (
        <DateNav selectedDate={selectedDate} onShift={handleShiftDay} />
      )}

      <h2 style={{ marginBottom: '24px', fontFamily: 'DM Serif Display, serif' }}>
        {activeTab === 'work' ? 'Work' : 'Personal'}
      </h2>

      {visible.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#555c63', padding: '40px 20px',
          border: '1.5px dashed #9fa5ab', borderRadius: '16px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
          No items yet
        </div>
      )}

      {visible.map(function(task) {
        return <TaskCard key={task.id} task={task} />;
      })}
    </div>
  );
}