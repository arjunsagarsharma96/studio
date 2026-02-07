export interface PricePoint {
  date: string;
  price: number;
}

/**
 * Generates realistic historical XAUUSD data from a dynamic Start Year to exactly Today.
 * Calibrated to reach the user's requested market high of $5,602 and current price of $4,964.
 */
export function generateHistoricalData(startYear: number = 2015): PricePoint[] {
  const startDate = new Date(startYear, 0, 1);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  
  const data: PricePoint[] = [];

  // Starting price logic based on year
  let currentPrice = startYear < 2015 ? 1100 : 1180;
  const currentDate = new Date(startDate);

  // Milestone targets to shape the curve
  const getTargetPrice = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Historical context
    if (year <= 2016) return 1250;
    if (year <= 2018) return 1350;
    if (year <= 2020) return 1950;
    if (year <= 2022) return 1850;
    if (year <= 2023) return 2100;
    
    // 2024 - Reaching the requested All-Time High of 5602
    if (year === 2024 && month < 8) return 5602;
    
    // Present - Retracing to the requested price of 4964
    return 4964;
  };

  while (currentDate <= today) {
    const target = getTargetPrice(currentDate);
    
    // Calculate a drift towards the target price
    const drift = (target - currentPrice) / 180; 
    const volatility = (Math.random() - 0.5) * 15; 
    
    currentPrice += drift + volatility;

    // Minimum price floor
    if (currentPrice < 800) currentPrice = 800;

    // Filter for performance: Monthly for old history, daily for last 90 days
    const diffDays = Math.floor((today.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 90 || currentDate.getDate() === 1) {
      data.push({
        date: currentDate.toISOString().split('T')[0],
        price: parseFloat(currentPrice.toFixed(2)),
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // FORCE the penultimate point to be Yesterday's requested price of 4964
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const lastDateStr = today.toISOString().split('T')[0];
  
  const yIndex = data.findIndex(p => p.date === yesterdayStr);
  if (yIndex !== -1) {
    data[yIndex].price = 4964;
  } else if (currentDate > yesterday) {
    data.push({ date: yesterdayStr, price: 4964 });
  }

  data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Ensure the absolute last point is also close to current trading price
  if (data.length > 0 && data[data.length - 1].date !== lastDateStr) {
    data.push({ date: lastDateStr, price: 4964.50 });
  } else if (data.length > 0) {
    data[data.length - 1].price = 4964.50;
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
  const dataLines = lines.slice(1);
  return dataLines.map(line => {
    const parts = line.split(",");
    if (parts.length < 2) return null;
    const [date, price] = parts;
    return { date, price: parseFloat(price) };
  }).filter(p => p !== null) as PricePoint[];
}
