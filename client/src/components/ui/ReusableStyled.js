import { styled } from '@mui/material/styles';
import { Box, Avatar, DialogActions, LinearProgress } from '@mui/material';

export const FormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
}));

export const TwoColGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: '1fr 1fr',
  },
}));

export const FlexWrap = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

export const SmallAvatar = styled(Avatar)({
  width: 20,
  height: 20,
});

export const MediumAvatar = styled(Avatar)({
  width: 28,
  height: 28,
});

export const DialogActionsNoPad = styled(DialogActions)({
  paddingLeft: 0,
  paddingRight: 0,
});

export const DialogActionsNoPadTop = styled(DialogActions)({
  paddingLeft: 0,
  paddingRight: 0,
  paddingTop: 16,
});

export const LinearProgressRounded = styled(LinearProgress)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  height: 6,
}));
