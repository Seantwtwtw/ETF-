import { BacktestResult, DailyResult, MarketData, PortfolioMetrics, SimulationParams } from '../types';

// Helper to calculate standard deviation
const calculateStdDev = (returns: number[]): number => {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance);
};

// Helper to calculate Beta (Covariance(P, M) / Variance(M))
const calculateBeta = (portfolioReturns: number[], marketReturns: number[]): number => {
  if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length < 2) return 0;
  
  const n = portfolioReturns.length;
  const meanP = portfolioReturns.reduce((a, b) => a + b, 0) / n;
  const meanM = marketReturns.reduce((a, b) => a + b, 0) / n;
  
  let covariance = 0;
  let varianceM = 0;
  
  for (let i = 0; i < n; i++) {
    covariance += (portfolioReturns[i] - meanP) * (marketReturns[i] - meanM);
    varianceM += Math.pow(marketReturns[i] - meanM, 2);
  }
  
  if (varianceM === 0) return 0;
  return covariance / varianceM;
};

export const runBacktest = (params: SimulationParams, data: MarketData): BacktestResult => {
  const { initialPrincipal, monthlyContribution, ratios } = params;
  
  // 1. Align Data by Date
  // Create a superset of all dates to ensure we handle gaps and misalignments
  const dateSet = new Set<string>();
  data.etf0050.forEach(d => dateSet.add(d.date));
  data.etf0056.forEach(d => dateSet.add(d.date));
  data.tsmc.forEach(d => dateSet.add(d.date));
  
  const sortedDates = Array.from(dateSet).sort();
  
  // Create Maps for O(1) access
  const map0050 = new Map(data.etf0050.map(d => [d.date, d]));
  const map0056 = new Map(data.etf0056.map(d => [d.date, d]));
  const mapTSMC = new Map(data.tsmc.map(d => [d.date, d]));

  const dailyResults: DailyResult[] = [];
  
  // --- Strategy 1 State (DCA 0050 + Dividend Reinvestment) ---
  let s1Shares = 0;
  let s1CashInvested = 0;
  
  // --- Strategy 2 State (0056 + Reinvest Dividends into TSMC/0050) ---
  let s2Shares0056 = 0;
  let s2Shares2330 = 0;
  let s2Shares0050 = 0;
  let s2CashBalance = 0; 
  let s2CashInvested = 0;

  // Track prices to handle gaps (use last known price)
  let lastP0050 = 0;
  let lastP0056 = 0;
  let lastP2330 = 0;

  // Track monthly contribution
  let lastContributionMonth = -1;

  for (let i = 0; i < sortedDates.length; i++) {
    const today = sortedDates[i];
    const currentMonth = parseInt(today.split('-')[1]);
    
    const pt0050 = map0050.get(today);
    const pt0056 = map0056.get(today);
    const pt2330 = mapTSMC.get(today);

    // Current Prices (or last known)
    const p0050 = pt0050 ? pt0050.price : lastP0050;
    const p0056 = pt0056 ? pt0056.price : lastP0056;
    const p2330 = pt2330 ? pt2330.price : lastP2330;

    // --- 0. SPLIT DETECTION (Critical Fix) ---
    // Detect if 0050 price drops significantly (e.g. > 55% drop) which implies a split
    // Only check if we have a *new* price point for 0050 (pt0050 exists) and we have a history (lastP0050 > 0)
    if (pt0050 && lastP0050 > 0) {
       // Threshold: < 45% of previous price means > 55% drop. 
       // A 4:1 split results in price becoming ~25% of original.
       if (p0050 < lastP0050 * 0.45) {
          const ratio = Math.round(lastP0050 / p0050);
          if (ratio > 1) {
             // Apply split adjustment to all holdings of this asset
             s1Shares *= ratio;
             s2Shares0050 *= ratio;
             // Note: We do not change invested cash, only share count.
             // The price `p0050` is already low, so Value (Shares * Price) remains roughly constant.
          }
       }
    }

    // Update Last Known Prices
    if (pt0050) lastP0050 = p0050;
    if (pt0056) lastP0056 = p0056;
    if (pt2330) lastP2330 = p2330;

    // Skip until we have valid prices for all assets to start the simulation
    if (p0050 === 0 || p0056 === 0 || p2330 === 0) continue;

    // Dividends (Only if data point exists for this day)
    const div0050 = pt0050?.dividend || 0;
    const div0056 = pt0056?.dividend || 0;
    const div2330 = pt2330?.dividend || 0;


    // --- 1. Initial Investment (First valid day) ---
    if (dailyResults.length === 0) {
      // S1: Buy 0050
      s1Shares += initialPrincipal / p0050;
      s1CashInvested += initialPrincipal;
      
      // S2: Buy 0056
      s2Shares0056 += initialPrincipal / p0056;
      s2CashInvested += initialPrincipal;
      
      lastContributionMonth = currentMonth;
    }

    // --- 2. Monthly Contribution ---
    // Trigger on the first processed day of a new month
    else if (currentMonth !== lastContributionMonth) {
      // S1: Buy 0050
      s1Shares += monthlyContribution / p0050;
      s1CashInvested += monthlyContribution;
      
      // S2: Buy 0056
      s2Shares0056 += monthlyContribution / p0056;
      s2CashInvested += monthlyContribution;
      
      lastContributionMonth = currentMonth;
    }

    // --- 3. Dividend Handling ---

    // Strategy 1: Reinvest 0050 dividends into 0050 (DRIP)
    if (div0050 > 0 && s1Shares > 0) {
      const s1DividendCash = s1Shares * div0050;
      s1Shares += s1DividendCash / p0050;
    }

    // Strategy 2: 
    // A. 0056 Dividends -> Split & Reinvest into TSMC / 0050
    if (div0056 > 0 && s2Shares0056 > 0) {
      const totalDividendCash = s2Shares0056 * div0056;
      
      const cashFor2330 = totalDividendCash * (ratios.tsmc / 100);
      const cashFor0050 = totalDividendCash * (ratios.etf0050 / 100);
      
      s2Shares2330 += cashFor2330 / p2330;
      s2Shares0050 += cashFor0050 / p0050;
    }

    // B. Reinvested Assets Dividends (TSMC & 0050 in S2) -> Keep as Cash
    if (div2330 > 0 && s2Shares2330 > 0) {
      s2CashBalance += s2Shares2330 * div2330;
    }
    if (div0050 > 0 && s2Shares0050 > 0) {
      s2CashBalance += s2Shares0050 * div0050;
    }

    // --- 4. Valuation ---
    const val1 = s1Shares * p0050;
    
    const val2 = (s2Shares0056 * p0056) + 
                 (s2Shares2330 * p2330) + 
                 (s2Shares0050 * p0050) + 
                 s2CashBalance;

    dailyResults.push({
      date: today,
      portfolio1Value: val1,
      portfolio2Value: val2,
      investedAmount: s1CashInvested
    });
  }

  // --- 5. Metrics Calculation ---
  const calculateMetrics = (values: number[], totalInvested: number, benchmarkValues: number[]): PortfolioMetrics => {
    if (values.length === 0) return { totalInvested, finalValue: 0, totalReturnPercent: 0, annualizedVolatility: 0, beta: 0 };

    const dailyReturns: number[] = [];
    const benchmarkReturns: number[] = [];
    
    // Calculate returns based on aligned daily data
    for (let i = 1; i < values.length; i++) {
      dailyReturns.push((values[i] / values[i-1]) - 1);
      benchmarkReturns.push((benchmarkValues[i] / benchmarkValues[i-1]) - 1);
    }
    
    const finalVal = values[values.length - 1];
    const totalReturn = (finalVal / totalInvested) - 1;
    const stdDev = calculateStdDev(dailyReturns);
    const annualVol = stdDev * Math.sqrt(252);
    const beta = calculateBeta(dailyReturns, benchmarkReturns);

    return {
      totalInvested,
      finalValue: finalVal,
      totalReturnPercent: totalReturn * 100,
      annualizedVolatility: annualVol * 100,
      beta: parseFloat(beta.toFixed(2))
    };
  };

  const s1Values = dailyResults.map(d => d.portfolio1Value);
  const s2Values = dailyResults.map(d => d.portfolio2Value);

  const metrics1 = calculateMetrics(s1Values, s1CashInvested, s1Values);
  const metrics2 = calculateMetrics(s2Values, s2CashInvested, s1Values);

  return {
    dailyData: dailyResults,
    metrics1,
    metrics2
  };
};