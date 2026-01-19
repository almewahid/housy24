import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, Sun, Calendar, Leaf, AlertTriangle } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const healthColors = {
  "ممتاز": "bg-emerald-100 text-emerald-700",
  "جيد": "bg-green-100 text-green-700",
  "يحتاج عناية": "bg-amber-100 text-amber-700",
  "مريض": "bg-red-100 text-red-700"
};

const sunlightIcons = {
  "ضوء مباشر": "☀️",
  "ضوء غير مباشر": "🌤️",
  "ظل جزئي": "⛅",
  "ظل كامل": "🌑"
};

export default function PlantCard({ plant, onClick }) {
  const needsWater = plant.next_watering && 
    (isPast(new Date(plant.next_watering)) || differenceInDays(new Date(plant.next_watering), new Date()) === 0);
  
  const daysUntilWater = plant.next_watering ? 
    differenceInDays(new Date(plant.next_watering), new Date()) : null;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 ${needsWater ? 'ring-2 ring-blue-300' : ''} bg-white/80 backdrop-blur-sm overflow-hidden`}
      onClick={() => onClick(plant)}
    >
      <div className="relative h-32 bg-gradient-to-br from-emerald-400 to-green-600">
        {plant.image_url ? (
          <img 
            src={plant.image_url} 
            alt={plant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-16 h-16 text-white/50" />
          </div>
        )}
        {needsWater && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white p-2 rounded-full animate-bounce">
            <Droplets className="w-4 h-4" />
          </div>
        )}
        <Badge className={`absolute top-2 right-2 ${healthColors[plant.health_status]}`}>
          {plant.health_status}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-1">{plant.name}</h3>
        {plant.species && (
          <p className="text-sm text-slate-500 mb-2">{plant.species}</p>
        )}
        
        <div className="flex items-center gap-3 text-sm mb-2">
          {plant.sunlight_needs && (
            <span className="flex items-center gap-1">
              {sunlightIcons[plant.sunlight_needs]}
              <span className="text-slate-500 text-xs">{plant.sunlight_needs}</span>
            </span>
          )}
          {plant.location && (
            <span className="text-slate-400 text-xs">📍 {plant.location}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className={`flex items-center gap-1 ${needsWater ? 'text-blue-600 font-medium' : 'text-slate-500'}`}>
            <Droplets className="w-4 h-4" />
            {needsWater ? (
              <span>يحتاج ري الآن!</span>
            ) : daysUntilWater !== null ? (
              <span>بعد {daysUntilWater} أيام</span>
            ) : (
              <span>{plant.watering_frequency}</span>
            )}
          </div>
          {plant.next_watering && (
            <span className="text-xs text-slate-400">
              {format(new Date(plant.next_watering), 'd MMM', { locale: ar })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}