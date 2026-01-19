import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingDown, TrendingUp, Calendar, ShoppingCart, RefreshCw, Loader2 } from "lucide-react";
import { format, subDays, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

export default function ConsumptionAnalytics({ inventory, onReorderSuggestion }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: consumptionLogs = [] } = useQuery({
    queryKey: ['consumptionLogs'],
    queryFn: () => base44.entities.ConsumptionLog.list('-consumption_date', 100)
  });

  const analyzeConsumption = async () => {
    setLoading(true);
    try {
      // Calculate consumption rates
      const itemConsumption = {};
      consumptionLogs.forEach(log => {
        if (!itemConsumption[log.food_item_name]) {
          itemConsumption[log.food_item_name] = {
            name: log.food_item_name,
            total_used: 0,
            times_used: 0,
            last_used: null,
            unit: log.unit
          };
        }
        itemConsumption[log.food_item_name].total_used += log.quantity_used;
        itemConsumption[log.food_item_name].times_used += 1;
        if (!itemConsumption[log.food_item_name].last_used || 
            new Date(log.consumption_date) > new Date(itemConsumption[log.food_item_name].last_used)) {
          itemConsumption[log.food_item_name].last_used = log.consumption_date;
        }
      });

      // Get AI analysis
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل بيانات استهلاك الطعام التالية واقترح أوقات إعادة الطلب:

بيانات الاستهلاك:
${JSON.stringify(Object.values(itemConsumption), null, 2)}

المخزون الحالي:
${inventory.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join('\n')}

قم بتحليل معدل الاستهلاك وتوقع متى سينفد كل منتج.`,
        response_json_schema: {
          type: "object",
          properties: {
            consumption_rates: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  daily_rate: { type: "number" },
                  days_until_empty: { type: "number" },
                  reorder_date: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            top_consumed: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing:', error);
    }
    setLoading(false);
  };

  const priorityColors = {
    "عاجل": "bg-red-100 text-red-700",
    "قريب": "bg-orange-100 text-orange-700",
    "عادي": "bg-green-100 text-green-700"
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-blue-600" />
            تحليل الاستهلاك
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={analyzeConsumption} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis && !loading && (
          <div className="text-center py-6">
            <TrendingDown className="w-12 h-12 text-blue-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">اضغط لتحليل معدلات الاستهلاك</p>
            <Button onClick={analyzeConsumption} className="bg-blue-600 hover:bg-blue-700">
              بدء التحليل
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-500">جاري تحليل الاستهلاك...</p>
          </div>
        )}

        {analysis && (
          <ScrollArea className="h-72">
            <div className="space-y-4">
              {/* Reorder Predictions */}
              {analysis.consumption_rates?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-700">توقعات إعادة الطلب</h4>
                  <div className="space-y-2">
                    {analysis.consumption_rates.slice(0, 5).map((item, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            <Calendar className="w-3 h-3 inline ml-1" />
                            {item.reorder_date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={priorityColors[item.priority] || "bg-slate-100"}>
                            {item.days_until_empty} يوم
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => onReorderSuggestion(item)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Consumed */}
              {analysis.top_consumed?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-indigo-700">الأكثر استهلاكاً</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.top_consumed.map((item, i) => (
                      <Badge key={i} className="bg-indigo-100 text-indigo-700">
                        <TrendingUp className="w-3 h-3 ml-1" />
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">💡 توصيات</h4>
                  <ul className="text-sm space-y-1">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-slate-600">• {rec}</li>
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