import { useTasks } from './useTasks.js';

export default function TodoApp() {
  const { tasks, loading, error } = useTasks();

  if (loading) {
    return <p style={{ padding: '40px' }}>Loading tasks...</p>;
  }

  if (error) {
    return <p style={{ padding: '40px', color: 'red' }}>Error: {error}</p>;
  }

  return (
    <div style={{ padding: '40px' }}>
      <h2>To Do ({tasks.length} tasks)</h2>
      <ul>
        {tasks.map(function(task) {
          return (
            <li key={task.id}>
              {task.name} — {task.tab} / {task.category}
            </li>
          );
        })}
      </ul>
    </div>
  );
}