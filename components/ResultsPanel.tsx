import React from 'react';
import { BacktestResult, PortfolioMetrics } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, BarChart2, ShieldCheck, Zap, Info } from 'lucide-react';

interface Props {
  data: BacktestResult | null;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0
  }).format(val);
};

const formatPercent = (val: number) => `${val.toFixed(2)}%`;

const MetricCard: React.FC<{ 
  title: string; 
  metrics: PortfolioMetrics; 
  color: string; 
  label: string;
  isBenchmark?: boolean;
}> = ({ title, metrics, color, label, isBenchmark }) => {
  
  // Determine Risk Label based on Beta
  let riskLabel = "市場同步";
  let riskColor = "text-blue-400";
  let RiskIcon = Activity;

  if (!isBenchmark) {
    if (metrics.beta < 0.8) {
      riskLabel = "低波動 (防禦型)";
      riskColor = "text-green-400";
      RiskIcon = ShieldCheck;
    } else if (metrics.beta > 1.2) {
      riskLabel = "高波動 (積極型)";
      riskColor = "text-red-400";
      RiskIcon = Zap;
    } else {
      riskLabel = "中波動 (平衡型)";
      riskColor = "text-yellow-400";
    }
  }

  return (
    <div className={`border-t-4 ${color} bg-slate-900 p-5 rounded-xl shadow-lg flex flex-col h-full`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
          <div className="text-sm font-semibold text-slate-200 mt-1">{label}</div>
        </div>
        {!isBenchmark && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 ${riskColor}`}>
            <RiskIcon size={12} />
            {riskLabel}
          </div>
        )}
        {isBenchmark && (
           <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
             基準指標
           </div>
        )}
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-slate-100 tracking-tight">{formatCurrency(metrics.finalValue)}</div>
        <div className={`text-sm font-medium mt-1 ${metrics.totalReturnPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {metrics.totalReturnPercent >= 0 ? '+' : ''}{formatPercent(metrics.totalReturnPercent)} 總報酬
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6 border-t border-slate-800 pt-4 mt-auto">
        <div>
          <div className="text-slate-500 text-xs flex items-center gap-1 mb-1"><Activity size={12} /> 年化波動率</div>
          <div className="text-slate-300 font-mono text-lg">{formatPercent(metrics.annualizedVolatility)}</div>
        </div>
        <div>
          <div className="text-slate-500 text-xs flex items-center gap-1 mb-1"><BarChart2 size={12} /> Beta (vs 0050)</div>
          <div className="text-slate-300 font-mono text-lg flex items-center gap-2">
            {metrics.beta}
            {isBenchmark && <span className="text-xs text-slate-600">(恆為 1)</span>}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-800/50 text-xs text-slate-600 flex justify-between">
        <span>總投入成本</span>
        <span className="font-mono">{formatCurrency(metrics.totalInvested)}</span>
      </div>
    </div>
  );
};

const ResultsPanel: React.FC<Props> = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 border-dashed text-slate-500">
        <TrendingUp size={48} className="mb-4 opacity-20" />
        <p>輸入參數並執行模擬以查看結果。</p>
      </div>
    );
  }

  const diff = data.metrics2.totalReturnPercent - data.metrics1.totalReturnPercent;

  return (
    <div className="space-y-6">
      
      {/* Chart Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4 ml-2 mr-2">
          <h3 className="text-slate-100 font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500"/>
            資產價值走勢
          </h3>
          <div className="text-xs text-slate-500">
            區間: {data.dailyData[0].date} ~ {data.dailyData[data.dailyData.length-1].date}
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                tickMargin={10}
                minTickGap={40}
                tickFormatter={(val) => val.slice(2).replace(/-/g, '/')}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 11 }} 
                tickFormatter={(val) => `$${(val/10000).toFixed(0)}萬`}
                width={50}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle"/>
              <Line 
                name="S1: 定期定額 0050" 
                type="monotone" 
                dataKey="portfolio1Value" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line 
                name="S2: 0056 + 股息再投入" 
                type="monotone" 
                dataKey="portfolio2Value" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard 
          title="策略一" 
          label="定期定額 0050" 
          metrics={data.metrics1} 
          color="border-blue-500"
          isBenchmark={true}
        />
        <MetricCard 
          title="策略二" 
          label="0056 + 股息再投入" 
          metrics={data.metrics2} 
          color="border-green-500"
          isBenchmark={false}
        />
      </div>

      {/* Comparison Summary */}
      <div className={`rounded-xl p-5 flex flex-col md:flex-row items-center justify-between border ${diff > 0 ? 'bg-green-950/20 border-green-900/50' : 'bg-blue-950/20 border-blue-900/50'}`}>
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          <div className={`p-2 rounded-full ${diff > 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
             {diff > 0 ? <TrendingUp size={20} /> : <Info size={20} />}
          </div>
          <div>
            <div className="text-slate-200 font-bold">策略比較結論</div>
            <div className="text-slate-400 text-sm">
              {diff > 0 
                ? "策略二目前績效領先，且波動風險可能較低。" 
                : "策略一 (0050) 績效領先，反映市值型 ETF 在牛市中的成長優勢。"}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">淨報酬差異</div>
          <span className={`text-2xl font-bold ${diff > 0 ? 'text-green-400' : 'text-blue-400'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
          </span>
        </div>
      </div>

    </div>
  );
};

export default ResultsPanel;