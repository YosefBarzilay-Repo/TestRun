import React, { useState } from 'react';
import { MOCK_RUNS, ALL_TEST_CASES } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Zap, Activity } from 'lucide-react';

export const BenchmarkView: React.FC = () => {
  const [selectedSuite, setSelectedSuite] = useState<string>('Checkout');
  
  // Extract unique suites
  const suites = Array.from(new Set(ALL_TEST_CASES.map(c => c.suite)));

  // Prepare chart data: Average performance metric for the selected suite per run
  const chartData = MOCK_RUNS.map(run => {
    const suiteResults = run.results.filter(r => r.suite === selectedSuite && r.performanceMetric);
    if (suiteResults.length === 0) return null;

    const avgMetric = suiteResults.reduce((acc, curr) => acc + (curr.performanceMetric || 0), 0) / suiteResults.length;
    
    return {
      name: new Date(run.timestamp).toLocaleDateString(undefined, {month:'short', day: 'numeric'}),
      timestamp: run.timestamp,
      metric: Math.round(avgMetric),
      runId: run.id
    };
  }).filter(Boolean).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-primary-500" /> Performance Trend
            </h2>
            <p className="text-slate-500 text-sm mt-1">Average execution metric (ms) per run for selected suite.</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-600">Suite:</span>
             <select 
               className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 block p-2 outline-none cursor-pointer"
               value={selectedSuite}
               onChange={(e) => setSelectedSuite(e.target.value)}
             >
               {suites.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="metric" 
                name="Avg Latency (ms)" 
                stroke="#0284c7" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#0284c7', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
              <h4 className="text-xs font-bold text-primary-600 uppercase tracking-wide mb-1">Current Avg</h4>
              <p className="text-2xl font-bold text-primary-900">{chartData[chartData.length-1]?.metric} ms</p>
           </div>
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Baseline (10 runs ago)</h4>
              <p className="text-2xl font-bold text-slate-700">{chartData[0]?.metric} ms</p>
           </div>
           <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-1">Stability Score</h4>
              <p className="text-2xl font-bold text-emerald-800">98%</p>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Zap size={18} className="text-amber-500" /> Performance Anomalies
         </h3>
         <div className="space-y-3">
            {chartData.filter(d => d.metric > 1800).length === 0 ? (
               <p className="text-slate-500 text-sm">No significant performance spikes detected in the last 10 runs.</p>
            ) : (
               chartData.filter(d => d.metric > 1800).map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
                     <span className="font-medium text-amber-900">Spike detected on {d.name}</span>
                     <span className="font-bold text-amber-700">{d.metric}ms</span>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};