import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';

import KanbanColumn from './KanbanColumn';
import { useUpdateTaskMutation } from '../../store/slices/apiSlice';

const statusOptions = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'TODO', label: 'To Do' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'IN_REVIEW', label: 'In Review' },
  { key: 'DONE', label: 'Done' },
];

export default function KanbanBoard({ tasks, onTasksChange }) {
  const [updateTask, { isLoading }] = useUpdateTaskMutation();
  const [localTasks, setLocalTasks] = useState(tasks);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    statusOptions.forEach((status) => {
      grouped[status.key] = [];
    });

    localTasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort by order field within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  }, [localTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find source and destination tasks
    const activeTask = localTasks.find((t) => t.id === active.id);
    const overTask = localTasks.find((t) => t.id === over.id);

    if (!activeTask || !overTask) {
      return;
    }

    // For now, only support reordering within the same column
    if (activeTask.status !== overTask.status) {
      toast.error('Cross-column reordering coming soon');
      return;
    }

    // Get tasks in the same column
    const columnTasks = localTasks.filter((t) => t.status === activeTask.status);
    const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
    const newIndex = columnTasks.findIndex((t) => t.id === over.id);

    // Reorder locally
    const reorderedColumn = arrayMove(columnTasks, oldIndex, newIndex);
    const newTasks = localTasks.map((task) => {
      const reorderedTask = reorderedColumn.find((t) => t.id === task.id);
      if (reorderedTask) {
        return { ...reorderedTask, order: reorderedColumn.indexOf(reorderedTask) };
      }
      return task;
    });

    setLocalTasks(newTasks);

    // Update on backend
    try {
      const newOrder = reorderedColumn.indexOf(
        reorderedColumn.find((t) => t.id === activeTask.id)
      );
      await updateTask({ id: activeTask.id, order: newOrder }).unwrap();
    } catch (error) {
      toast.error('Failed to update task order');
      setLocalTasks(tasks); // Rollback
    }
  };

  return (
    <Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-h-screen">
          {statusOptions.map((status) => (
            <KanbanColumn
              key={status.key}
              status={status.key}
              label={status.label}
              tasks={tasksByStatus[status.key]}
            />
          ))}
        </div>
      </DndContext>
    </Box>
  );
}
