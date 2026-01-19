import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, Clock, CalendarPlus, Sparkles, CheckCircle2 } from "lucide-react";

export default function SmartTaskSuggestions({ onAddTask }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => base44.entities.HouseholdTask.list('-created_date', 50)
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.Maintenance.list()
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ['lowStockFood'],
    queryFn: async () => {
      const items = await base44.entities.FoodInventory.list();
      return items.filter(i => i.min_quantity && i.quantity <= i.min_quantity);
    }
  });

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      const completedTasks = tasks.filter(t => t.status === 'مكتملة');
      const pendingMaintenance = maintenance.filter(m => m.status !== 'مكتملة');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على البيانات التالية، اقترح مهام ذكية:

المهام المكتملة مؤخراً: ${completedTasks.slice(0, 10).map(t => t.title).join(', ') || 'لا يوجد'}
الصيانة المعلقة: ${pendingMaintenance.map(m => m.item_name).join(', ') || 'لا يوجد'}
منتجات منخفضة الكمية: ${lowStockItems.map(i => i.name).join(', ') || 'لا يوجد'}

اقترح:
1. 3 مهام منزلية يجب إنجازها بناءً على الوقت من السنة والأنماط
2. أفضل أوقات لإنجاز المهام
3. مهام صيانة وقائية`,
        response_json_schema: {
          type: "object",
          properties: {
            suggested_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  category: { type: "string" },
                  suggested_time: { type: "string" },
                  priority: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            maintenance_reminders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  action: { type: "string" },
                  urgency: { type: "string" }
                }
              }
            },
            shopping_tasks: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setSuggestions(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tasks.length > 0 || maintenance.length > 0 || lowStockItems.length > 0) {
      generateSuggestions();
    }
  }, []);

  const priorityColors = {
    "عالية": "bg-red-100 text-red-700",
    "متوسطة": "bg-amber-100 text-amber-700",
    "منخفضة": "bg-green-100 text-green-700"
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-indigo-600" />
            اقتراحات ذكية للمهام
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={generateSuggestions} disabled={loading}>
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
            <p className="text-slate-600">جاري التحليل...</p>
          </div>
        )}

        {suggestions && (
          <div className="space-y-4">
            {/* Suggested Tasks */}
            {suggestions.suggested_tasks?.map((task, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 mb-1">{task.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">{task.reason}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{task.category}</Badge>
                      <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.suggested_time}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onAddTask?.(task)}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Maintenance Reminders */}
            {suggestions.maintenance_reminders?.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4">
                <h5 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  تذكيرات الصيانة
                </h5>
                {suggestions.maintenance_reminders.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-amber-100 last:border-0">
                    <div>
                      <span className="font-medium">{item.item}</span>
                      <p className="text-sm text-amber-700">{item.action}</p>
                    </div>
                    <Badge className={item.urgency === 'عاجل' ? 'bg-red-500' : 'bg-amber-500'}>
                      {item.urgency}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Shopping Tasks */}
            {suggestions.shopping_tasks?.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4">
                <h5 className="font-semibold text-blue-800 mb-2">مشتريات مقترحة</h5>
                <div className="flex flex-wrap gap-2">
                  {suggestions.shopping_tasks.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-white">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}