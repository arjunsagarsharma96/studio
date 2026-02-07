export interface PricePoint {
  date: string;
  price: number;
}

/**
 * Generates realistic historical XAUUSD data from 2008 to today.
 * Uses pivot points to simulate major market trends:
 * - 2008: ~$800
 * - 2011: ~$1900 (High)
 * - 2015: ~$1100 (Low)
 * - 2020: ~$2000 (Covid High)
 * - 2024/2025: ~$2600 - $2800 (Current range)
 */
export function generateHistoricalData(): PricePoint[] {
  const startDate = new Date(2008, 0, 1);
  const today = new Date();
  const data: PricePoint[] = [];

  let currentPrice = 850;
  const currentDate = new Date(startDate);

  // Helper to get target price based on year to simulate historical trends
  const getTargetPrice = (year: number) => {
    if (year <= 2011) return 1900;
    if (year <= 2015) return 1100;
    if (year <= 2018) return 1300;
    if (year <= 2020) return 2000;
    if (year <= 2023) return 2000;
    return 2750; // Current bull market target
  };

  while (currentDate <= today) {
    const year = currentDate.getFullYear();
    const target = getTargetPrice(year);
    
    // Calculate a drift towards the target price
    const drift = (target - currentPrice) / 500; 
    const volatility = (Math.random() - 0.5) * 15;
    
    currentPrice += drift + volatility;

    // Minimum price floor
    if (currentPrice < 700) currentPrice = 700;

    // To keep the chart performant, we use monthly points for older data 
    // and daily points for the last 60 days to satisfy the "recent date" requirement.
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

  // Explicitly ensure the last point is "Today" if not already present
  const lastDateStr = today.toISOString().split('T')[0];
  if (data[data.length - 1].date !== lastDateStr) {
    data.push({
      date: lastDateStr,
      price: parseFloat(currentPrice.toFixed(2)),
    });
  }

  return data;
}

export function pricePointsToCSV(data: PricePoint[]): string {
  const header = "Date,Price\n";
  const rows = data.map(p => `${p.date},${p.price}`).join("\n");
  return header + rows;
}

export function parseCSVToPricePoints(csv: string): PricePoint[] {
  const lines = csv.trim().split("\n");
  if (lines.length <= 1) return [];
  const dataLines = lines.slice(1); // Remove header
  return dataLines.map(line => {
    const [date, price] = line.split(",");
    return { date, price: parseFloat(price) };
  });
}
