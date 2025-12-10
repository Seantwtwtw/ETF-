import React, { useState } from 'react';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import Footer from './components/Footer';
import RegistrationPage from './components/RegistrationPage';
import { BacktestResult, SimulationParams } from './types';
import { fetchMarketData } from './services/mockData';
import { runBacktest } from './services/backtest';
import { LineChart as IconChart, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRunBacktest = async (params: SimulationParams) => {
    setLoading(true);
    try {
      // 1. Fetch Data (Real CSV Parsed)
      const marketData = await fetchMarketData(params.startDate, params.endDate);
      
      // 2. Run Algo
      const results = runBacktest(params, marketData);
      
      setResult(results);
    } catch (error) {
      console.error("Backtest failed", error);
      alert("執行回測失敗，請重試。");
    } finally {
      setLoading(false);
    }
  };

  // If user is not registered, show Registration Page
  if (!userEmail) {
    return <RegistrationPage onRegister={setUserEmail} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
                <IconChart className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">QuantBacktest <span className="text-blue-500">Pro</span></h1>
                <p className="text-slate-400 text-sm mt-1">比較 定期定額 (DCA) 與 高股息再投入策略</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/50 py-1.5 px-3 rounded-full border border-slate-800">
              <UserCircle size={16} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-mono">{userEmail}</span>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <InputPanel onRunBacktest={handleRunBacktest} isLoading={loading} />
            
            {/* Strategy Explainer (Desktop only visual helper) */}
            <div className="hidden lg:block bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-slate-200 font-bold mb-4">策略邏輯</h3>
              <ul className="space-y-4 text-sm text-slate-400">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">S1</span>
                  <span>單純定期定額買入 <strong>0050</strong>。股息自動再投入 (DRIP)。</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">S2</span>
                  <span>買入 <strong>0056</strong>。股息根據您的比例配置，再投入於台積電 (2330) 與 0050。</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <ResultsPanel data={result} />
          </div>
          
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default App;