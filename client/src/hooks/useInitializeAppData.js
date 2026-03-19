import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Import Redux actions
import { setTeams } from '../store/slices/teamsSlice';
import { setProjects } from '../store/slices/projectsSlice';
import { setTasks, setTasksLoading, setTasksError } from '../store/slices/tasksSlice';
import { setUser, setLoading as setUserLoading, setError as setUserError } from '../store/slices/userSlice';

export const AppLoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
});

export const useAppLoading = () => useContext(AppLoadingContext);

/**
 * Custom hook to initialize all app data after authentication
 * Fetches user profile, teams, projects, and tasks in parallel
 * Automatically runs when user authenticates
 */
export const useInitializeAppData = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isAppLoading, setIsAppLoading] = useState(authLoading);
  const initializeRef = useRef(false);

  useEffect(() => {
    if (authLoading) {
      setIsAppLoading(true);
      return;
    }

    if (!isAuthenticated) {
      initializeRef.current = false;
      setIsAppLoading(false);
      return;
    }

    // Only initialize once when authenticated and not already initializing
    if (initializeRef.current) {
      setIsAppLoading(false);
      return;
    }

    initializeRef.current = true;

    const initializeAppData = async () => {
      setIsAppLoading(true);
      try {
        dispatch(setTasksLoading(true));
        dispatch(setTasksError(null));
        dispatch(setUserLoading(true));
        dispatch(setUserError(null));

        // Fetch all data in parallel for better performance
        const [profileResult, teamsResult, projectsResult, tasksResult] = await Promise.allSettled([
          api.get('/auth/me'),
          api.get('/teams'),
          api.get('/projects'),
          api.get('/tasks'),
        ]);

        // Dispatch user profile first (used by Profile page and selectors)
        if (profileResult.status === 'fulfilled' && profileResult.value.data?.user) {
          const backendUser = profileResult.value.data.user;
          dispatch(setUser({
            ...backendUser,
            teamIds: backendUser.teamIds || [],
          }));
        } else if (profileResult.status === 'rejected') {
          dispatch(setUserError(profileResult.reason?.response?.data?.message || 'Failed to load user profile'));
        }

        // Dispatch teams/projects/tasks if available
        if (teamsResult.status === 'fulfilled' && teamsResult.value.data?.teams) {
          dispatch(setTeams(teamsResult.value.data.teams));
        }

        if (projectsResult.status === 'fulfilled' && projectsResult.value.data?.projects) {
          dispatch(setProjects(projectsResult.value.data.projects));
        }

        if (tasksResult.status === 'fulfilled' && tasksResult.value.data?.tasks) {
          dispatch(setTasks(tasksResult.value.data.tasks));
        }

        console.log('[App] Initialized user profile, teams, projects, and tasks');
      } catch (error) {
        console.error('[App] Failed to initialize app data:', error);
        dispatch(setTasksError(error.response?.data?.message || 'Failed to load app data'));
        dispatch(setUserError(error.response?.data?.message || 'Failed to load user profile'));
        
        // Continue anyway - app should still be functional with fallback data
      } finally {
        dispatch(setTasksLoading(false));
        dispatch(setUserLoading(false));
        setIsAppLoading(false);
      }
    };

    initializeAppData();
  }, [isAuthenticated, authLoading, dispatch]);

  return isAppLoading;
};
