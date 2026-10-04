import React, { useState, useEffect } from 'react';
import { Nav3DSidebar } from './components/navigation/Nav3DSidebar';
import { Header } from './components/layout/Header';
import { NavItem } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { ResourcesView } from './views/ResourcesView';
import { PredictionsView } from './views/PredictionsView';
import { CostOptimizationView } from './views/CostOptimizationView';
import { RecommendationsView } from './views/RecommendationsView';
import { ComparisonView } from './views/ComparisonView';
import { MonitoringView } from './views/MonitoringView';
import { ModelAnalyticsView } from './views/ModelAnalyticsView';
import { ExplainableAIView } from './views/ExplainableAIView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { LoginView } from './views/LoginView';
import { ResourceDetailsDrawer } from './components/resources/ResourceDetailsDrawer';
import { CloudResource } from './types/cloudscaler';
import { fetchApi } from './services/apiClient';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('cloudscale_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchApi<{ email: string }>('/api/v1/users/me');
        setUserEmail(profile.email);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('cloudscale_auth_token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cloudscale_auth_token');
    setIsAuthenticated(false);
    setUserEmail('');
  };

  const handleNavigateView = (view: NavItem) => {
    setActiveNav(view);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center font-mono text-slate-400 text-xs">
        <div className="space-y-3 text-center">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div>Restoring Operations Console Session...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(email) => {
          setUserEmail(email);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex perspective-1200">
      {/* 3D Spatial Sidebar Navigation */}
      <Nav3DSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          setIsOpenMobile={setIsOpenMobile}
          onLogout={handleLogout}
          userEmail={userEmail}
        />

        {/* 3D Spatial Transition Main Content Container */}
        <main key={activeNav} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto view-3d-transition">
          {activeNav === 'dashboard' && (
            <DashboardView
              onSelectResource={setSelectedResource}
              onNavigateView={handleNavigateView}
            />
          )}

          {activeNav === 'resources' && (
            <ResourcesView onSelectResource={setSelectedResource} />
          )}

          {activeNav === 'predictions' && <PredictionsView />}

          {activeNav === 'cost' && (
            <CostOptimizationView onNavigateView={handleNavigateView} />
          )}

          {activeNav === 'recommendations' && (
            <RecommendationsView onNavigateView={handleNavigateView} />
          )}

          {activeNav === 'comparison' && <ComparisonView />}

          {activeNav === 'monitoring' && <MonitoringView />}

          {activeNav === 'analytics' && <ModelAnalyticsView />}

          {activeNav === 'explainable' && <ExplainableAIView />}

          {activeNav === 'settings' && <SettingsView />}

          {activeNav === 'about' && <AboutView />}
        </main>
      </div>

      {/* Resource Detail Drawer Overlay */}
      <ResourceDetailsDrawer
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onNavigateView={(v) => {
          setSelectedResource(null);
          setActiveNav(v);
        }}
      />
    </div>
  );
}

export default App;
