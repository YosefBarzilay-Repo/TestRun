import React, { useState, useMemo } from 'react';
import { TestRun, TestResult, TestStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Search, Filter, Bug, Bot, X, ArrowUpDown, ArrowUp, ArrowDown, Download, SlidersHorizontal } from 'lucide-react';
import { analyzeFailure } from '../services/geminiService';

interface Props {
  run: TestRun;
}

type SortKey = keyof TestResult | 'statusWeight';
type SortDirection = 'asc' | 'desc';

export const TestRunDashboard: React.FC<Props> = ({ run }) => {
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'ALL'>('ALL');
  const [suiteFilter, setSuiteFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'statusWeight', direction: 'asc' });
  const [selectedFailure, setSelectedFailure] = useState<TestResult | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract unique suites for dropdown
  const suites = useMemo(() => {
    return Array.from(new Set(run.results.map(r => r.suite))).sort();
  }, [run]);

  // Status weight for sorting
  const getStatusWeight = (status: TestStatus) => {
    switch(status) {
      case TestStatus.FAIL: return 0;
      case TestStatus.FLAKY: return 1;
      case TestStatus.PASS: return 2;
      case TestStatus.NOT_RUN: return 3;
      default: return 4;
    }
  };

  const processedTests = useMemo(() => {
    let tests = run.results;

    // 1. Filter
    tests = tests.filter(t => {
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      const matchesSuite = suiteFilter === 'ALL' || t.suite === suiteFilter;
      const matchesSearch = t.testCaseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.suite.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSuite && matchesSearch;
    });

    // 2. Sort
    tests = [...tests].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof TestResult];
      let bValue: any = b[sortConfig.key as keyof TestResult];

      if (sortConfig.key === 'statusWeight') {
        aValue = getStatusWeight(a.status);
        bValue = getStatusWeight(b.status);
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return tests;
  }, [run, statusFilter, suiteFilter, searchTerm, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAnalyze = async (test: TestResult) => {
    if (!test.errorLog) return;
    setIsAnalyzing(true);
    setAnalysis('');
    const result = await analyzeFailure(test.testCaseName, test.errorLog);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const chartData = [
    { name: 'Pass', value: run.summary.passed, color: '#10b981' },
    { name: 'Fail', value: run.summary.failed, color: '#f43f5e' },
    { name: 'Not Run', value: run.summary.skipped, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown size={14} className="text-slate-300 ml-1" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="text-primary-600 ml-1" />
      : <ArrowDown size={14} className="text-primary-600 ml-1" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row - Simple Clean Look */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white p-5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total</span>
              <div className="text-3xl font-bold text-slate-800 mt-1">{run.summary.total}</div>
           </div>
           <div className="bg-white p-5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Passed</span>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                {run.summary.passed} <span className="text-sm font-normal text-slate-400">({((run.summary.passed / run.summary.total) * 100).toFixed(0)}%)</span>
              </div>
           </div>
           <div className="bg-white p-5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Failed</span>
              <div className="text-3xl font-bold text-rose-600 mt-1">{run.summary.failed}</div>
           </div>
           <div className="bg-white p-5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Skipped</span>
              <div className="text-3xl font-bold text-slate-400 mt-1">{run.summary.skipped}</div>
           </div>
      </div>

      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center shadow-sm">
        
        {/* Left Side: Filters */}
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search test name..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
             <div className="relative min-w-[140px]">
               <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <select 
                 className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer hover:bg-slate-50"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value as any)}
               >
                 <option value="ALL">All Statuses</option>
                 <option value={TestStatus.PASS}>Pass</option>
                 <option value={TestStatus.FAIL}>Fail</option>
                 <option value={TestStatus.NOT_RUN}>Not Run</option>
                 <option value={TestStatus.FLAKY}>Flaky</option>
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <ArrowUpDown size={12} className="text-slate-400" />
               </div>
             </div>

             <div className="relative min-w-[140px]">
               <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <select 
                 className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-primary-500 appearance-none cursor-pointer hover:bg-slate-50"
                 value={suiteFilter}
                 onChange={(e) => setSuiteFilter(e.target.value)}
               >
                 <option value="ALL">All Suites</option>
                 {suites.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <ArrowUpDown size={12} className="text-slate-400" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex gap-2 self-end xl:self-auto">
          <button 
             onClick={() => alert("Generating PDF Report...")}
             className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
             title="Export Report"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                  onClick={() => handleSort('statusWeight')}
                >
                  <div className="flex items-center">
                    Status <SortIcon columnKey="statusWeight" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('testCaseName')}
                >
                  <div className="flex items-center">
                    Test Case <SortIcon columnKey="testCaseName" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('suite')}
                >
                  <div className="flex items-center">
                    Suite <SortIcon columnKey="suite" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none"
                  onClick={() => handleSort('durationMs')}
                >
                  <div className="flex items-center">
                    Duration <SortIcon columnKey="durationMs" />
                  </div>
                </th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedTests.map((test) => (
                <tr key={test.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3">
                    <StatusBadge status={test.status} />
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-medium text-slate-800">{test.testCaseName}</div>
                    {test.errorLog && (
                      <div className="text-xs text-rose-500 font-mono mt-0.5 truncate max-w-[200px] opacity-80">
                        {test.errorLog.split('\n')[0].substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{test.suite}</td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{(test.durationMs / 1000).toFixed(2)}s</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {test.status === TestStatus.FAIL && (
                        <>
                          <button 
                            onClick={() => setSelectedFailure(test)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                            title="AI Analysis"
                          >
                            <Bot size={16} />
                          </button>
                          <button 
                             onClick={() => alert(`Bug attached for ${test.testCaseName}`)}
                             className={`p-1.5 hover:bg-slate-100 rounded-md transition-colors ${test.bugTicketId ? 'text-green-600' : 'text-slate-400'}`}
                             title={test.bugTicketId ? `Bug: ${test.bugTicketId}` : "Attach Bug"}
                          >
                            <Bug size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {processedTests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-400 bg-slate-50/30">
                    <div className="flex flex-col items-center gap-2">
                      <Filter size={24} className="opacity-20" />
                      <p>No tests found matching your criteria.</p>
                      <button 
                        onClick={() => { setStatusFilter('ALL'); setSuiteFilter('ALL'); setSearchTerm(''); }}
                        className="text-primary-600 text-sm hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Modal - Clean Design */}
      {selectedFailure && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Bot className="text-primary-600" /> Failure Analysis
                </h3>
                <p className="text-xs text-slate-500 mt-1">{selectedFailure.testCaseName}</p>
              </div>
              <button 
                onClick={() => { setSelectedFailure(null); setAnalysis(''); }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-white flex-1">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Stack Trace
                </h4>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <pre className="text-xs text-rose-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {selectedFailure.errorLog}
                  </pre>
                </div>
              </div>
              
              {!analysis && !isAnalyzing && (
                 <button 
                  onClick={() => handleAnalyze(selectedFailure)}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm shadow-md shadow-primary-200 transition-all flex items-center justify-center gap-2"
                 >
                   <Bot size={18} /> Analyze with Gemini AI
                 </button>
              )}

              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary-600 mb-3"></div>
                  <span className="text-sm font-medium">Analyzing failure pattern...</span>
                </div>
              )}

              {analysis && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Bot size={14} /> AI Insights
                  </h4>
                  <div className="bg-primary-50 border border-primary-100 rounded-lg p-5">
                    <div className="prose prose-sm prose-slate text-slate-700 max-w-none">
                      <div className="whitespace-pre-line leading-relaxed">{analysis}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};