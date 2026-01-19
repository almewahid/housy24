import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ChefHat, ShoppingBag, Lightbulb, RefreshCw, Sparkles, Clock, AlertTriangle } from "lucide-react";

export default function AIRecommendations({ inventory = [], lowStockItems = [] }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [activeTab, setActiveTab] = useState('recipes');

  const generateRecommendations = async () => {
    setLoading(true);
    
    try {
      const inventoryList = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
      const lowStockList = lowStockItems.map(i => i.name).join(', ');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على المخزون الغذائي التالي، قدم توصيات ذكية:

المخزون المتوفر: ${inventoryList || 'لا يوجد'}
المنتجات منخفضة الكمية: ${lowStockList || 'لا يوجد'}

قدم:
1. 3 وصفات يمكن تحضيرها من المخزون المتوفر
2. 5 منتجات مقترحة للشراء بناءً على أنماط الاستهلاك الشائعة
3. 3 نصائح لتوفير المال في التسوق
4. تحذيرات إن وجدت (مثل منتجات قد تنتهي قريباً)`,
        response_json_schema: {
          type: "object",
          properties: {
            recipes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  ingredients: { type: "array", items: { type: "string" } },
                  prep_time: { type: "string" },
                  difficulty: { type: "string" }
                }
              }
            },
            shopping_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "string" }
                }
              }
            },
            saving_tips: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setRecommendations(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors = {
    "عالية": "bg-red-100 text-red-700",
    "متوسطة": "bg-amber-100 text-amber-700",
    "منخفضة": "bg-green-100 text-green-700"
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
            توصيات ذكية
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations && !loading && (
          <div className="text-center py-6">
            <Lightbulb className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">احصل على توصيات مخصصة بناءً على مخزونك</p>
            <Button onClick={generateRecommendations} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4" />
              توليد التوصيات
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-3" />
            <p className="text-slate-600">جاري تحليل المخزون...</p>
          </div>
        )}

        {recommendations && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="recipes" className="gap-1">
                <ChefHat className="w-3 h-3" />
                وصفات
              </TabsTrigger>
              <TabsTrigger value="shopping" className="gap-1">
                <ShoppingBag className="w-3 h-3" />
                تسوق
              </TabsTrigger>
              <TabsTrigger value="tips" className="gap-1">
                <Lightbulb className="w-3 h-3" />
                نصائح
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recipes" className="space-y-3">
              {recommendations.recipes?.map((recipe, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{recipe.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-3 h-3" />
                      {recipe.prep_time}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {recipe.ingredients?.map((ing, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{ing}</Badge>
                    ))}
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{recipe.difficulty}</Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="shopping" className="space-y-2">
              {recommendations.shopping_suggestions?.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.product}</p>
                    <p className="text-sm text-slate-500">{item.reason}</p>
                  </div>
                  <Badge className={priorityColors[item.priority] || priorityColors["متوسطة"]}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="tips" className="space-y-3">
              {recommendations.saving_tips?.map((tip, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-700">{tip}</p>
                </div>
              ))}
              
              {recommendations.warnings?.length > 0 && (
                <div className="bg-red-50 rounded-lg p-3 mt-4">
                  <h5 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    تحذيرات
                  </h5>
                  {recommendations.warnings.map((warning, idx) => (
                    <p key={idx} className="text-red-600 text-sm">• {warning}</p>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}