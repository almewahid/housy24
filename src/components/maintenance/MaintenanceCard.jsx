import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors = {
  "مجدولة": "bg-blue-100 text-blue-700",
  "قيد التنفيذ": "bg-amber-100 text-amber-700",
  "مكتملة": "bg-emerald-100 text-emerald-700",
  "متأخرة": "bg-red-100 text-red-700"
};

const typeColors = {
  "تنظيف": "bg-cyan-100 text-cyan-700",
  "فحص": "bg-purple-100 text-purple-700",
  "تغيير قطع": "bg-orange-100 text-orange-700",
  "صيانة دورية": "bg-indigo-100 text-indigo-700",
  "إصلاح": "bg-red-100 text-red-700",
  "أخرى": "bg-gray-100 text-gray-700"
};

export default function MaintenanceCard({ maintenance, onClick }) {
  const isOverdue = maintenance.next_maintenance_date && 
    isPast(new Date(maintenance.next_maintenance_date)) && 
    maintenance.status !== 'مكتملة';
  
  const daysUntil = maintenance.next_maintenance_date ? 
    differenceInDays(new Date(maintenance.next_maintenance_date), new Date()) : null;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-0 ${isOverdue ? 'ring-2 ring-red-300' : ''} bg-white/80 backdrop-blur-sm`}
      onClick={() => onClick(maintenance)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-slate-100'}`}>
              <Wrench className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-slate-600'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{maintenance.item_name}</h3>
              <p className="text-sm text-slate-500">{maintenance.maintenance_type}</p>
            </div>
          </div>
          <Badge className={statusColors[isOverdue ? 'متأخرة' : maintenance.status]}>
            {isOverdue ? 'متأخرة' : maintenance.status}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={typeColors[maintenance.maintenance_type]}>
              {maintenance.frequency}
            </Badge>
            {maintenance.next_maintenance_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : daysUntil <= 3 ? 'text-amber-600' : 'text-slate-500'}`}>
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(maintenance.next_maintenance_date), 'd MMM', { locale: ar })}</span>
                {daysUntil !== null && daysUntil >= 0 && (
                  <span className="text-xs">({daysUntil === 0 ? 'اليوم' : `بعد ${daysUntil} أيام`})</span>
                )}
              </div>
            )}
          </div>
          {maintenance.cost && (
            <span className="text-emerald-600 font-medium">{maintenance.cost} ج.م</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}