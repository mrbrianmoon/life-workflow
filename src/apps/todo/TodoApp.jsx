import { useState } from 'react';
import { useTasks, formatShortDate } from './useTasks.js';
import { usePersonalSections } from './usePersonalSections.js';
import { buildRenderPlan } from './buildRenderPlan.js';
import TabBar from './TabBar.jsx';
import DateNav from './DateNav.jsx';
import TaskCard from './TaskCard.jsx';
import SectionLabel from './SectionLabel.jsx';

function getToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TodoApp() {
  const { tasks, loading: tasksLoading, error } = useTasks();
  const { sections, loading: sectionsLoading } = usePersonalSections();
  const [activeTab, setActiveTab] = useState('work');
  const [selectedDate, setSelectedDate] = useState(getToday());

  function handleShiftDay(dir) {
    setSelectedDate(function(prev) {
      const next = new Date(prev);
      next.setDate(next.getDate() + dir);
      return next;
    });
  }

  if (tasksLoading || sectionsLoading) {
    return <p style={{ padding: '40px' }}>Loading...</p>;
  }

  if (error) {
    return <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>;
  }

  const plan = buildRenderPlan(tasks, activeTab, selectedDate, sections, formatShortDate);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <TabBar activeTab={activeTab} onSwitch={setActiveTab} />

      {activeTab === 'work' && (
        <DateNav selectedDate={selectedDate} onShift={handleShiftDay} />
      )}

      <h2 style={{ marginBottom: '24px', fontFamily: 'DM Serif Display, serif' }}>
        {activeTab === 'work' ? 'Work' : 'Personal'}
      </h2>

      {plan.length === 0 && (
        <div style={{
          textAlign: 'center', color: '#555c63', padding: '40px 20px',
          border: '1.5px dashed #9fa5ab', borderRadius: '16px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
          No items yet
        </div>
      )}

      {plan.map(function(item) {
        if (item.type === 'label') {
          return <SectionLabel key={item.key} text={item.text} completed={item.completed} />;
        }
        return <TaskCard key={item.key} task={item.row} />;
      })}
    </div>
  );
}