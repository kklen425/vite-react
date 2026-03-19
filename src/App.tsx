import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';

import { OnboardingScreen } from './screens/OnboardingScreen';
import { PaywallScreen } from './screens/PaywallScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NewWorkoutScreen } from './screens/NewWorkoutScreen';
import { WorkoutDetailScreen } from './screens/WorkoutDetailScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ExerciseLibraryScreen } from './screens/ExerciseLibraryScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function AppRoutes() {
  const { prefs: { prefs } } = useApp();
  const showNav = prefs.onboardingComplete;

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            prefs.onboardingComplete
              ? <Navigate to="/home" replace />
              : <Navigate to="/onboarding" replace />
          }
        />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/paywall" element={<PaywallScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/workout/new" element={<NewWorkoutScreen />} />
        <Route path="/workout/:id" element={<WorkoutDetailScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/exercises" element={<ExerciseLibraryScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
