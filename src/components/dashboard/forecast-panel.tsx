"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { generatePriceForecast } from "@/ai/flows/generate-price-forecast";
import { summarizeMarketTrends } from "@/ai/flows/summarize-market-trends";
import { PricePoint, pricePointsToCSV, parseCSVToPricePoints } from "@/lib/historical-data";
import { Sparkles, Save, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ForecastPanelProps {
  historicalData: PricePoint[];
  forecastHorizon: number;
  onForecastGenerated: (data: PricePoint[], summary: string, aiSummary: string) => void;
}

export function ForecastPanel({ historicalData, forecastHorizon, onForecastGenerated }: ForecastPanelProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleGenerate() {
    setLoading(true);
    try {
      const csvData = pricePointsToCSV(historicalData);
      
      const result = await generatePriceForecast({
        historicalData: csvData,
        forecastHorizon: forecastHorizon
      });

      const parsedForecast = parseCSVToPricePoints(result.forecastData);
      
      const trendSummary = await summarizeMarketTrends({
        forecastData: result.forecastData
      });

      onForecastGenerated(parsedForecast, result.summary, trendSummary.summary);
      
      toast({
        title: "Forecast Generated",
        description: `AI has successfully projected prices up to Dec ${forecastHorizon}.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "There was an error communicating with the AI model.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-card/50 border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl gold-text-gradient flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Projections
          </CardTitle>
          <Badge variant="outline" className="border-primary text-primary">v2.5 Flash</Badge>
        </div>
        <CardDescription>
          Project XAUUSD patterns into the future based on your selected window.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-muted flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Analysis is currently tuned to a target horizon of {forecastHorizon}. Changes to the sidebar will update this focus.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Historical Baseline</label>
            <p className="text-sm font-medium">{historicalData.length > 0 ? historicalData[0].date.split('-')[0] : '---'} - Present</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Target Exit</label>
            <p className="text-sm font-medium">Dec {forecastHorizon}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Generate {forecastHorizon} Forecast
        </Button>
      </CardFooter>
    </Card>
  );
}
