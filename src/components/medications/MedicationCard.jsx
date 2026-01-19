import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pill, Clock, Calendar, Edit, Trash2, Bell, User } from "lucide-react";

const timingColors = {
  "قبل الأكل": "bg-orange-100 text-orange-700",
  "بعد الأكل": "bg-green-100 text-green-700",
  "مع الأكل": "bg-blue-100 text-blue-700",
  "صباحاً": "bg-yellow-100 text-yellow-700",
  "مساءً": "bg-purple-100 text-purple-700",
  "عند النوم": "bg-indigo-100 text-indigo-700",
  "أي وقت": "bg-slate-100 text-slate-700"
};

const frequencyIcons = {
  "يومي": "📅",
  "كل عدة ساعات": "⏰",
  "أسبوعي": "📆",
  "عند الحاجة": "💊"
};

export default function MedicationCard({ medication, onEdit, onDelete }) {
  const formatTimes = () => {
    if (medication.times_per_day?.length > 0) {
      return medication.times_per_day.join(' • ');
    }
    if (medication.interval_hours) {
      return `كل ${medication.interval_hours} ساعات`;
    }
    return medication.timing;
  };

  return (
    <Card className="bg-white/90 border-0 shadow-md hover:shadow-lg transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
              <Pill className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{medication.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <User className="w-3 h-3" />
                <span>{medication.family_member}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {/* Dosage */}
          {medication.dosage && (
            <p className="text-sm text-slate-600">الجرعة: {medication.dosage}</p>
          )}

          {/* Frequency & Timing */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-rose-50 text-rose-700">
              {frequencyIcons[medication.frequency_type]} {medication.frequency_type}
            </Badge>
            {medication.timing && (
              <Badge className={timingColors[medication.timing]}>
                {medication.timing}
              </Badge>
            )}
          </div>

          {/* Times */}
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{formatTimes()}</span>
          </div>

          {/* Days of week */}
          {medication.days_of_week?.length > 0 && medication.days_of_week.length < 7 && (
            <div className="flex gap-1 flex-wrap">
              {medication.days_of_week.map(day => (
                <Badge key={day} variant="outline" className="text-xs">{day}</Badge>
              ))}
            </div>
          )}

          {/* Quantity remaining */}
          {medication.quantity_remaining !== undefined && medication.quantity_remaining !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">الكمية المتبقية:</span>
              <Badge className={medication.quantity_remaining <= 5 ? "bg-red-100 text-red-700" : "bg-slate-100"}>
                {medication.quantity_remaining}
              </Badge>
            </div>
          )}

          {/* Reminder */}
          {medication.reminder_enabled && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Bell className="w-3 h-3" />
              <span>التذكير مفعّل</span>
            </div>
          )}

          {/* Notes */}
          {medication.notes && (
            <p className="text-xs text-slate-400 mt-2 pt-2 border-t">{medication.notes}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}