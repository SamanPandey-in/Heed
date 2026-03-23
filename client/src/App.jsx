import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, Layout, ErrorBoundary } from './components';
import { useInitializeAppData } from './hooks';
import { AppShellSkeleton, AuthScreenSkeleton } from './components/ui';

import {
  Landing, Login, Signup, ForgotPassword, ResetPassword, VerifyEmail,
  Dashboard, Projects, ProjectDetails,
  Teams, TeamDetails, TaskDetails, Settings, Profile
} from './pages/index';

const LoadingScreen = () => (
  <AppShellSkeleton />
);

const NO_SKELETON_APP_ROUTES = ['/', '/login', '/auth', '/signup'];
const NO_SKELETON_PUBLIC_ROUTES = ['/login', '/auth', '/signup'];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AuthScreenSkeleton />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading && !NO_SKELETON_PUBLIC_ROUTES.includes(pathname)) {
    return <AuthScreenSkeleton />;
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppInitializer() {
  const isAppLoading = useInitializeAppData();
  const { pathname } = useLocation();

  if (isAppLoading && !NO_SKELETON_APP_ROUTES.includes(pathname)) {
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
      <Route path="/verify-email" element={<VerifyEmail />} />

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
