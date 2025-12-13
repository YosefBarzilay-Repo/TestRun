import React from 'react';
import { ViewMode } from '../types';
import { LayoutDashboard, History, GitCompare, LineChart, ShieldCheck } from 'lucide-react';

interface Props {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ currentView, onViewChange, children }) => {
  const navItems = [
    { id: 'DASHBOARD', label: 'Run Analysis', icon: LayoutDashboard },
    { id: 'HISTORY', label: 'Test History', icon: History },
    { id: 'COMPARISON', label: 'Comparisons', icon: GitCompare },
    { id: 'BENCHMARK', label: 'Benchmarks', icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary-900 text-slate-300 flex-shrink-0 flex flex-col fixed h-full z-10 border-r border-slate-800">
        <div className="h-16 flex items-center gap-3 px-6 text-white border-b border-slate-800/50 bg-secondary-900">
          <ShieldCheck size={24} className="text-primary-500" />
          <span className="font-bold text-xl tracking-tight text-white">TestRun</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id as ViewMode)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group border border-transparent ${
                  isActive 
                    ? 'bg-primary-600/10 text-primary-400 border-primary-600/20' 
                    : 'hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-secondary-900">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center text-white font-bold text-xs">PA</div>
             <div>
                <p className="text-xs font-bold text-slate-200">Project Alpha</p>
                <p className="text-[10px] text-slate-500">Environment: Staging</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <header className="mb-6 flex justify-between items-center">
           <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {navItems.find(n => n.id === currentView)?.label}
              </h1>
           </div>
           {/* Export button removed from here, moved to specific views */}
        </header>
        {children}
      </main>
    </div>
  );
};