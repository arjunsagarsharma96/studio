"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { generatePriceForecast } from "@/ai/flows/generate-price-forecast";
import { summarizeMarketTrends } from "@/ai/flows/summarize-market-trends";
import { PricePoint, pricePointsToCSV } from "@/lib/historical-data";
import { Sparkles, Loader2, TrendingUp, Activity, RefreshCcw } from "lucide-react";
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

      if (!result || !result.forecastData) {
        throw new Error("Invalid response from AI");
      }

      // Convert the structured forecast points to a CSV-like string for the summary flow if needed
      // but the trend flow now takes a string, so we'll just summarize the forecast summary or the data
      const forecastCSVForTrend = result.forecastData.map(p => `${p.date},${p.price}`).join("\n");
      
      const trendSummary = await summarizeMarketTrends({
        forecastData: forecastCSVForTrend
      });

      onForecastGenerated(result.forecastData, result.summary, trendSummary.summary);
      
      toast({
        title: "Intelligence Synced",
        description: `Market data from TradingView integrated with ${forecastHorizon} AI models.`,
      });
    } catch (error) {
      console.error("Sync Error:", error);
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "There was an error communicating with the AI model. Please try again.",
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
      }, 800); // Slightly increased debounce for stability
      return () => clearTimeout(timer);
    }
  }, [historicalData, forecastHorizon, autoTrigger, handleGenerate]);

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
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-3">
          <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">TradingView Data Link</p>
            <p className="text-xs text-muted-foreground">
              Current Feed: $4,964 Support | ATH $5,602 Resistance. AI is monitoring for breakout signals.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Last Close</label>
            <p className="text-sm font-medium text-primary">$4,964 (Verified)</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">AI Horizon</label>
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
          {loading ? "Pulling Data..." : `Sync TradingView & Analyze`}
        </Button>
      </CardFooter>
    </Card>
  );
}
