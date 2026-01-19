import React, { useState, useMemo } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MealPlanner from '@/components/meals/MealPlanner';
import SmartShoppingAssistant from '@/components/stores/SmartShoppingAssistant';
import SmartStoresIntegration from '@/components/shopping/SmartStoresIntegration';
import ModalWrapper from '@/components/common/ModalWrapper';
import EditableQuantity from '@/components/common/EditableQuantity';
import DraggableList from '@/components/common/DraggableList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Plus, Trash2, Store, Phone, MessageCircle, CheckCircle2, DollarSign, Sparkles, ExternalLink, UtensilsCrossed, Search, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SupplierSelector from '@/components/food/SupplierSelector';

const categories = ["ألبان", "لحوم", "خضروات", "فواكه", "حبوب", "معلبات", "مشروبات", "بهارات", "مجمدات", "أخرى"];
const units = ["كيلو", "جرام", "لتر", "مل", "عدد", "علبة", "كيس", "زجاجة"];

const storeLinks = {
  "كارفور": `https://www.carrefouregypt.com/mafegy/ar/`,
  "نون": `https://www.noon.com/egypt-ar/`,
  "أمازون": `https://www.amazon.eg/`,
  "كازيون": `https://kazyon.com.eg/`,
  "بيم": `https://www.bim.com.eg/`
};

