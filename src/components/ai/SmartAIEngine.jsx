import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Loader2, Sparkles, TrendingUp, ShoppingCart,
  DollarSign, ChefHat, AlertTriangle, RefreshCw, Lightbulb,
  Target, Package, Clock
} from "lucide-react";

export default function SmartAIEngine({ onAddToCart, onSuggestRecipe }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('habits');

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const { data: shoppingList = [] } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: () => base44.entities.ShoppingList.filter({ is_purchased: false })
  });

  const { data: consumptionLogs = [] } = useQuery({
    queryKey: ['consumptionLogs'],
    queryFn: () => base44.entities.ConsumptionLog.list('-created_date', 100)
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => base44.entities.Expense.list('-expense_date', 50)
  });

  const analyzeHabits = async () => {
    setLoading(true);
    try {
      const inventoryData = inventory.map(i => `${i.name}: ${i.quantity} ${i.unit}`).join('\n');
      const consumptionData = consumptionLogs.slice(0, 30).map(c => 
        `${c.food_item_name}: ${c.quantity_used} ${c.unit} (${c.usage_type})`
      ).join('\n');
      const expenseData = expenses.slice(0, 20).map(e => 
        `${e.category}: ${e.amount} ج.م`
      ).join('\n');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل عادات الشراء والاستهلاك التالية للأسرة:

المخزون الحالي:
${inventoryData || 'لا يوجد'}

سجل الاستهلاك الأخير:
${consumptionData || 'لا يوجد'}

المصروفات الأخيرة:
${expenseData || 'لا يوجد'}

قدم تحليلاً شاملاً يشمل:
1. أنماط الشراء (ما هي المنتجات الأكثر شراءً)
2. أنماط الاستهلاك (ما هي المنتجات الأكثر استهلاكاً)
3. توصيات مخصصة بناءً على العادات
4. بدائل أرخص للمنتجات المكررة
5. تنبؤات بالاحتياجات القادمة
6. اقتراحات وصفات بناءً على المخزون والميزانية
7. نصائح لتحسين الإنفاق`,
        response_json_schema: {
          type: "object",
          properties: {
            buying_patterns: {
              type: "object",
              properties: {
                most_bought: { type: "array", items: { type: "string" } },
                buying_frequency: { type: "string" },
                preferred_categories: { type: "array", items: { type: "string" } }
              }
            },
            consumption_patterns: {
              type: "object",
              properties: {
                most_consumed: { type: "array", items: { type: "string" } },
                waste_items: { type: "array", items: { type: "string" } },
                consumption_rate: { type: "string" }
              }
            },
            personalized_recommendations: { type: "array", items: { type: "string" } },
            cheaper_alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original: { type: "string" },
                  alternative: { type: "string" },
                  savings: { type: "string" }
                }
              }
            },
            predicted_needs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item: { type: "string" },
                  expected_date: { type: "string" },
                  suggested_quantity: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            recipe_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  uses_inventory: { type: "array", items: { type: "string" } },
                  estimated_cost: { type: "number" },
                  difficulty: { type: "string" }
                }
              }
            },
            spending_tips: { type: "array", items: { type: "string" } },
            monthly_budget_suggestion: { type: "number" },
            health_score: { type: "number" },
            health_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      setInsights(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            محرك الذكاء الاصطناعي
          </CardTitle>
          <Button onClick={analyzeHabits} disabled={loading} size="sm" className="gap-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            تحليل
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!insights && !loading && (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">اضغط على "تحليل" للحصول على رؤى ذكية</p>
            <Button onClick={analyzeHabits}>
              <Sparkles className="w-4 h-4 ml-2" />
              ابدأ التحليل
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-slate-600">جاري تحليل البيانات...</p>
            <p className="text-sm text-slate-400 mt-2">هذا قد يستغرق لحظات</p>
          </div>
        )}

        {insights && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 h-auto mb-4">
              <TabsTrigger value="habits" className="text-xs py-2">العادات</TabsTrigger>
              <TabsTrigger value="alternatives" className="text-xs py-2">البدائل</TabsTrigger>
              <TabsTrigger value="predictions" className="text-xs py-2">التنبؤات</TabsTrigger>
              <TabsTrigger value="recipes" className="text-xs py-2">الوصفات</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-80">
              {/* Habits Tab */}
              <TabsContent value="habits" className="mt-0">
                <div className="space-y-4">
                  {/* Buying Patterns */}
                  {insights.buying_patterns && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        أنماط الشراء
                      </h4>
                      <p className="text-sm text-blue-600 mb-2">{insights.buying_patterns.buying_frequency}</p>
                      <div className="flex flex-wrap gap-1">
                        {insights.buying_patterns.most_bought?.map((item, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700">{item}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Consumption Patterns */}
                  {insights.consumption_patterns && (
                    <div className="p-3 bg-green-50 rounded-xl">
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        أنماط الاستهلاك
                      </h4>
                      <p className="text-sm text-green-600 mb-2">{insights.consumption_patterns.consumption_rate}</p>
                      {insights.consumption_patterns.waste_items?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 mb-1">⚠ منتجات تُهدر كثيراً:</p>
                          <div className="flex flex-wrap gap-1">
                            {insights.consumption_patterns.waste_items.map((item, i) => (
                              <Badge key={i} className="bg-red-100 text-red-700">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Health Score */}
                  {insights.health_score && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-700">نقاط الصحة الغذائية</h4>
                        <span className="text-2xl font-bold text-purple-700">{insights.health_score}/10</span>
                      </div>
                      {insights.health_tips?.length > 0 && (
                        <ul className="space-y-1">
                          {insights.health_tips.slice(0, 3).map((tip, i) => (
                            <li key={i} className="text-sm text-purple-600">💚 {tip}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Personalized Recommendations */}
                  {insights.personalized_recommendations?.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        توصيات مخصصة لك
                      </h4>
                      <ul className="space-y-1">
                        {insights.personalized_recommendations.map((rec, i) => (
                          <li key={i} className="text-sm text-amber-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Spending Tips */}
                  {insights.spending_tips?.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        نصائح التوفير
                      </h4>
                      <ul className="space-y-1">
                        {insights.spending_tips.map((tip, i) => (
                          <li key={i} className="text-sm text-slate-600">💰 {tip}</li>
                        ))}
                      </ul>
                      {insights.monthly_budget_suggestion > 0 && (
                        <div className="mt-2 p-2 bg-white rounded-lg">
                          <p className="text-xs text-slate-500">الميزانية الشهرية المقترحة</p>
                          <p className="text-lg font-bold text-green-600">{insights.monthly_budget_suggestion} ج.م</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Alternatives Tab */}
              <TabsContent value="alternatives" className="mt-0">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    بدائل أرخص
                  </h4>
                  {insights.cheaper_alternatives?.length > 0 ? (
                    insights.cheaper_alternatives.map((alt, i) => (
                      <div key={i} className="p-3 bg-green-50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alt.original}</p>
                            <p className="text-sm text-green-600">← {alt.alternative}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700">{alt.savings}</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 w-full"
                          onClick={() => onAddToCart?.({ name: alt.alternative, quantity: 1 })}
                        >
                          <ShoppingCart className="w-3 h-3 ml-1" />
                          أضف البديل للتسوق
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-4">لا توجد بدائل مقترحة حالياً</p>
                  )}
                </div>
              </TabsContent>

              {/* Predictions Tab */}
              <TabsContent value="predictions" className="mt-0">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    تنبؤات الاحتياجات
                  </h4>
                  {insights.predicted_needs?.length > 0 ? (
                    insights.predicted_needs.map((need, i) => (
                      <div key={i} className="p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{need.item}</span>
                          </div>
                          <Badge variant="outline" className="text-blue-600 gap-1">
                            <Clock className="w-3 h-3" />
                            {need.expected_date}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{need.reason}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-blue-600">الكمية المقترحة: {need.suggested_quantity}</span>
                          <Button 
                            size="sm"
                            onClick={() => onAddToCart?.({ name: need.item, quantity: 1, notes: need.reason })}
                          >
                            <ShoppingCart className="w-3 h-3 ml-1" />
                            أضف
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-4">لا توجد تنبؤات حالياً</p>
                  )}
                </div>
              </TabsContent>

              {/* Recipes Tab */}
              <TabsContent value="recipes" className="mt-0">
                <div className="space-y-3">
                  <h4 className="font-semibold text-amber-700 flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    وصفات مقترحة من مخزونك
                  </h4>
                  {insights.recipe_suggestions?.length > 0 ? (
                    insights.recipe_suggestions.map((recipe, i) => (
                      <div key={i} className="p-3 bg-amber-50 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-bold text-lg">{recipe.name}</h5>
                          <div className="flex gap-1">
                            <Badge variant="outline">{recipe.difficulty}</Badge>
                            <Badge className="bg-green-100 text-green-700">{recipe.estimated_cost} ج.م</Badge>
                          </div>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-slate-500 mb-1">تستخدم من مخزونك:</p>
                          <div className="flex flex-wrap gap-1">
                            {recipe.uses_inventory?.map((item, j) => (
                              <Badge key={j} className="bg-amber-100 text-amber-700 text-xs">{item}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => onSuggestRecipe?.(recipe)}
                        >
                          <ChefHat className="w-3 h-3 ml-1" />
                          ابدأ الطبخ
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-4">لا توجد وصفات مقترحة حالياً</p>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}