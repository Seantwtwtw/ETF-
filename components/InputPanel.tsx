import React, { useEffect, useState } from 'react';
import { SimulationParams } from '../types';
import { AlertCircle, Play } from 'lucide-react';

interface Props {
  onRunBacktest: (params: SimulationParams) => void;
  isLoading: boolean;
}

const InputPanel: React.FC<Props> = ({ onRunBacktest, isLoading }) => {
  // Local state for form fields
  const [params, setParams] = useState<SimulationParams>({
    initialPrincipal: 100000,
    monthlyContribution: 10000,
    startDate: '2023-01-01', // Updated default
    endDate: '2025-12-01',   // Updated default
    ratios: {
      tsmc: 30,
      etf0050: 70, // Default to 100% total
    }
  });

  const [error, setError] = useState<string | null>(null);

  const totalRatio = params.ratios.tsmc + params.ratios.etf0050;

  useEffect(() => {
    if (totalRatio !== 100) {
      setError(`總配置必須為 100%。目前：${totalRatio}%`);
    } else {
      setError(null);
    }
  }, [params.ratios, totalRatio]);

  const handleChange = (field: keyof SimulationParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleRatioChange = (field: keyof typeof params.ratios, value: number) => {
    setParams(prev => ({
      ...prev,
      ratios: { ...prev.ratios, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalRatio !== 100) return;
    onRunBacktest(params);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        參數設定
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Money & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">初始本金 (NT$)</label>
            <input 
              type="number" 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              value={params.initialPrincipal}
              onChange={(e) => handleChange('initialPrincipal', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">每月投入金額 (NT$)</label>
            <input 
              type="number" 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              value={params.monthlyContribution}
              onChange={(e) => handleChange('monthlyContribution', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">開始日期</label>
            <input 
              type="date" 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              value={params.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1">結束日期</label>
            <input 
              type="date" 
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 focus:border-blue-500 focus:outline-none"
              value={params.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Strategy 2 Ratios */}
        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
          <h3 className="text-slate-200 font-semibold mb-3 text-sm">策略二：0056 股息再投入配置</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1">台積電 (2330) %</label>
              <input 
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-slate-200"
                value={params.ratios.tsmc}
                onChange={(e) => handleRatioChange('tsmc', parseFloat(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">0050 ETF %</label>
              <input 
                type="number" 
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-center text-slate-200"
                value={params.ratios.etf0050}
                onChange={(e) => handleRatioChange('etf0050', parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          {/* Validation Error */}
          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-400 text-xs bg-red-950/20 p-2 rounded">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={!!error || isLoading}
          className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all
            ${error || isLoading 
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}`}
        >
          {isLoading ? '計算中...' : (
            <>
              <Play size={18} fill="currentColor" />
              執行回測
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default InputPanel;