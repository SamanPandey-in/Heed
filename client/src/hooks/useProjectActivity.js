import { useGetProjectActivityQuery } from '../store/slices/apiSlice';

export function useProjectActivity(projectId) {
  const { data, isLoading, error, refetch } = useGetProjectActivityQuery(projectId, {
    skip: !projectId,
    pollingInterval: 30000, // Refetch every 30 seconds
  });

  return {
    activityLogs: data?.activityLogs || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
  };
}
