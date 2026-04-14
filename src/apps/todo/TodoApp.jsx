import { useTasks } from './useTasks.js';
import TaskCard from './TaskCard.jsx';

export default function TodoApp() {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return <p style={{ padding: '40px' }}>Loading tasks...</p>;
  }

  if (error) {
    return <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <h2 style={{ marginBottom: '24px', fontFamily: 'DM Serif Display, serif' }}>
        To Do ({tasks.length} tasks)
      </h2>
      {tasks.map(function(task) {
        return <TaskCard key={task.id} task={task} />;
      })}
    </div>
  );
}