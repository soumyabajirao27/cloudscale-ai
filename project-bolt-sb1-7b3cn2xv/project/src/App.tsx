import { PageLayout } from '@/components/PageLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { AboutPage } from '@/pages/AboutPage';
import { ComparisonPage } from '@/pages/ComparisonPage';
import { CostPage } from '@/pages/CostPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ExplainableAIPage } from '@/pages/ExplainableAIPage';
import { LoginPage } from '@/pages/LoginPage';
import { ModelAnalyticsPage } from '@/pages/ModelAnalyticsPage';
import { MonitoringPage } from '@/pages/MonitoringPage';
import { PredictionsPage } from '@/pages/PredictionsPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ResourcesPage } from '@/pages/ResourcesPage';
import { ScalingPage } from '@/pages/ScalingPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected application routes */}
          <Route
            element={
              <ProtectedRoute>
                <PageLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<DashboardPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="predictions" element={<PredictionsPage />} />
            <Route path="cost" element={<CostPage />} />
            <Route path="scaling" element={<ScalingPage />} />
            <Route path="comparison" element={<ComparisonPage />} />
            <Route path="monitoring" element={<MonitoringPage />} />
            <Route path="models" element={<ModelAnalyticsPage />} />
            <Route path="explainable" element={<ExplainableAIPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
