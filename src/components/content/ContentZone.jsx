import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  BookOpen, Lightbulb, ShoppingBag, Apple, 
  Loader2, Search, ChefHat, DollarSign, Leaf
} from "lucide-react";

export default function ContentZone() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadRecipes = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `اقترح 5 وصفات عربية سهلة واقتصادية ${searchQuery ? `تحتوي على ${searchQuery}` : ''}.
لكل وصفة قدم:
- الاسم
- المكونات
- وقت التحضير
- مستوى الصعوبة
- التكلفة التقديرية`,
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
                  difficulty: { type: "string" },
                  cost: { type: "string" },
                  tips: { type: "string" }
                }
              }
            }
          }
        }
      });
      setContent({ type: 'recipes', data: response.recipes });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const loadSavingTips = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قدم 10 نصائح عملية لتوفير المال في التسوق والطعام للأسرة المصرية.
صنفها إلى:
- نصائح التسوق
- نصائح التخزين
- نصائح الطبخ
- نصائح تقليل الهدر`,
        response_json_schema: {
          type: "object",
          properties: {
            shopping_tips: { type: "array", items: { type: "string" } },
            storage_tips: { type: "array", items: { type: "string" } },
            cooking_tips: { type: "array", items: { type: "string" } },
            waste_reduction: { type: "array", items: { type: "string" } }
          }
        }
      });
      setContent({ type: 'tips', data: response });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const loadProductGuide = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قدم دليل اختيار ${searchQuery}.
اشمل:
- كيفية اختيار المنتج الجيد
- علامات الجودة
- أفضل وقت للشراء
- طريقة التخزين
- مدة الصلاحية`,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            selection_tips: { type: "array", items: { type: "string" } },
            quality_signs: { type: "array", items: { type: "string" } },
            best_time: { type: "string" },
            storage_method: { type: "string" },
            shelf_life: { type: "string" }
          }
        }
      });
      setContent({ type: 'guide', data: response });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const loadNutritionInfo = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قدم معلومات غذائية عن ${searchQuery}.
اشمل:
- السعرات الحرارية
- العناصر الغذائية
- الفوائد الصحية
- التحذيرات
- البدائل الصحية`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            food_name: { type: "string" },
            calories_per_100g: { type: "number" },
            nutrients: { type: "array", items: { type: "string" } },
            health_benefits: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            healthy_alternatives: { type: "array", items: { type: "string" } }
          }
        }
      });
      setContent({ type: 'nutrition', data: response });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          منطقة المحتوى
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 h-auto mb-4">
            <TabsTrigger value="recipes" className="gap-1 py-2">
              <ChefHat className="w-4 h-4" />
              <span className="hidden sm:inline">وصفات</span>
            </TabsTrigger>
            <TabsTrigger value="tips" className="gap-1 py-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">نصائح</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="gap-1 py-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">دليل</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-1 py-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">غذائية</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2 mb-4">
            <Input
              placeholder={
                activeTab === 'recipes' ? 'ابحث عن وصفة...' :
                activeTab === 'guide' ? 'اسم المنتج...' :
                activeTab === 'nutrition' ? 'اسم الطعام...' : 'بحث...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              onClick={() => {
                if (activeTab === 'recipes') loadRecipes();
                else if (activeTab === 'tips') loadSavingTips();
                else if (activeTab === 'guide') loadProductGuide();
                else if (activeTab === 'nutrition') loadNutritionInfo();
              }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          <ScrollArea className="h-80">
            {/* Recipes */}
            {content?.type === 'recipes' && content.data && (
              <div className="space-y-4">
                {content.data.map((recipe, i) => (
                  <Card key={i} className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">{recipe.name}</h3>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="outline">{recipe.prep_time}</Badge>
                        <Badge variant="outline">{recipe.difficulty}</Badge>
                        <Badge className="bg-green-100 text-green-700">{recipe.cost}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        المكونات: {recipe.ingredients?.join('، ')}
                      </p>
                      {recipe.tips && (
                        <p className="text-xs text-amber-700">💡 {recipe.tips}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Saving Tips */}
            {content?.type === 'tips' && content.data && (
              <div className="space-y-4">
                {content.data.shopping_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      نصائح التسوق
                    </h4>
                    <ul className="space-y-1">
                      {content.data.shopping_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.data.storage_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      نصائح التخزين
                    </h4>
                    <ul className="space-y-1">
                      {content.data.storage_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.data.cooking_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                      نصائح الطبخ
                    </h4>
                    <ul className="space-y-1">
                      {content.data.cooking_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.data.waste_reduction?.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      تقليل الهدر
                    </h4>
                    <ul className="space-y-1">
                      {content.data.waste_reduction.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Product Guide */}
            {content?.type === 'guide' && content.data && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">{content.data.product_name}</h3>
                
                {content.data.selection_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">كيفية الاختيار:</h4>
                    <ul className="space-y-1">
                      {content.data.selection_tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.data.quality_signs?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">علامات الجودة:</h4>
                    <div className="flex flex-wrap gap-1">
                      {content.data.quality_signs.map((sign, i) => (
                        <Badge key={i} variant="secondary">{sign}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600">أفضل وقت للشراء</p>
                    <p className="text-sm font-medium">{content.data.best_time}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600">مدة الصلاحية</p>
                    <p className="text-sm font-medium">{content.data.shelf_life}</p>
                  </div>
                </div>

                {content.data.storage_method && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600">طريقة التخزين</p>
                    <p className="text-sm">{content.data.storage_method}</p>
                  </div>
                )}
              </div>
            )}

            {/* Nutrition Info */}
            {content?.type === 'nutrition' && content.data && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">{content.data.food_name}</h3>
                
                {content.data.calories_per_100g && (
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-700">{content.data.calories_per_100g}</p>
                    <p className="text-xs text-purple-600">سعرة حرارية / 100 جرام</p>
                  </div>
                )}

                {content.data.nutrients?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">العناصر الغذائية:</h4>
                    <div className="flex flex-wrap gap-1">
                      {content.data.nutrients.map((n, i) => (
                        <Badge key={i} variant="outline">{n}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {content.data.health_benefits?.length > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">الفوائد الصحية:</h4>
                    <ul className="space-y-1">
                      {content.data.health_benefits.map((b, i) => (
                        <li key={i} className="text-sm text-green-600">✓ {b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.data.warnings?.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">تحذيرات:</h4>
                    <ul className="space-y-1">
                      {content.data.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-red-600">⚠ {w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!content && !loading && (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>اختر نوع المحتوى وابدأ البحث</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                <p className="text-slate-500">جاري التحميل...</p>
              </div>
            )}
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}