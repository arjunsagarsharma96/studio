'use server';
/**
 * @fileOverview Summarizes key market trends and insights from generated forecasts.
 *
 * - summarizeMarketTrends - A function that summarizes market trends.
 * - SummarizeMarketTrendsInput - The input type for the summarizeMarketTrends function.
 * - SummarizeMarketTrendsOutput - The return type for the summarizeMarketTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketTrendsInputSchema = z.object({
  forecastData: z.string().describe('The XAUUSD price forecast data to summarize.'),
});
export type SummarizeMarketTrendsInput = z.infer<typeof SummarizeMarketTrendsInputSchema>;

const SummarizeMarketTrendsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key market trends and insights.'),
});
export type SummarizeMarketTrendsOutput = z.infer<typeof SummarizeMarketTrendsOutputSchema>;

export async function summarizeMarketTrends(input: SummarizeMarketTrendsInput): Promise<SummarizeMarketTrendsOutput> {
  return summarizeMarketTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMarketTrendsPrompt',
  input: {schema: SummarizeMarketTrendsInputSchema},
  output: {schema: SummarizeMarketTrendsOutputSchema},
  prompt: `You are an expert financial analyst specializing in summarizing market trends for XAUUSD (Gold).\
  Based on the following forecast data, provide a concise summary of the key market trends and insights, highlighting potential opportunities and risks.\
  Forecast Data: {{{forecastData}}}`,
});

const summarizeMarketTrendsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketTrendsFlow',
    inputSchema: SummarizeMarketTrendsInputSchema,
    outputSchema: SummarizeMarketTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
