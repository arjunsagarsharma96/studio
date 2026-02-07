"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { generatePriceForecast } from "@/ai/flows/generate-price-forecast";
import { summarizeMarketTrends } from "@/ai/flows/summarize-market-trends";
import { PricePoint, pricePointsToCSV, parseCSVToPricePoints } from "@/lib/historical-data";
import { Sparkles, Loader2, TrendingUp, AlertCircle, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ForecastPanelProps {
  historicalData: PricePoint[];
  forecastHorizon: number;
  onForecastGenerated: (data: PricePoint[], summary: string, aiSummary: string) => void;
  autoTrigger?: boolean;
  onTriggering?: () => void;
}

export function ForecastPanel({ 
  historicalData, 
  forecastHorizon, 
  onForecastGenerated, 
  autoTrigger = false,
  onTriggering 
}: ForecastPanelProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = useCallback(async () => {
    if (historicalData.length === 0 || loading) return;
    
    setLoading(true);
    onTriggering?.();
    
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
        title: "Intelligence Synced",
        description: `Market data from TradingView integrated with ${forecastHorizon} AI models.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "There was an error communicating with the AI model.",
      });
    } finally {
      setLoading(false);
    }
  }, [historicalData, forecastHorizon, loading, onForecastGenerated, onTriggering, toast]);

  // Automatic triggering logic
  useEffect(() => {
    if (autoTrigger && historicalData.length > 0) {
      const timer = setTimeout(() => {
        handleGenerate();
      }, 500); // Small debounce for year/horizon changes
      return () => clearTimeout(timer);
    }
  }, [historicalData, forecastHorizon, autoTrigger]);

  return (
    <Card className="bg-card/50 border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl gold-text-gradient flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            AI Intelligence
          </CardTitle>
          <Badge variant="outline" className="border-primary text-primary flex items-center gap-1">
            <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Auto-Sync
          </Badge>
        </div>
        <CardDescription>
          Autonomous analysis based on real-time TradingView feed and your parameters.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-muted flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Analysis window is currently {historicalData.length > 0 ? historicalData[0].date.split('-')[0] : '2015'} to {forecastHorizon}. Changes to the sidebar will re-calibrate AI.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Live Support</label>
            <p className="text-sm font-medium text-primary">$4,964 (Yesterday)</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Model Target</label>
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
          {loading ? "Syncing..." : `Recalculate ${forecastHorizon}`}
        </Button>
      </CardFooter>
    </Card>
  );
}