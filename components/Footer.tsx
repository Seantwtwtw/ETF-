import React, { useEffect, useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-slate-800 pt-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        
        <div>
          <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
            <Info size={16} className="text-blue-500"/> DCA (平均成本法)
          </h4>
          <p className="text-slate-500 leading-relaxed">
            平均成本法 (Dollar-Cost Averaging) 是一種投資策略，投資者將總投資金額分攤在定期購買目標資產上，以減少市場波動對整體購買成本的影響。
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
            <Info size={16} className="text-green-500"/> 股息再投入
          </h4>
          <p className="text-slate-500 leading-relaxed">
            不領取現金股息，而是用股息購買更多資產。在策略二中，我們模擬「智慧再投入」，將高股息資產 (0056) 的股息分散投資於成長型 (2330) 和市值型 (0050) 資產。
          </p>
        </div>

        <div>
          <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
            <HelpCircle size={16} className="text-purple-500"/> 波動率與 Beta
          </h4>
          <p className="text-slate-500 leading-relaxed">
            <strong>年化波動率：</strong> 風險的衡量標準。百分比越高代表價格波動越大。<br/>
            <strong>Beta：</strong> 衡量投資組合相對於市場 (0050) 的波動程度。Beta &gt; 1 代表波動大於市場；Beta &lt; 1 代表波動小於市場。
          </p>
        </div>

      </div>
      <div className="mt-8 text-center text-slate-600 text-xs">
        <p>免責聲明：此為使用歷史數據進行的模擬，僅供教育用途。過去績效不代表未來表現。</p>
      </div>
    </footer>
  );
};

export default Footer;