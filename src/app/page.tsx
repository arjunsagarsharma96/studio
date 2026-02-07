"use client";

import React, { useState, useEffect, useCallback } from "react";
import { generateHistoricalData, PricePoint } from "@/lib/historical-data";
import { HistoricalChart } from "@/components/dashboard/historical-chart";
import { ForecastPanel } from "@/components/dashboard/forecast-panel";
import { ModelStorage, SavedModel } from "@/components/dashboard/model-storage";
import TradingViewChart from "@/components/dashboard/trading-view-chart";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  Coins, 
  LayoutDashboard, 
  Save,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Globe,
  Clock,
  History,
  Calendar as CalendarIcon,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function GoldSightDashboard() {
  const [startYear, setStartYear] = useState(2015);
  const [forecastHorizon, setForecastHorizon] = useState(2026);
  const [historicalData, setHistoricalData] = useState<PricePoint[]>([]);
  const [forecastData, setForecastData] = useState<PricePoint[]>([]);
  const [forecastSummary, setForecastSummary] = useState<string>("");
  const [aiTrends, setAiTrends] = useState<string>("");
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { toast } = useToast();

  // Initialize and update historical data
  useEffect(() => {
    setHistoricalData(generateHistoricalData(startYear));
  }, [startYear]);

  const handleForecastGenerated = useCallback((data: PricePoint[], summary: string, trends: string) => {
    setForecastData(data);
    setForecastSummary(summary);
    setAiTrends(trends);
    setIsSyncing(false);
  }, []);

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
      name: `XAU-${forecastHorizon}-Strat-${savedModels.length + 1}`,
      date: new Date().toLocaleDateString(),
      horizon: forecastHorizon
    };
    setSavedModels([newModel, ...savedModels]);
    toast({
      title: "Model Saved",
      description: `Analysis for ${forecastHorizon} added to your library.`,
    });
  };

  const latestPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].price : 4964.50;
  const prevPrice = historicalData.length > 1 ? historicalData[historicalData.length - 2].price : 4964.00;
  const priceChange = latestPrice - prevPrice;
  const priceChangePercent = (priceChange / prevPrice) * 100;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-body text-foreground">
        <Sidebar collapsible="icon">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 gold-gradient rounded flex items-center justify-center shrink-0">
                <Coins className="text-primary-foreground h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight gold-text-gradient group-data-[collapsible=icon]:hidden">GoldSight</h1>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive tooltip="Dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Live Market">
                  <Activity className="h-5 w-5" />
                  <span>Live Market</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupLabel className="text-primary/70">Analysis Window</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-4 p-2">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Start Year</Label>
                  <Select value={startYear.toString()} onValueChange={(val) => setStartYear(parseInt(val))}>
                    <SelectTrigger className="h-8 bg-card border-border">
                      <SelectValue placeholder="Start Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2010, 2012, 2014, 2015, 2016, 2018, 2020].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Forecast Horizon</Label>
                  <Select value={forecastHorizon.toString()} onValueChange={(val) => setForecastHorizon(parseInt(val))}>
                    <SelectTrigger className="h-8 bg-card border-border">
                      <SelectValue placeholder="Horizon" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2025, 2026, 2027, 2028, 2030].map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
            <ModelStorage 
              models={savedModels} 
              onDelete={(id) => setSavedModels(savedModels.filter(m => m.id !== id))} 
              onSelect={(m) => toast({ title: "Model Loaded", description: `Active model: ${m.name}` })}
            />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <header className="h-16 border-b border-border bg-card/20 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2 mr-2" />
              <Badge variant="outline" className="text-accent border-accent/30 font-mono hidden sm:flex">XAU / USD</Badge>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{startYear} - {forecastHorizon}</span>
              </div>
              {isSyncing && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Generating Analysis...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-border hover:bg-muted" onClick={handleSaveModel}>
                <Save className="mr-2 h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Save Analysis</span>
              </Button>
            </div>
          </header>

          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Market Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/40 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-muted-foreground">Current Price</p>
                    <Clock className="h-3 w-3 text-muted-foreground" />
                  </div>
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">All-Time High</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-primary">$5,602.00</h3>
                    <History className="h-5 w-5 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">AI {forecastHorizon} Projection</p>
                  <div className="flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-accent">
                      {forecastData.length > 0 ? `$${forecastData[forecastData.length - 1].price.toLocaleString()}` : "---"}
                    </h3>
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 border-border">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Target Gain</p>
                  <h3 className="text-2xl font-bold">
                    {forecastData.length > 0 ? `${((forecastData[forecastData.length - 1].price / latestPrice - 1) * 100).toFixed(1)}%` : "0.0%"}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <Tabs defaultValue="ai" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-muted/50">
                      <TabsTrigger value="ai" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        AI Performance
                      </TabsTrigger>
                      <TabsTrigger value="live" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Live Feed (TradingView)
                      </TabsTrigger>
                    </TabsList>
                    <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                      Analyzing: {startYear} - {forecastHorizon}
                    </Badge>
                  </div>

                  <TabsContent value="ai" className="mt-0">
                    <Card className="bg-card/30 border-border backdrop-blur-sm overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Price Performance ({startYear} - {forecastHorizon})</CardTitle>
                        <p className="text-xs text-muted-foreground">Calibration: ATH $5,602 | Current $4,964</p>
                      </CardHeader>
                      <CardContent>
                        <HistoricalChart historicalData={historicalData} forecastData={forecastData} />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="live" className="mt-0">
                    <Card className="bg-card/30 border-border backdrop-blur-sm overflow-hidden h-[500px]">
                      <CardContent className="p-0 h-full">
                        <TradingViewChart />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {aiTrends && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-primary">
                        <TrendingUp className="h-5 w-5" />
                        AI Sentiment Analysis
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
                  forecastHorizon={forecastHorizon}
                  onForecastGenerated={handleForecastGenerated} 
                  autoTrigger={true}
                  onTriggering={() => setIsSyncing(true)}
                />
                
                <Card className="bg-card/40 border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Forecast Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {forecastSummary ? (
                      <div className="prose prose-sm prose-invert">
                        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                          {forecastSummary}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm px-4">Generate a {forecastHorizon} forecast to unlock detailed analysis.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
