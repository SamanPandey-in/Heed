import { Skeleton } from '@mui/material';

const baseSkeletonSx = (theme) => ({
  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,39,0.08)',
  '&::after': {
    background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.72), transparent)',
  },
});

export const PremiumSkeleton = ({ sx, ...props }) => (
  <Skeleton
    animation="wave"
    sx={Array.isArray(sx) ? [baseSkeletonSx, ...sx] : [baseSkeletonSx, sx]}
    {...props}
  />
);

export const AuthScreenSkeleton = () => (
  <div className="min-h-screen flex items-center justify-center bg-black px-4">
    <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white/2 border border-white/10 backdrop-blur-2xl shadow-2xl p-8 md:p-10">
      <div className="flex justify-center mb-8">
        <PremiumSkeleton variant="rounded" width={140} height={24} />
      </div>
      <div className="space-y-5">
        <div className="space-y-2">
          <PremiumSkeleton variant="rounded" width="45%" height={14} />
          <PremiumSkeleton variant="rounded" width="70%" height={10} />
        </div>
        <div className="space-y-3">
          <PremiumSkeleton variant="rounded" width="100%" height={46} />
          <PremiumSkeleton variant="rounded" width="100%" height={46} />
        </div>
        <PremiumSkeleton variant="rounded" width="100%" height={42} />
        <div className="flex justify-center">
          <PremiumSkeleton variant="rounded" width="50%" height={12} />
        </div>
      </div>
    </div>
  </div>
);

