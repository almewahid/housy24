import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, RefreshCw, ShoppingCart, Bell, AlertTriangle, TrendingDown, Calendar, Loader2 } from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { ar } from "date-fns/locale";

export default function SmartInventoryAI({ inventory, onAddToShoppingList }) {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const queryClient = useQueryClient();

  const generatePredictions = async () => {
    setLoading(true);
    try {
      const inventoryData = inventory.map(item => ({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_quantity: item.min_quantity,
        expiry_date: item.expiry_date,
        created_date: item.created_date,
        updated_date: item.updated_date
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي لإدارة مخزون الطعام المنزلي. بناءً على البيانات التالية، قم بتحليل معدل الاستهلاك واقتراح أوقات إعادة الطلب.

بيانات المخزون:
${JSON.stringify(inventoryData, null, 2)}

التاريخ الحالي: ${format(new Date(), 'yyyy-MM-dd')}

قم بتحليل:
1. المنتجات التي ستنتهي صلاحيتها قريباً
2. المنتجات منخفضة الكمية
3. توقع الاستهلاك بناءً على نوع المنتج
4. اقتراح أفضل وقت لإعادة الطلب

أعطني تحليلاً مفيداً وعملياً.`,
        response_json_schema: {
          type: "object",
          properties: {
            expiring_soon: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  days_left: { type: "number" },
                  suggestion: { type: "string" }
                }
              }
            },
            reorder_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  current_quantity: { type: "number" },
                  suggested_reorder_date: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            consumption_insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  insight: { type: "string" }
                }
              }
            },
            smart_tips: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setPredictions(result);

      // Create notifications for expiring items
      if (result.expiring_soon?.length > 0) {
        for (const item of result.expiring_soon.slice(0, 3)) {
          await base44.entities.Notification.create({
            title: `تنبيه انتهاء صلاحية: ${item.name}`,
            message: item.suggestion,
            type: "عام",
            priority: item.days_left <= 1 ? "عاجلة" : item.days_left <= 3 ? "عالية" : "متوسطة",
            due_date: format(addDays(new Date(), item.days_left), 'yyyy-MM-dd')
          });
        }
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
    setLoading(false);
  };

  const priorityColors = {
    "عاجل": "bg-red-100 text-red-700",
    "مرتفع": "bg-orange-100 text-orange-700",
    "متوسط": "bg-yellow-100 text-yellow-700",
    "منخفض": "bg-green-100 text-green-700"
  };

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-600" />
            تحليل ذكي للمخزون
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={generatePredictions} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!predictions && !loading && (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-violet-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">اضغط لتحليل مخزونك بالذكاء الاصطناعي</p>
            <Button onClick={generatePredictions} className="bg-violet-600 hover:bg-violet-700">
              بدء التحليل
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">جاري تحليل المخزون...</p>
          </div>
        )}

        {predictions && (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              {/* Expiring Soon */}
              {predictions.expiring_soon?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    ينتهي قريباً
                  </h4>
                  <div className="space-y-2">
                    {predictions.expiring_soon.map((item, i) => (
                      <div key={i} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <Badge className="bg-red-100 text-red-700">
                            {item.days_left} يوم
                          </Badge>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{item.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reorder Suggestions */}
              {predictions.reorder_suggestions?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-violet-700 flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4" />
                    اقتراحات إعادة الطلب
                  </h4>
                  <div className="space-y-2">
                    {predictions.reorder_suggestions.map((item, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.name}</span>
                          <Badge className={priorityColors[item.priority] || "bg-slate-100"}>
                            {item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{item.reason}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            <Calendar className="w-3 h-3 inline ml-1" />
                            {item.suggested_reorder_date}
                          </span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 text-xs"
                            onClick={() => onAddToShoppingList({ name: item.name })}
                          >
                            <ShoppingCart className="w-3 h-3 ml-1" />
                            أضف للتسوق
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consumption Insights */}
              {predictions.consumption_insights?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4" />
                    تحليل الاستهلاك
                  </h4>
                  <div className="space-y-2">
                    {predictions.consumption_insights.map((insight, i) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800">{insight.category}: </span>
                        <span className="text-blue-600">{insight.insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Tips */}
              {predictions.smart_tips?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-emerald-700 flex items-center gap-2 mb-2">
                    💡 نصائح ذكية
                  </h4>
                  <ul className="space-y-1">
                    {predictions.smart_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}