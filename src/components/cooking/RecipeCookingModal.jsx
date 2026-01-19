import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { ChefHat, Users, UserPlus, Check, X, ShoppingCart, Package, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function RecipeCookingModal({ onClose }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [isGuests, setIsGuests] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: familyMembers = [] } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const totalPeople = familyMembers.length + (isGuests ? guestCount : 0);

  const generateRecipe = async () => {
    if (!recipeName) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت طباخ محترف. أريد طبخ "${recipeName}" لـ ${totalPeople} شخص.

المخزون المتاح لدي:
${inventory.map(i => `- ${i.name}: ${i.quantity} ${i.unit}`).join('\n')}

أعطني قائمة المكونات المطلوبة مع الكميات المناسبة لهذا العدد.
حدد لكل مكون إذا كان متوفراً في المخزون أم يحتاج شراء.`,
        response_json_schema: {
          type: "object",
          properties: {
            recipe_name: { type: "string" },
            servings: { type: "number" },
            prep_time: { type: "number" },
            cook_time: { type: "number" },
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  in_stock: { type: "boolean" },
                  stock_quantity: { type: "number" },
                  needs_purchase: { type: "boolean" }
                }
              }
            },
            instructions: { type: "string" },
            tips: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Match ingredients with inventory
      const enrichedIngredients = result.ingredients.map(ing => {
        const inventoryItem = inventory.find(i => 
          i.name.toLowerCase().includes(ing.name.toLowerCase()) ||
          ing.name.toLowerCase().includes(i.name.toLowerCase())
        );
        return {
          ...ing,
          inventory_item: inventoryItem,
          in_stock: inventoryItem && inventoryItem.quantity >= ing.quantity,
          available_quantity: inventoryItem?.quantity || 0,
          food_item_id: inventoryItem?.id
        };
      });

      setIngredients(enrichedIngredients);
      setServings(result.servings || totalPeople);
      setStep(2);
    } catch (error) {
      console.error('Error generating recipe:', error);
    }
    setLoading(false);
  };

  const updateIngredient = (index, field, value) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const confirmCooking = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Deduct from inventory
      for (const ing of ingredients) {
        if (ing.food_item_id && ing.in_stock) {
          const inventoryItem = inventory.find(i => i.id === ing.food_item_id);
          if (inventoryItem) {
            const newQuantity = Math.max(0, inventoryItem.quantity - ing.quantity);
            await base44.entities.FoodInventory.update(ing.food_item_id, {
              ...inventoryItem,
              quantity: newQuantity
            });

            // Log consumption
            await base44.entities.ConsumptionLog.create({
              food_item_id: ing.food_item_id,
              food_item_name: ing.name,
              quantity_used: ing.quantity,
              unit: ing.unit,
              usage_type: 'طبخ',
              recipe_name: recipeName,
              consumption_date: today
            });
          }
        }
      }

      // Add missing items to shopping list
      const missingItems = ingredients.filter(ing => !ing.in_stock || ing.needs_purchase);
      for (const item of missingItems) {
        await base44.entities.ShoppingList.create({
          name: item.name,
          quantity: item.quantity - (item.available_quantity || 0),
          unit: item.unit,
          notes: `للوصفة: ${recipeName}`
        });
      }

      queryClient.invalidateQueries({ queryKey: ['foodInventory'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
      queryClient.invalidateQueries({ queryKey: ['consumptionLogs'] });
      
      onClose();
    } catch (error) {
      console.error('Error confirming cooking:', error);
    }
    setLoading(false);
  };

  const inStockCount = ingredients.filter(i => i.in_stock).length;
  const needsPurchaseCount = ingredients.filter(i => !i.in_stock).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="border-b bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-6 h-6" />
              {step === 1 ? 'تحضير وجبة' : 'مراجعة المكونات'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Recipe Name */}
              <div>
                <Label className="text-lg">ما الوجبة التي تريد طبخها؟</Label>
                <Input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="مثال: كبسة دجاج، مكرونة بالبشاميل..."
                  className="mt-2 text-lg"
                />
              </div>

              {/* Family Members */}
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-slate-600" />
                  <span className="font-medium">أفراد العائلة: {familyMembers.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map(member => (
                    <Badge key={member.id} variant="secondary">
                      {member.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserPlus className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">عزومة / ضيوف</span>
                  </div>
                  <Switch checked={isGuests} onCheckedChange={setIsGuests} />
                </div>
                {isGuests && (
                  <div className="flex items-center gap-3">
                    <Label>عدد الضيوف:</Label>
                    <Input
                      type="number"
                      min="1"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <p className="text-sm text-emerald-600 mb-1">إجمالي عدد الأشخاص</p>
                <p className="text-4xl font-bold text-emerald-700">{totalPeople}</p>
              </div>

              <Button 
                onClick={generateRecipe} 
                disabled={!recipeName || totalPeople === 0 || loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin ml-2" />
                    جاري حساب المكونات...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 ml-2" />
                    احسب المكونات بالذكاء الاصطناعي
                  </>
                )}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 p-3 bg-green-50 rounded-xl text-center">
                  <Package className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{inStockCount}</p>
                  <p className="text-xs text-green-600">متوفر</p>
                </div>
                <div className="flex-1 p-3 bg-red-50 rounded-xl text-center">
                  <ShoppingCart className="w-6 h-6 text-red-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-red-700">{needsPurchaseCount}</p>
                  <p className="text-xs text-red-600">يحتاج شراء</p>
                </div>
              </div>

              {/* Ingredients List */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {ingredients.map((ing, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        ing.in_stock ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ing.in_stock ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">{ing.name}</p>
                          <p className="text-sm text-slate-500">
                            {ing.in_stock 
                              ? `متوفر: ${ing.available_quantity} ${ing.unit}`
                              : `غير متوفر`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 text-center"
                        />
                        <span className="text-sm text-slate-500">{ing.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  رجوع
                </Button>
                <Button 
                  onClick={confirmCooking} 
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5 ml-2" />
                      تأكيد الطبخ
                    </>
                  )}
                </Button>
              </div>

              {needsPurchaseCount > 0 && (
                <p className="text-sm text-center text-amber-600">
                  ⚠️ سيتم إضافة المكونات الناقصة لقائمة التسوق تلقائياً
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}