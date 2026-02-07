'use server';

/**
 * @fileOverview Flow for generating XAUUSD price forecasts up to 2026 based on historical data.
 *
 * - generatePriceForecast - A function that handles the generation of XAUUSD price forecasts.
 * - GeneratePriceForecastInput - The input type for the generatePriceForecast function.
 * - GeneratePriceForecastOutput - The return type for the generatePriceForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePriceForecastInputSchema = z.object({
  historicalData: z
    .string()
    .describe('Historical XAUUSD price data in CSV format.'),
  forecastHorizon: z
    .number()
    .describe('The number of years into the future to forecast (up to 2026).'),
});

export type GeneratePriceForecastInput = z.infer<typeof GeneratePriceForecastInputSchema>;

const GeneratePriceForecastOutputSchema = z.object({
  forecastData: z
    .string()
    .describe('XAUUSD price forecast data in CSV format.'),
  summary: z
    .string()
    .describe('A summary of the XAUUSD price forecast.'),
});

export type GeneratePriceForecastOutput = z.infer<typeof GeneratePriceForecastOutputSchema>;

export async function generatePriceForecast(
  input: GeneratePriceForecastInput
): Promise<GeneratePriceForecastOutput> {
  return generatePriceForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePriceForecastPrompt',
  input: {schema: GeneratePriceForecastInputSchema},
  output: {schema: GeneratePriceForecastOutputSchema},
  prompt: `You are an expert financial analyst specializing in XAUUSD price forecasting.

  Based on the provided historical XAUUSD price data (sourced from the TradingView Advanced Data Feed), generate a price forecast up to the year {{{forecastHorizon}}}.
  
  CRITICAL CONTEXT FROM TRADINGVIEW:
  - Current Spot Price: $4,964 (Stable Support).
  - All-Time High (ATH): $5,602 (Primary Resistance).
  - The model should strictly respect the current baseline at $4,964 as the starting point for all projections.

  TradingView Historical Dataset (CSV):\n{{{historicalData}}}

  Provide the forecast data in CSV format with columns Date and Price. Use monthly intervals for the forecast.
  Also, include a brief summary explaining the AI's reasoning for the trajectory starting from the $4,964 level, considering global economic factors and technical indicators.
  `,
});

const generatePriceForecastFlow = ai.defineFlow(
  {
    name: 'generatePriceForecastFlow',
    inputSchema: GeneratePriceForecastInputSchema,
    outputSchema: GeneratePriceForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
