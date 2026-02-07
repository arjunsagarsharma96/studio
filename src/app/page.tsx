
"use client";

import React, { useState, useEffect } from "react";
import { generateHistoricalData, PricePoint } from "@/lib/historical-data";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { ForecastPanel } from "@/components/dashboard/forecast-panel";
import { ModelStorage, SavedModel } from "@/components/dashboard/model-storage";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Coins, 
  Download, 
  HelpCircle, 
  LayoutDashboard, 
  Settings, 
  Save,
  Activity,
  ArrowUpRight,
  TrendingUp,
  LineChart as LineChartIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function GoldSightDashboard() {
  const [historicalData, setHistoricalData] = useState<PricePoint[]>([]);
  const [forecastData, setForecastData] = useState<PricePoint[]>([]);
  const [forecastSummary, setForecastSummary] = useState<string>("");
  const [aiTrends, setAiTrends] = useState<string>("");
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, []);

  const handleForecastGenerated = (data: PricePoint[], summary: string, trends: string) => {
    setForecastData(data);
    setForecastSummary(summary);
    setAiTrends(trends);
  };

  const handleSaveModel = () => {
    if (forecastData.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Save",
        description: "Generate a forecast before saving a model.",
      });
      return;
    }
    const newModel: SavedModel = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Gold-2026-Project-${savedModels.length + 1}`,
      date: new Date().toLocaleDateString(),
      horizon: 2026
    };
    setSavedModels([newModel, ...savedModels]);
    toast({
      title: "Model Saved",
      description: "Custom model added to your library.",
    });
  };

  const handleDeleteModel = (id: string) => {
    setSavedModels(savedModels.filter(m => m.id !== id));
  };

  const latestPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].price : 0;
  const prevPrice = historicalData.length > 1 ? historicalData[historicalData.length - 2].price : 0;
  const priceChange = latestPrice - prevPrice;
  const priceChangePercent = (priceChange / prevPrice) * 100;

  return (
    <div className="flex min-h-screen bg-[#191970] font-body text-foreground">
      {/* Sidebar - Simulated Navigation */}
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl hidden lg:flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 gold-gradient rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Coins className="text-primary-foreground h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight gold-text-gradient">GoldSight</h1>
          </div>

          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-primary bg-primary/10">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Activity className="mr-3 h-5 w-5" />
              Live Feed
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <LineChartIcon className="mr-3 h-5 w-5" />
              Backtesting
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="mt-auto p-4">
          <ModelStorage 
            models={savedModels} 
            onDelete={handleDeleteModel} 
            onSelect={(m) => toast({ title: "Model Loaded", description: `Active model: ${m.name}` })}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-accent border-accent/30 font-mono">XAU / USD</Badge>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium text-muted-foreground">Market Open</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-border hover:bg-muted" onClick={handleSaveModel}>
              <Save className="mr-2 h-4 w-4 text-primary" />
              Save Model
            </Button>
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Market Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/40 border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Spot Price</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-bold">${latestPrice.toLocaleString()}</h3>
                  <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <ArrowUpRight className={`h-4 w-4 ${priceChange < 0 && 'rotate-90'}`} />
                    {priceChangePercent.toFixed(2)}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">AI 2026 Target</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-2xl font-bold text-accent">
                    {forecastData.length > 0 ? `$${forecastData[forecastData.length - 1].price.toLocaleString()}` : "---"}
                  </h3>
                  {forecastData.length > 0 && <TrendingUp className="h-5 w-5 text-accent" />}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Resistance Level</p>
                <h3 className="text-2xl font-bold">$2,845.50</h3>
              </CardContent>
            </Card>

            <Card className="bg-card/40 border-border">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-1">Market Sentiment</p>
                <h3 className="text-2xl font-bold text-primary">Strong Bullish</h3>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/30 border-border backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Price Performance (since 2008)</CardTitle>
                    <p className="text-xs text-muted-foreground">Historical data with current AI projection overlays</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none">1M</Badge>
                    <Badge variant="outline" className="border-border">1Y</Badge>
                    <Badge variant="outline" className="border-border">MAX</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <HistoricalChart historicalData={historicalData} forecastData={forecastData} />
                </CardContent>
              </Card>

              {aiTrends && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <TrendingUp className="h-5 w-5" />
                      AI Market Sentiment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                      {aiTrends}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <ForecastPanel 
                historicalData={historicalData} 
                onForecastGenerated={handleForecastGenerated} 
              />
              
              <Card className="bg-card/40 border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Project Highlights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {forecastSummary ? (
                    <div className="prose prose-sm prose-invert">
                      <p className="text-sm text-muted-foreground">
                        {forecastSummary}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Generate a forecast to see detailed analytical highlights here.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
