import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

// NEW: import from context instead of firebase/auth
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, Layout, ErrorBoundary } from './components';
import { useInitializeAppData } from './hooks';

import {
  Landing, Login, Signup, ForgotPassword, ResetPassword,
  Dashboard, Projects, ProjectDetails,
  Teams, TeamDetails, TaskDetails, Settings, Profile
} from './pages/index';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
      <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>
  </div>
);

// ─── Route guards (identical API, no Firebase dependency) ─────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

// ─── App Initializer: Fetches all data after authentication ────────────────
function AppInitializer() {
  // Initialize all app data when user authenticates
  const isAppLoading = useInitializeAppData();

  if (isAppLoading) {
    return <LoadingScreen />;
  }

  return <AppRoutes />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/auth" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      <Route path="/*" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:teamId" element={<TeamDetails />} />
        <Route path="taskDetails" element={<TaskDetails />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="projectsDetail" element={<Navigate to="/projects" replace />} />
        <Route path="team" element={<Navigate to="/teams" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <AppInitializer />
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
