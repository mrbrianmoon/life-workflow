import './TodoApp.css';

export default function TodoApp() {
  return (
    <div className="todo-placeholder">
      <h1>To Do Workstream</h1>
      <p className="placeholder-msg">
        This app is being migrated from the standalone <code>index.html</code> version.
      </p>
      <p className="placeholder-msg">
        Your existing To Do app is still live at its current GitHub Pages URL — 
        use that for daily tasks while this React version is built out.
      </p>
      <div className="migration-checklist">
        <h3>Migration Checklist</h3>
        <ul>
          <li className="pending">Supabase connection + data layer</li>
          <li className="pending">Task rendering (TaskCard component)</li>
          <li className="pending">Work / Personal tab switching</li>
          <li className="pending">Priority grouping + sections</li>
          <li className="pending">Drag and drop reordering</li>
          <li className="pending">Rich note editor</li>
          <li className="pending">Real-time sync</li>
        </ul>
      </div>
    </div>
  );
}
