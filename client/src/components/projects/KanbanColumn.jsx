import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Typography } from '@mui/material';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ status, label, tasks }) {
  const taskIds = tasks.map((task) => task.id);

  return (
    <Box
      sx={{
        backgroundColor: 'var(--color-surface-variant)',
        borderRadius: 2,
        p: 2,
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 2,
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.5px',
        }}
      >
        {label} ({tasks.length})
      </Typography>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tasks.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              <Typography variant="caption">No tasks</Typography>
            </Box>
          ) : (
            tasks.map((task) => <KanbanCard key={task.id} task={task} />)
          )}
        </Box>
      </SortableContext>
    </Box>
  );
}
