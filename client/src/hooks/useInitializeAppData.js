import { useEffect, useRef, useState, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Import Redux actions
import { 
  fetchTeams, 
  fetchProjects, 
  fetchTasks,
  setUser, 
  setUserLoading, 
  setUserError 
} from '../store';

export const AppLoadingContext = createContext({
  isLoading: false,
  setLoading: () => {},
});

export const useAppLoading = () => useContext(AppLoadingContext);

/**
 * Custom hook to initialize all app data after authentication
 * Fetches user profile, teams, projects, and tasks using Redux Async Thunks
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
        dispatch(setUserLoading(true));
        dispatch(setUserError(null));

        // Fetch user profile and trigger other thunks
        const profileResult = await api.get('/auth/me');
        
        if (profileResult.data?.user) {
          const backendUser = profileResult.data.user;
          dispatch(setUser({
            ...backendUser,
            teamIds: backendUser.teamIds || [],
          }));
        }

        // Trigger all data fetches
        // These thunks handle their own loading/error state in Redux
        await Promise.allSettled([
          dispatch(fetchTeams()).unwrap(),
          dispatch(fetchProjects()).unwrap(),
          dispatch(fetchTasks()).unwrap(),
        ]);

        console.log('[App] Initialized user profile, teams, projects, and tasks via thunks');
      } catch (error) {
        console.error('[App] Failed to initialize app data:', error);
        dispatch(setUserError(error.response?.data?.message || 'Failed to load user profile'));
      } finally {
        dispatch(setUserLoading(false));
        setIsAppLoading(false);
      }
    };

    initializeAppData();
  }, [isAuthenticated, authLoading, dispatch]);

  return isAppLoading;
};
