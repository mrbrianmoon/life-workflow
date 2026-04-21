import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard.jsx';

export default function SortableTaskCard({ task, onToggle, onEdit, onDelete, onForward, onSubtaskToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const { style: _listenersStyle, ...listenerHandlers } = listeners || {};

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : undefined,
  };

  function handlePointerDown(e) {
    if (e.target.closest('button') || e.target.closest('[data-nocb]')) return;
    if (listenerHandlers.onPointerDown) listenerHandlers.onPointerDown(e);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listenerHandlers}
      onPointerDown={handlePointerDown}
    >
      <TaskCard
        task={task}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onForward={onForward}
        onSubtaskToggle={onSubtaskToggle}
      />
    </div>
  );
}