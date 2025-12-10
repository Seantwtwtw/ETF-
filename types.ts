export interface SimulationParams {
  initialPrincipal: number;
  monthlyContribution: number;
  startDate: string;
  endDate: string;
  ratios: {
    tsmc: number;
    etf0050: number;
  };
}

export interface MarketDataPoint {
  date: string;
  price: number;
  dividend?: number; // Dividend per share
}

export interface MarketData {
  etf0050: MarketDataPoint[];
  etf0056: MarketDataPoint[];
  tsmc: MarketDataPoint[];
}

export interface DailyResult {
  date: string;
  portfolio1Value: number; // Strategy 1 Total Value
  portfolio2Value: number; // Strategy 2 Total Value
  investedAmount: number; // Cumulative Cash Invested
}

export interface PortfolioMetrics {
  totalInvested: number;
  finalValue: number;
  totalReturnPercent: number;
  annualizedVolatility: number;
  beta: number;
}

export interface BacktestResult {
  dailyData: DailyResult[];
  metrics1: PortfolioMetrics;
  metrics2: PortfolioMetrics;
}