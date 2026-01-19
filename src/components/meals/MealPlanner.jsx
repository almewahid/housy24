import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed, Sparkles, Loader2, Plus, ShoppingCart,
  Leaf, DollarSign, ChefHat, Calendar, Trash2
} from "lucide-react";
import { format, startOfWeek, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const mealTypes = ["فطور", "غداء", "عشاء"];

export default function MealPlanner() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [suggestionType, setSuggestionType] = useState('balanced');
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 6 });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.Recipe.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mealPlans'] })
  });

  const addToShoppingMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const availableItems = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
      
      const typePrompts = {
        balanced: 'وجبات متوازنة ومتنوعة',
        economical: 'وجبات اقتصادية وموفرة',
        healthy: 'وجبات صحية وخفيفة'
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنشئ خطة وجبات أسبوعية عربية (${typePrompts[suggestionType]}).

المكونات المتوفرة حالياً في المخزون:
${availableItems}

أريد خطة لـ 7 أيام (السبت للجمعة) تشمل: فطور، غداء، عشاء.
ركز على:
- استخدام المكونات المتوفرة قدر الإمكان
- ${suggestionType === 'economical' ? 'تقليل التكلفة' : suggestionType === 'healthy' ? 'وجبات صحية' : 'التنويع'}
- وجبات عربية تقليدية
- سهولة التحضير`,
        response_json_schema: {
          type: "object",
          properties: {
            meals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  meal_type: { type: "string" },
                  meal_name: { type: "string" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" }
                      }
                    }
                  },
                  estimated_cost: { type: "number" },
                  is_healthy: { type: "boolean" },
                  is_economical: { type: "boolean" }
                }
              }
            }
          }
        }
      });

      // Clear existing meal plans
      for (const plan of mealPlans) {
        await deleteMutation.mutateAsync(plan.id);
      }

      // Add new meal plans
      for (const meal of response.meals || []) {
        const ingredientsWithAvailability = (meal.ingredients || []).map(ing => ({
          ...ing,
          available: inventory.some(i => 
            i.name?.toLowerCase().includes(ing.name?.toLowerCase())
          )
        }));

        await createMutation.mutateAsync({
          week_start_date: format(weekStart, 'yyyy-MM-dd'),
          day_of_week: meal.day,
          meal_type: meal.meal_type,
          meal_name: meal.meal_name,
          ingredients: ingredientsWithAvailability,
          estimated_cost: meal.estimated_cost || 0,
          is_healthy: meal.is_healthy || false,
          is_economical: meal.is_economical || false
        });
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
    }
    setLoading(false);
  };

  const addMissingToShoppingList = async (meal) => {
    const missing = (meal.ingredients || []).filter(i => !i.available);
    for (const item of missing) {
      await addToShoppingMutation.mutateAsync({
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'عدد',
        notes: `لوجبة: ${meal.meal_name}`
      });
    }
  };

  const getMealsForDay = (day) => {
    return mealPlans.filter(m => m.day_of_week === day);
  };

  const totalWeeklyCost = mealPlans.reduce((sum, m) => sum + (m.estimated_cost || 0), 0);

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-600" />
            تخطيط الوجبات الأسبوعية
          </CardTitle>
          <Badge className="bg-amber-100 text-amber-700">
            التكلفة التقديرية: {totalWeeklyCost.toFixed(0)} ج.م
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Generation Options */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={suggestionType === 'balanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSuggestionType('balanced')}
          >
            <ChefHat className="w-4 h-4 ml-1" />
            متوازنة
          </Button>
          <Button
            variant={suggestionType === 'economical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSuggestionType('economical')}
          >
            <DollarSign className="w-4 h-4 ml-1" />
            اقتصادية
          </Button>
          <Button
            variant={suggestionType === 'healthy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSuggestionType('healthy')}
          >
            <Leaf className="w-4 h-4 ml-1" />
            صحية
          </Button>
          <Button
            onClick={generateMealPlan}
            disabled={loading}
            className="mr-auto gap-1 bg-amber-600 hover:bg-amber-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            إنشاء خطة
          </Button>
        </div>

        {/* Days Tabs */}
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-slate-100 p-1">
            {days.map((day, i) => (
              <TabsTrigger key={day} value={day} className="flex-1 min-w-[80px]">
                <div className="text-center">
                  <p className="text-xs">{day}</p>
                  <p className="text-[10px] text-slate-500">
                    {format(addDays(weekStart, i), 'd/M')}
                  </p>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {days.map(day => (
            <TabsContent key={day} value={day} className="mt-4">
              <div className="space-y-3">
                {mealTypes.map(mealType => {
                  const meal = getMealsForDay(day).find(m => m.meal_type === mealType);
                  return (
                    <div 
                      key={mealType}
                      className={`p-4 rounded-xl ${
                        meal ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' : 'bg-slate-50 border border-dashed border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{mealType}</Badge>
                        {meal?.is_healthy && <Badge className="bg-green-100 text-green-700">صحي</Badge>}
                        {meal?.is_economical && <Badge className="bg-blue-100 text-blue-700">اقتصادي</Badge>}
                      </div>

                      {meal ? (
                        <>
                          <h4 className="font-bold text-lg mb-2">{meal.meal_name}</h4>
                          
                          {meal.ingredients?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm text-slate-600 mb-1">المكونات:</p>
                              <div className="flex flex-wrap gap-1">
                                {meal.ingredients.map((ing, i) => (
                                  <Badge 
                                    key={i} 
                                    variant="outline"
                                    className={ing.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
                                  >
                                    {ing.name} {ing.quantity && `(${ing.quantity} ${ing.unit || ''})`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            {meal.estimated_cost > 0 && (
                              <span className="text-sm text-slate-600">
                                التكلفة: {meal.estimated_cost} ج.م
                              </span>
                            )}
                            <div className="flex gap-2">
                              {meal.ingredients?.some(i => !i.available) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => addMissingToShoppingList(meal)}
                                >
                                  <ShoppingCart className="w-4 h-4 ml-1" />
                                  أضف الناقص للتسوق
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                                onClick={() => deleteMutation.mutate(meal.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-slate-400 text-center py-4">
                          لم يتم تحديد وجبة
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {mealPlans.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لم يتم إنشاء خطة وجبات بعد</p>
            <Button 
              variant="link" 
              onClick={generateMealPlan}
              disabled={loading}
              className="mt-2"
            >
              أنشئ خطة وجبات ذكية
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}