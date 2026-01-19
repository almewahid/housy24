import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Calendar, Shield, Wrench } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { ar } from "date-fns/locale";

export default function UpcomingAlertsReport({ inventory, maintenance }) {
  // Warranty alerts
  const warrantyAlerts = inventory
    .filter(item => item.warranty_expiry)
    .map(item => ({
      type: 'warranty',
      name: item.name,
      date: item.warranty_expiry,
      daysLeft: differenceInDays(new Date(item.warranty_expiry), new Date()),
      isPast: isPast(new Date(item.warranty_expiry))
    }))
    .filter(alert => alert.daysLeft <= 90)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Maintenance alerts
  const maintenanceAlerts = maintenance
    .filter(m => m.next_maintenance_date && m.status !== 'مكتملة')
    .map(m => ({
      type: 'maintenance',
      name: m.item_name,
      maintenanceType: m.maintenance_type,
      date: m.next_maintenance_date,
      daysLeft: differenceInDays(new Date(m.next_maintenance_date), new Date()),
      isPast: isPast(new Date(m.next_maintenance_date))
    }))
    .filter(alert => alert.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const allAlerts = [
    ...warrantyAlerts.map(a => ({ ...a, priority: a.isPast ? 0 : a.daysLeft <= 7 ? 1 : 2 })),
    ...maintenanceAlerts.map(a => ({ ...a, priority: a.isPast ? 0 : a.daysLeft <= 3 ? 1 : 2 }))
  ].sort((a, b) => a.priority - b.priority || a.daysLeft - b.daysLeft);

  const getPriorityBadge = (alert) => {
    if (alert.isPast) return <Badge className="bg-red-500">متأخر</Badge>;
    if (alert.daysLeft <= 7) return <Badge className="bg-orange-500">عاجل</Badge>;
    return <Badge className="bg-blue-500">قريباً</Badge>;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          التنبيهات القادمة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">لا توجد تنبيهات قادمة</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {allAlerts.map((alert, index) => (
                <div 
                  key={`${alert.type}-${index}`}
                  className={`p-4 rounded-xl border ${
                    alert.isPast ? 'bg-red-50 border-red-200' : 
                    alert.daysLeft <= 7 ? 'bg-orange-50 border-orange-200' : 
                    'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'warranty' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {alert.type === 'warranty' ? (
                          <Shield className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Wrench className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{alert.name}</p>
                        <p className="text-sm text-slate-500">
                          {alert.type === 'warranty' ? 'انتهاء الضمان' : alert.maintenanceType}
                        </p>
                      </div>
                    </div>
                    {getPriorityBadge(alert)}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      {format(new Date(alert.date), 'd MMM yyyy', { locale: ar })}
                    </span>
                    <span className={alert.isPast ? 'text-red-600 font-medium' : 'text-slate-600'}>
                      {alert.isPast ? 
                        `متأخر ${Math.abs(alert.daysLeft)} يوم` : 
                        `خلال ${alert.daysLeft} يوم`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}