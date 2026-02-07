
export interface PricePoint {
  date: string;
  price: number;
}

export function generateHistoricalData(): PricePoint[] {
  const startYear = 2008;
  const currentYear = new Date().getFullYear();
  const data: PricePoint[] = [];

  // Start price in 2008 around $850
  let currentPrice = 850;

  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 1; month <= 12; month++) {
      // Add some realistic volatility
      const change = (Math.random() - 0.45) * 50; 
      currentPrice += change;
      
      // Ensure price doesn't drop below realistic levels
      if (currentPrice < 700) currentPrice = 700;

      data.push({
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
        price: parseFloat(currentPrice.toFixed(2)),
      });
      
      // Stop at current month
      if (year === currentYear && month === new Date().getMonth() + 1) break;
    }
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
  const dataLines = lines.slice(1); // Remove header
  return dataLines.map(line => {
    const [date, price] = line.split(",");
    return { date, price: parseFloat(price) };
  });
}
