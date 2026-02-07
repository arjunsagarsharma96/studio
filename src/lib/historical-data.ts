export interface PricePoint {
  date: string;
  price: number;
}

/**
 * Generates realistic historical XAUUSD data from 2015 to exactly Today.
 * Calibrated to reach the user's requested market high of ~$4,900.
 */
export function generateHistoricalData(): PricePoint[] {
  const startDate = new Date(2015, 0, 1);
  const today = new Date();
  const data: PricePoint[] = [];

  // Gold price was around $1,150-$1,200 in early 2015
  let currentPrice = 1180;
  const currentDate = new Date(startDate);

  // Helper to get target price based on year to simulate requested trends
  // Adjusted to reach ~$4,900 by late 2024/early 2025
  const getTargetPrice = (year: number) => {
    if (year <= 2016) return 1250;
    if (year <= 2018) return 1350;
    if (year <= 2020) return 2050;
    if (year <= 2022) return 1950;
    if (year <= 2023) return 2200;
    if (year <= 2024) return 4200;
    return 4900; // Targeting user's requested market level for current day
  };

  while (currentDate <= today) {
    const year = currentDate.getFullYear();
    const target = getTargetPrice(year);
    
    // Calculate a drift towards the target price
    const drift = (target - currentPrice) / 365; 
    const volatility = (Math.random() - 0.5) * 12; // Reduced volatility for a smoother trend
    
    currentPrice += drift + volatility;

    // Minimum price floor
    if (currentPrice < 1000) currentPrice = 1000;

    // We only need monthly points for performance in older history
    // But daily points for the most recent 60 days to ensure "up to date" looks crisp
    const diffDays = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 60 || currentDate.getDate() === 1) {
      data.push({
        date: currentDate.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2)),
      });
    }

    // Increment date
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // FORCE the final point to be Today's actual date to solve the "old data" issue
  const lastDateStr = today.toISOString().split('T')[0];
  const lastPointIndex = data.findIndex(p => p.date === lastDateStr);
  
  if (lastPointIndex === -1) {
    data.push({
      date: lastDateStr,
      price: parseFloat(currentPrice.toFixed(2)),
    });
  } else {
    // Ensure the last point is exactly the current day's price
    data[lastPointIndex].price = parseFloat(currentPrice.toFixed(2));
  }

  return data;
}

export function pricePointsToCSV(data: PricePoint[]): string {
  const header = "Date,Price\n";
  const rows = data.map(p => `${p.date},${p.price}`).join("\n");
  return header + rows;
}

export function parseCSVToPricePoints(csv: string): PricePoint[] {
  if (!csv) return [];
  const lines = csv.trim().split("\n");
  if (lines.length <= 1) return [];
  const dataLines = lines.slice(1); // Remove header
  return dataLines.map(line => {
    const parts = line.split(",");
    if (parts.length < 2) return null;
    const [date, price] = parts;
    return { date, price: parseFloat(price) };
  }).filter(p => p !== null) as PricePoint[];
}
