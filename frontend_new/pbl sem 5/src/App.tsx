import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
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

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isLoggedIn());
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<CloudResource | null>(null);

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

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserEmail('');
  };

  const handleNavigateView = (view: NavItem) => {
    setActiveNav(view);
  };

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
