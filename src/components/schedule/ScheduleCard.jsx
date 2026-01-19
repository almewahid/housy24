import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User, CheckCircle2 } from "lucide-react";

const categoryColors = {
  "حفظ قرآن": { bg: "bg-emerald-100", text: "text-emerald-700", icon: "📖" },
  "مذاكرة": { bg: "bg-blue-100", text: "text-blue-700", icon: "📚" },
  "دروس خصوصية": { bg: "bg-purple-100", text: "text-purple-700", icon: "👨‍🏫" },
  "مدرسة": { bg: "bg-amber-100", text: "text-amber-700", icon: "🏫" },
  "واجبات": { bg: "bg-orange-100", text: "text-orange-700", icon: "✏️" },
  "رياضة": { bg: "bg-rose-100", text: "text-rose-700", icon: "⚽" },
  "لياقة": { bg: "bg-cyan-100", text: "text-cyan-700", icon: "💪" },
  "أخرى": { bg: "bg-gray-100", text: "text-gray-700", icon: "📋" }
};

export default function ScheduleCard({ schedule, onClick, compact = false }) {
  const cat = categoryColors[schedule.category] || categoryColors["أخرى"];

  if (compact) {
    return (
      <div 
        className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-all ${cat.bg} ${schedule.completed ? 'opacity-50' : ''}`}
        onClick={() => onClick(schedule)}
        style={{ borderRight: `4px solid ${schedule.color || '#3b82f6'}` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${schedule.completed ? 'line-through' : ''}`}>
              {schedule.title}
            </p>
            <p className="text-xs text-slate-500">
              {schedule.start_time} - {schedule.end_time}
            </p>
          </div>
          {schedule.completed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        </div>
      </div>
    );
  }

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm ${schedule.completed ? 'opacity-60' : ''}`}
      onClick={() => onClick(schedule)}
      style={{ borderRight: `4px solid ${schedule.color || '#3b82f6'}` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <h3 className={`font-semibold text-slate-800 ${schedule.completed ? 'line-through' : ''}`}>
                {schedule.title}
              </h3>
              <Badge className={`${cat.bg} ${cat.text} mt-1`}>{schedule.category}</Badge>
            </div>
          </div>
          {schedule.completed && (
            <Badge className="bg-emerald-100 text-emerald-700">مكتمل</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{schedule.child_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{schedule.start_time} - {schedule.end_time}</span>
          </div>
          {schedule.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{schedule.location}</span>
            </div>
          )}
        </div>

        {schedule.day_of_week && (
          <div className="mt-2">
            <Badge variant="outline">{schedule.day_of_week}</Badge>
            {schedule.is_recurring && (
              <span className="text-xs text-slate-400 mr-2">متكرر</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}