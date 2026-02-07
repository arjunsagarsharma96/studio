
"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Save, History, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface SavedModel {
  id: string;
  name: string;
  date: string;
  horizon: number;
}

interface ModelStorageProps {
  models: SavedModel[];
  onDelete: (id: string) => void;
  onSelect: (model: SavedModel) => void;
}

export function ModelStorage({ models, onDelete, onSelect }: ModelStorageProps) {
  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="border-b border-border py-4 px-6">
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <History className="h-4 w-4" />
          Saved Models
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-6">
              <Save className="h-8 w-8 text-muted mb-2 opacity-20" />
              <p className="text-xs text-muted-foreground">No custom models saved yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {models.map((model) => (
                <div 
                  key={model.id} 
                  className="group flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelect(model)}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{model.date}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(model.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
