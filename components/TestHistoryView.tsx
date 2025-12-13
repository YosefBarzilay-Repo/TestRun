import React, { useState } from 'react';
import { TestRun, TestCase, TestStatus } from '../types';
import { MOCK_RUNS, ALL_TEST_CASES } from '../constants';
import { StatusBadge } from './StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, ChevronRight } from 'lucide-react';

interface Props {
  initialTestCaseId?: string;
}

export const TestHistoryView: React.FC<Props> = ({ initialTestCaseId }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(initialTestCaseId || ALL_TEST_CASES[0].id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCase = ALL_TEST_CASES.find(c => c.id === selectedCaseId);

  // Compile history for selected case
  const historyData = MOCK_RUNS.map(run => {
    const result = run.results.find(r => r.testCaseId === selectedCaseId);
    return {
      runName: run.name.replace('Nightly Run ', ''),
      status: result?.status || TestStatus.NOT_RUN,
      duration: result?.durationMs || 0,
      timestamp: run.timestamp,
    };
  });

  // Calculate stats
  const totalRuns = historyData.length;
  const passCount = historyData.filter(h => h.status === TestStatus.PASS).length;
  const failCount = historyData.filter(h => h.status === TestStatus.FAIL).length;
  const reliability = ((passCount / totalRuns) * 100).toFixed(0);

  const getBarColor = (status: TestStatus) => {
    switch (status) {
      case TestStatus.PASS: return '#0284c7'; // Primary 600
      case TestStatus.FAIL: return '#f43f5e';
      default: return '#cbd5e1';
    }
  };

  const filteredCases = ALL_TEST_CASES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800 mb-2 text-sm">Select Test Case</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter..."
              className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredCases.map(tc => (
            <button
              key={tc.id}
              onClick={() => setSelectedCaseId(tc.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center justify-between group ${
                selectedCaseId === tc.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-2">{tc.name}</span>
              {selectedCaseId === tc.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-1">
        {selectedCase ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">{selectedCase.name}</h2>
                   <p className="text-slate-500 text-sm mt-1">Suite: {selectedCase.suite} • ID: <span className="font-mono text-xs text-slate-400">{selectedCase.id}</span></p>
                 </div>
                 <div className="flex gap-8">
                   <div className="text-center">
                     <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Reliability</span>
                     <span className={`text-3xl font-bold ${Number(reliability) > 90 ? 'text-primary-600' : 'text-amber-500'}`}>
                       {reliability}%
                     </span>
                   </div>
                   <div className="text-center">
                     <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Failures</span>
                     <span className="text-3xl font-bold text-rose-500">{failCount}</span>
                   </div>
                 </div>
               </div>

               <div className="h-64 w-full">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Duration History</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData}>
                      <XAxis dataKey="runName" tick={{fontSize: 10, fill: '#64748b'}} />
                      <YAxis hide />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="duration" radius={[4, 4, 0, 0]}>
                        {historyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-700 text-sm">Detailed Log</h3>
               </div>
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 text-slate-500">
                   <tr>
                     <th className="px-6 py-3 font-medium">Run Date</th>
                     <th className="px-6 py-3 font-medium">Status</th>
                     <th className="px-6 py-3 font-medium">Duration</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {historyData.slice().reverse().map((run, idx) => (
                     <tr key={idx} className="hover:bg-slate-50">
                       <td className="px-6 py-3 text-slate-600">{new Date(run.timestamp).toLocaleDateString()}</td>
                       <td className="px-6 py-3"><StatusBadge status={run.status} mini /></td>
                       <td className="px-6 py-3 text-slate-600 font-mono text-xs">{(run.duration / 1000).toFixed(2)}s</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">Select a test case to view history</div>
        )}
      </div>
    </div>
  );
};