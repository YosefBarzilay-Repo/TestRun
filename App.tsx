import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TestRunDashboard } from './components/TestRunDashboard';
import { TestHistoryView } from './components/TestHistoryView';
import { RunComparisonView } from './components/RunComparisonView';
import { BenchmarkView } from './components/BenchmarkView';
import { ViewMode } from './types';
import { MOCK_RUNS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('DASHBOARD');
  const [currentRunId, setCurrentRunId] = useState<string>(MOCK_RUNS[0].id);

  const currentRun = MOCK_RUNS.find(r => r.id === currentRunId) || MOCK_RUNS[0];

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return (
          <div className="space-y-4">
             {/* Run Selector for Dashboard */}
             <div className="flex justify-end mb-2">
                <select 
                  className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg p-2.5 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={currentRunId}
                  onChange={(e) => setCurrentRunId(e.target.value)}
                >
                  {MOCK_RUNS.map(run => (
                    <option key={run.id} value={run.id}>{run.name} - {new Date(run.timestamp).toLocaleDateString()}</option>
                  ))}
                </select>
             </div>
            <TestRunDashboard run={currentRun} />
          </div>
        );
      case 'HISTORY':
        return <TestHistoryView />;
      case 'COMPARISON':
        return <RunComparisonView />;
      case 'BENCHMARK':
        return <BenchmarkView />;
      default:
        return <div>Not Implemented</div>;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