export default function ShoppingList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showMealPlanner, setShowMealPlanner] = useState(false);
  const [showSmartAssistant, setShowSmartAssistant] = useState(false);
  const [showSmartStores, setShowSmartStores] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [formData, setFormData] = useState({ name: '', quantity: 1, unit: 'عدد', category: 'أخرى' });

  const { data: items = [] } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: () => base44.entities.ShoppingList.filter({ is_purchased: false }, '-created_date')
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const { data: consumptionLogs = [] } = useQuery({
    queryKey: ['consumptionLogs'],
    queryFn: () => base44.entities.ConsumptionLog.list('-created_date', 50)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
      setShowForm(false);
      setFormData({ name: '', quantity: 1, unit: 'عدد', category: 'أخرى' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShoppingList.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  const togglePurchased = (item) => {
    updateMutation.mutate({ id: item.id, data: { ...item, is_purchased: !item.is_purchased } });
  };

  const updateQuantity = (item, newQuantity) => {
    updateMutation.mutate({ id: item.id, data: { ...item, quantity: newQuantity } });
  };

  const getSupplier = (id) => suppliers.find(s => s.id === id);

  const totalEstimate = items.reduce((sum, i) => sum + (i.estimated_price || 0), 0);

  const groupedItems = items.reduce((acc, item) => {
    const cat = item.category || 'أخرى';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const getSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const lowStock = inventory.filter(i => i.min_quantity && i.quantity <= i.min_quantity);
      const frequentItems = consumptionLogs.reduce((acc, log) => {
        acc[log.food_item_name] = (acc[log.food_item_name] || 0) + 1;
        return acc;
      }, {});

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على البيانات التالية، اقترح قائمة تسوق:

المنتجات منخفضة الكمية:
${lowStock.map(i => `- ${i.name}`).join('\n') || 'لا يوجد'}

المنتجات الأكثر استهلاكاً:
${Object.entries(frequentItems).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => `- ${name}`).join('\n') || 'لا يوجد'}

اقترح 5-8 منتجات مع الكمية.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const item of response.suggestions || []) {
        const exists = items.some(s => s.name?.toLowerCase() === item.name?.toLowerCase());
        if (!exists) {
          await createMutation.mutateAsync({
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit || 'عدد',
            category: item.category || 'أخرى'
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoadingSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">قائمة التسوق</h1>
            <p className="text-slate-500">{items.length} منتج للشراء</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={getSuggestions} variant="outline" className="gap-2" disabled={loadingSuggestions}>
              {loadingSuggestions ? <span className="animate-spin">⏳</span> : <Sparkles className="w-4 h-4" />}
              اقتراحات ذكية
            </Button>
            <Button onClick={() => setShowMealPlanner(true)} variant="outline" className="gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              تخطيط الوجبات
            </Button>
            <Button onClick={() => setShowSmartStores(true)} variant="outline" className="gap-2 dark:border-slate-600 dark:hover:bg-slate-700">
              <Store className="w-4 h-4" />
              المتاجر الذكية
            </Button>
            <Button onClick={() => setShowSmartAssistant(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Search className="w-4 h-4" />
              مقارنة الأسعار
            </Button>
            <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5" />
              إضافة منتج
            </Button>
          </div>
        </div>

        {/* Store Links */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {Object.entries(storeLinks).map(([name, url]) => (
            <Button 
              key={name}
              variant="outline" 
              size="sm"
              onClick={() => window.open(url, '_blank')}
              className="gap-1"
            >
              {name}
              <ExternalLink className="w-3 h-3" />
            </Button>
          ))}
        </div>

        {/* Total Estimate */}
        {totalEstimate > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6" />
                <span>التكلفة التقديرية</span>
              </div>
              <span className="text-2xl font-bold">{totalEstimate.toLocaleString()} ج.م</span>
            </CardContent>
          </Card>
        )}

        {/* Items by Category */}
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">قائمة التسوق فارغة</p>
            <Button onClick={() => setShowForm(true)}>إضافة منتج</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, categoryItems]) => (
              <Card key={category} className="bg-white/90 border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence>
                    {categoryItems.map(item => {
                      const supplier = getSupplier(item.preferred_supplier_id);
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl group"
                        >
                          <Checkbox
                            checked={item.is_purchased}
                            onCheckedChange={() => togglePurchased(item)}
                          />
                          <div className="flex-1">
                            <p className={`font-medium ${item.is_purchased ? 'line-through text-slate-400' : ''}`}>
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <EditableQuantity
                                value={item.quantity}
                                unit={item.unit}
                                onChange={(newQty) => updateQuantity(item, newQty)}
                              />
                              {item.estimated_price && (
                                <Badge variant="secondary">{item.estimated_price} ج.م</Badge>
                              )}
                            </div>
                            {supplier && (
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                                <Store className="w-3 h-3" />
                                <span>{supplier.name}</span>
                                {supplier.phone && (
                                  <a href={`tel:${supplier.phone}`} className="hover:text-blue-500">
                                    <Phone className="w-3 h-3" />
                                  </a>
                                )}
                                {supplier.whatsapp && (
                                  <a href={`https://wa.me/${supplier.whatsapp}`} target="_blank" className="hover:text-green-500">
                                    <MessageCircle className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Item Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة منتج للتسوق</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>اسم المنتج *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>الكمية</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>الوحدة</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData({ ...formData, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>التصنيف</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>السعر التقديري</Label>
                <Input
                  type="number"
                  value={formData.estimated_price || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_price: Number(e.target.value) })}
                  placeholder="اختياري"
                />
              </div>
              <div>
                <Label>المورد المفضل</Label>
                <SupplierSelector
                  selectedId={formData.preferred_supplier_id}
                  onSelect={(id) => setFormData({ ...formData, preferred_supplier_id: id })}
                  category={formData.category}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.name}
                >
                  إضافة
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Meal Planner Dialog */}
        <Dialog open={showMealPlanner} onOpenChange={setShowMealPlanner}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <MealPlanner />
          </DialogContent>
        </Dialog>

        {/* Smart Stores Integration */}
        {showSmartStores && (
          <SmartStoresIntegration
            shoppingList={items}
            onClose={() => setShowSmartStores(false)}
          />
        )}

        {/* Smart Shopping Assistant */}
        <ModalWrapper open={showSmartAssistant} onClose={() => setShowSmartAssistant(false)}>
          <SmartShoppingAssistant 
            shoppingList={items} 
            onClose={() => setShowSmartAssistant(false)}
          />
        </ModalWrapper>
        </div>
        </div>
        );
        }