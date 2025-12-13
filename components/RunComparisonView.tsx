import React, { useState } from 'react';
import { MOCK_RUNS } from '../constants';
import { TestStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ArrowRight, AlertOctagon, CheckCircle2, Minus } from 'lucide-react';

export const RunComparisonView: React.FC = () => {
  const [baseRunId, setBaseRunId] = useState<string>(MOCK_RUNS[1]?.id || '');
  const [targetRunId, setTargetRunId] = useState<string>(MOCK_RUNS[0]?.id || '');

  const baseRun = MOCK_RUNS.find(r => r.id === baseRunId);
  const targetRun = MOCK_RUNS.find(r => r.id === targetRunId);

  // Comparison Logic
  const getComparisons = () => {
    if (!baseRun || !targetRun) return { regressions: [], fixes: [], same: [] };

    const regressions: any[] = [];
    const fixes: any[] = [];
    const same: any[] = [];

    targetRun.results.forEach(targetResult => {
      const baseResult = baseRun.results.find(r => r.testCaseId === targetResult.testCaseId);
      
      if (!baseResult) return; // New test?

      const item = {
        testCaseName: targetResult.testCaseName,
        suite: targetResult.suite,
        baseStatus: baseResult.status,
        targetStatus: targetResult.status
      };

      if (baseResult.status === TestStatus.PASS && targetResult.status === TestStatus.FAIL) {
        regressions.push(item);
      } else if (baseResult.status === TestStatus.FAIL && targetResult.status === TestStatus.PASS) {
        fixes.push(item);
      } else {
        same.push(item);
      }
    });

    return { regressions, fixes, same };
  };

  const { regressions, fixes } = getComparisons();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Selector */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center justify-center">
        <div className="flex-1 w-full">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Baseline Run</label>
           <select 
             className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
             value={baseRunId}
             onChange={(e) => setBaseRunId(e.target.value)}
           >
             {MOCK_RUNS.map(r => (
               <option key={r.id} value={r.id}>{r.name} ({new Date(r.timestamp).toLocaleDateString()})</option>
             ))}
           </select>
        </div>
        
        <div className="bg-slate-100 p-2 rounded-full text-slate-400 mt-6 md:mt-0">
          <ArrowRight size={20} />
        </div>

        <div className="flex-1 w-full">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Comparison Target</label>
           <select 
             className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
             value={targetRunId}
             onChange={(e) => setTargetRunId(e.target.value)}
           >
             {MOCK_RUNS.map(r => (
               <option key={r.id} value={r.id}>{r.name} ({new Date(r.timestamp).toLocaleDateString()})</option>
             ))}
           </select>
        </div>
      </div>

      {/* Regressions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-rose-100 overflow-hidden">
           <div className="bg-rose-50/50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
             <h3 className="font-bold text-rose-800 flex items-center gap-2">
               <AlertOctagon size={18} /> Regressions
             </h3>
             <span className="bg-white text-rose-700 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-rose-100">{regressions.length}</span>
           </div>
           <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
             {regressions.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No regressions detected! Great job.</div>
             ) : (
               regressions.map((item, idx) => (
                 <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="font-medium text-slate-800">{item.testCaseName}</div>
                    <div className="text-xs text-slate-500 mt-1 mb-2">{item.suite}</div>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge status={item.baseStatus} mini />
                      <ArrowRight size={14} className="text-slate-300" />
                      <StatusBadge status={item.targetStatus} mini />
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* Fixes */}
        <div className="bg-white rounded-lg shadow-sm border border-emerald-100 overflow-hidden">
           <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
             <h3 className="font-bold text-emerald-800 flex items-center gap-2">
               <CheckCircle2 size={18} /> New Fixes
             </h3>
             <span className="bg-white text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-emerald-100">{fixes.length}</span>
           </div>
           <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
             {fixes.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No new fixes in this run.</div>
             ) : (
               fixes.map((item, idx) => (
                 <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="font-medium text-slate-800">{item.testCaseName}</div>
                    <div className="text-xs text-slate-500 mt-1 mb-2">{item.suite}</div>
                    <div className="flex items-center gap-3 text-sm">
                      <StatusBadge status={item.baseStatus} mini />
                      <ArrowRight size={14} className="text-slate-300" />
                      <StatusBadge status={item.targetStatus} mini />
                    </div>
                 </div>
               ))
             )}
           </div>
        </div>
      </div>
    </div>
  );
};