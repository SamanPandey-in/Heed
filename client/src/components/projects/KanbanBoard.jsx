import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
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
  const [localTasks, setLocalTasks] = useState(tasks || []);

  useEffect(() => {
    setLocalTasks(tasks || []);
  }, [tasks]);

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
      activationConstraint: { distance: 8 },
    })
  );

  const resolveGroupedTasks = (taskList) => {
    const grouped = {};

    statusOptions.forEach((status) => {
      grouped[status.key] = [];
    });

    taskList.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return grouped;
  };

  const isColumnId = (value) => statusOptions.some((status) => status.key === value);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    // Find source task
    const activeTask = localTasks.find((t) => t.id === active.id);
    const overTask = localTasks.find((t) => t.id === over.id);

    if (!activeTask) {
      return;
    }

    const destinationStatus = isColumnId(overId)
      ? overId
      : (overTask?.status || null);

    if (!destinationStatus) {
      return;
    }

    const grouped = resolveGroupedTasks(localTasks);
    const sourceStatus = activeTask.status;

    const sourceColumn = [...(grouped[sourceStatus] || [])];
    const destinationColumn = sourceStatus === destinationStatus
      ? sourceColumn
      : [...(grouped[destinationStatus] || [])];

    const sourceIndex = sourceColumn.findIndex((task) => task.id === activeId);
    if (sourceIndex < 0) {
      return;
    }

    const [movedTask] = sourceColumn.splice(sourceIndex, 1);

    const destinationIndex = overTask
      ? destinationColumn.findIndex((task) => task.id === overTask.id)
      : destinationColumn.length;

    const safeDestinationIndex = destinationIndex < 0 ? destinationColumn.length : destinationIndex;

    destinationColumn.splice(safeDestinationIndex, 0, {
      ...movedTask,
      status: destinationStatus,
    });

    const rebuiltById = new Map(localTasks.map((task) => [task.id, task]));

    const applyColumnOrder = (columnStatus, columnTasks) => {
      columnTasks.forEach((task, index) => {
        const prev = rebuiltById.get(task.id);
        if (!prev) return;
        rebuiltById.set(task.id, {
          ...prev,
          status: columnStatus,
          order: index,
        });
      });
    };

    applyColumnOrder(sourceStatus, sourceColumn);
    applyColumnOrder(destinationStatus, destinationColumn);

    const nextTasks = Array.from(rebuiltById.values());

    setLocalTasks(nextTasks);
    if (onTasksChange) {
      onTasksChange(nextTasks);
    }

    try {
      await updateTask({
        id: movedTask.id,
        status: destinationStatus,
        order: safeDestinationIndex,
      }).unwrap();
      toast.success('Task moved', { duration: 1200 });
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to move task');
      setLocalTasks(tasks || []);
      if (onTasksChange) {
        onTasksChange(tasks || []);
      }
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