export const AppShellSkeleton = () => (
  <div className="h-screen flex bg-white dark:bg-black text-gray-900 dark:text-slate-100">
    <div className="hidden sm:flex w-68 flex-col border-r border-gray-200 dark:border-white/10 p-4 gap-3">
      <PremiumSkeleton variant="rounded" width="70%" height={18} sx={{ mb: 1 }} />
      {Array.from({ length: 4 }).map((_, index) => (
        <PremiumSkeleton key={index} variant="rounded" width="100%" height={34} />
      ))}
      <div className="mt-4 space-y-3">
        <PremiumSkeleton variant="rounded" width="55%" height={12} />
        {Array.from({ length: 5 }).map((_, index) => (
          <PremiumSkeleton key={index} variant="rounded" width="100%" height={26} />
        ))}
      </div>
    </div>

    <div className="flex-1 flex flex-col min-w-0">
      <div className="px-6 xl:px-16 py-3 border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <PremiumSkeleton variant="rounded" width={320} height={38} />
          <div className="flex items-center gap-3">
            <PremiumSkeleton variant="circular" width={30} height={30} />
            <PremiumSkeleton variant="circular" width={30} height={30} />
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 xl:p-10 xl:px-16 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <PremiumSkeleton variant="rounded" width={220} height={22} />
              <PremiumSkeleton variant="rounded" width={300} height={12} />
            </div>
            <PremiumSkeleton variant="rounded" width={130} height={36} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
                <PremiumSkeleton variant="rounded" width="45%" height={12} />
                <PremiumSkeleton variant="rounded" width="30%" height={28} />
                <PremiumSkeleton variant="rounded" width="70%" height={10} />
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 space-y-4">
                <PremiumSkeleton variant="rounded" width="28%" height={16} />
                {Array.from({ length: 4 }).map((_, index) => (
                  <PremiumSkeleton key={index} variant="rounded" width="100%" height={56} />
                ))}
              </div>
            </div>
            <div className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
              <PremiumSkeleton variant="rounded" width="40%" height={16} />
              {Array.from({ length: 6 }).map((_, index) => (
                <PremiumSkeleton key={index} variant="rounded" width="100%" height={18} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TeamsPageSkeleton = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
      <div className="space-y-2">
        <PremiumSkeleton variant="rounded" width={140} height={22} />
        <PremiumSkeleton variant="rounded" width={240} height={12} />
      </div>
      <PremiumSkeleton variant="rounded" width={138} height={36} />
    </div>

    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
      <PremiumSkeleton variant="rounded" width={140} height={12} />
      <PremiumSkeleton variant="rounded" width="100%" height={40} />
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          <PremiumSkeleton variant="rounded" width="60%" height={16} />
          <PremiumSkeleton variant="rounded" width="90%" height={10} />
          <PremiumSkeleton variant="rounded" width="85%" height={10} />
          <div className="space-y-2 pt-2">
            <PremiumSkeleton variant="rounded" width="50%" height={10} />
            <PremiumSkeleton variant="rounded" width="55%" height={10} />
            <PremiumSkeleton variant="rounded" width="65%" height={10} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TaskDetailsSkeleton = () => (
  <div className="flex flex-col-reverse lg:flex-row gap-6 sm:p-4 max-w-6xl mx-auto">
    <div className="w-full lg:w-2/3">
      <div className="p-5 rounded-md border border-gray-300 dark:border-zinc-800 space-y-4">
        <PremiumSkeleton variant="rounded" width="45%" height={18} />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <PremiumSkeleton key={index} variant="rounded" width="100%" height={62} />
          ))}
        </div>
        <PremiumSkeleton variant="rounded" width="100%" height={98} />
      </div>
    </div>
    <div className="w-full lg:w-1/2 flex flex-col gap-6">
      <div className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 space-y-3">
        <PremiumSkeleton variant="rounded" width="65%" height={22} />
        <div className="flex gap-2">
          <PremiumSkeleton variant="rounded" width={72} height={24} />
          <PremiumSkeleton variant="rounded" width={72} height={24} />
          <PremiumSkeleton variant="rounded" width={72} height={24} />
        </div>
        <PremiumSkeleton variant="rounded" width="100%" height={56} />
        <PremiumSkeleton variant="rounded" width="100%" height={1} />
        <PremiumSkeleton variant="rounded" width="90%" height={16} />
        <PremiumSkeleton variant="rounded" width="76%" height={16} />
      </div>
      <div className="p-4 rounded-md bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 space-y-3">
        <PremiumSkeleton variant="rounded" width="48%" height={20} />
        <PremiumSkeleton variant="rounded" width="82%" height={16} />
        <PremiumSkeleton variant="rounded" width="40%" height={14} />
      </div>
    </div>
  </div>
);

export const CommentsSkeleton = () => (
  <div className="flex flex-col gap-4 mb-6 mr-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="sm:max-w-4/5 border border-gray-300 dark:border-zinc-700 p-3 rounded-md">
        <div className="space-y-2">
          <PremiumSkeleton variant="rounded" width="48%" height={10} />
          <PremiumSkeleton variant="rounded" width="100%" height={12} />
          <PremiumSkeleton variant="rounded" width="80%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-5 max-w-6xl mx-auto text-gray-900 dark:text-white">
    <div className="space-y-2">
      <PremiumSkeleton variant="rounded" width={130} height={22} />
      <PremiumSkeleton variant="rounded" width={280} height={12} />
    </div>

    <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <PremiumSkeleton variant="circular" width={96} height={96} />
        <div className="space-y-3 flex-1">
          <PremiumSkeleton variant="rounded" width="45%" height={26} />
          <PremiumSkeleton variant="rounded" width="60%" height={14} />
          <PremiumSkeleton variant="rounded" width="52%" height={14} />
          <PremiumSkeleton variant="rounded" width={110} height={32} />
        </div>
      </div>
    </div>

    <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6 space-y-4">
      <PremiumSkeleton variant="rounded" width={120} height={22} />
      <PremiumSkeleton variant="rounded" width="100%" height={80} />
    </div>

    <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded p-6 space-y-4">
      <PremiumSkeleton variant="rounded" width={180} height={22} />
      {Array.from({ length: 4 }).map((_, index) => (
        <PremiumSkeleton key={index} variant="rounded" width="100%" height={56} />
      ))}
    </div>
  </div>
);