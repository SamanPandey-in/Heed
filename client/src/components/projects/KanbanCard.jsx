import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Chip, Typography } from '@mui/material';
import { GripVertical } from 'lucide-react';

const priorityColors = {
  LOW: '#059669',
  MEDIUM: '#2563eb',
  HIGH: '#dc2626',
  URGENT: '#7c3aed',
};

const typeColors = {
  BUG: '#dc2626',
  FEATURE: '#2563eb',
  TASK: '#16a34a',
  IMPROVEMENT: '#9333ea',
  EPIC: '#ea580c',
  STORY: '#0891b2',
  SUB_TASK: '#64748b',
};

export default function KanbanCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 1,
        p: 2,
        cursor: isDragging ? 'grabbing' : 'grab',
        border: '1px solid var(--color-border)',
        '&:hover': {
          borderColor: 'var(--color-border-hover)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
        transition: 'all 0.2s ease',
      }}
      {...attributes}
      {...listeners}
    >
      <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
        <GripVertical size={16} style={{ marginTop: 2, color: 'var(--color-text-secondary)', flexShrink: 0 }} />
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Chip
          label={task.type}
          size="small"
          sx={{
            height: 20,
            backgroundColor: typeColors[task.type] || '#64748b',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
        <Chip
          label={task.priority}
          size="small"
          sx={{
            height: 20,
            backgroundColor: priorityColors[task.priority] || '#64748b',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 600,
          }}
        />
      </Box>

      {task.assignee && (
        <Box sx={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          {task.assignee.fullName || task.assignee.username}
        </Box>
      )}
    </Box>
  );
}
