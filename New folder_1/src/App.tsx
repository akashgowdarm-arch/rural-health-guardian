import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProjectList } from './components/ProjectList';
import { StepWizard } from './components/StepWizard';
import { ProjectDashboard } from './components/ProjectDashboard';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'wizard' | 'project'>('dashboard');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const list = await api.getProjects();
      setProjects(list);
    } catch (err) {}
  };

  useEffect(() => {
    loadProjects();
  }, [currentView]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'dashboard') {
            setSelectedProjectId(null);
            setCurrentView('dashboard');
          } else if (view === 'wizard') {
            setCurrentView('wizard');
          }
        }}
      />

      <main className="flex-1">
        {currentView === 'dashboard' && (
          <ProjectList
            projects={projects}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setCurrentView('project');
            }}
            onNewProject={() => setCurrentView('wizard')}
          />
        )}

        {currentView === 'wizard' && (
          <StepWizard
            onDeploymentComplete={(projectId) => {
              setSelectedProjectId(projectId);
              setCurrentView('project');
            }}
          />
        )}

        {currentView === 'project' && selectedProjectId && (
          <ProjectDashboard
            projectId={selectedProjectId}
            onNewDeployment={() => setCurrentView('wizard')}
          />
        )}
      </main>
    </div>
  );
};

export default App;
