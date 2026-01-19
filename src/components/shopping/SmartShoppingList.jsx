import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ShoppingCart, Plus, Sparkles, Store, Trash2, 
  DollarSign, ExternalLink, Loader2, RefreshCw, Check
} from "lucide-react";

const storeLinks = {
  "كارفور": (items) => `https://www.carrefouregypt.com/mafegy/ar/`,
  "نون": (items) => `https://www.noon.com/egypt-ar/`,
  "أمازون": (items) => `https://www.amazon.eg/`,
  "كازيون": () => `https://kazyon.com.eg/`,
  "بيم": () => `https://www.bim.com.eg/`
};

export default function SmartShoppingList({ onClose }) {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { data: shoppingList = [] } = useQuery({
    queryKey: ['shoppingList'],
    queryFn: () => base44.entities.ShoppingList.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const { data: consumptionLogs = [] } = useQuery({
    queryKey: ['consumptionLogs'],
    queryFn: () => base44.entities.ConsumptionLog.list('-created_date', 50)
  });

  const { data: priceRecords = [] } = useQuery({
    queryKey: ['allPriceRecords'],
    queryFn: () => base44.entities.PriceRecord.list('-created_date', 100)
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ShoppingList.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShoppingList.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShoppingList.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shoppingList'] })
  });

  // Calculate estimated total cost
  const estimatedTotal = useMemo(() => {
    return shoppingList
      .filter(item => !item.is_purchased)
      .reduce((total, item) => {
        if (item.estimated_price) return total + item.estimated_price;
        const priceRecord = priceRecords.find(p => 
          p.product_name?.toLowerCase().includes(item.name?.toLowerCase())
        );
        return total + (priceRecord?.price || 0);
      }, 0);
  }, [shoppingList, priceRecords]);

  // Get AI suggestions based on consumption
  const getSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const lowStock = inventory.filter(i => i.min_quantity && i.quantity <= i.min_quantity);
      const frequentItems = consumptionLogs.reduce((acc, log) => {
        acc[log.food_item_name] = (acc[log.food_item_name] || 0) + 1;
        return acc;
      }, {});

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `بناءً على البيانات التالية، اقترح قائمة تسوق ذكية:

المنتجات ذات الكمية المنخفضة:
${lowStock.map(i => `- ${i.name}: ${i.quantity} ${i.unit} (الحد الأدنى: ${i.min_quantity})`).join('\n')}

المنتجات الأكثر استهلاكاً:
${Object.entries(frequentItems).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => `- ${name}: ${count} مرة`).join('\n')}

المنتجات الحالية في قائمة التسوق:
${shoppingList.filter(i => !i.is_purchased).map(i => i.name).join(', ')}

اقترح 5-8 منتجات إضافية يجب شراؤها مع الكمية المناسبة.`,
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
                  reason: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      for (const item of response.suggestions || []) {
        const exists = shoppingList.some(s => 
          s.name?.toLowerCase() === item.name?.toLowerCase()
        );
        if (!exists) {
          await createMutation.mutateAsync({
            name: item.name,
            quantity: item.quantity || 1,
            unit: item.unit || 'عدد',
            category: item.category || 'أخرى',
            notes: item.reason
          });
        }
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
    setLoadingSuggestions(false);
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    createMutation.mutate({
      name: newItem,
      quantity: 1,
      unit: 'عدد'
    });
    setNewItem('');
  };

  const togglePurchased = (item) => {
    updateMutation.mutate({
      id: item.id,
      data: { ...item, is_purchased: !item.is_purchased }
    });
  };

  const openStore = () => {
    if (!selectedStore || !storeLinks[selectedStore]) return;
    window.open(storeLinks[selectedStore](), '_blank');
  };

  const groupedItems = useMemo(() => {
    const groups = {};
    shoppingList.forEach(item => {
      const cat = item.category || 'أخرى';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [shoppingList]);

  const pendingCount = shoppingList.filter(i => !i.is_purchased).length;
  const purchasedCount = shoppingList.filter(i => i.is_purchased).length;

  return (
    <Card className="bg-white border-0 shadow-xl max-h-[90vh] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            قائمة التسوق الذكية
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{pendingCount} متبقي</Badge>
            <Badge className="bg-green-100 text-green-700">{purchasedCount} تم شراؤه</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
        {/* Add Item */}
        <div className="flex gap-2 mb-4">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="أضف منتج..."
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} disabled={!newItem.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={getSuggestions}
            disabled={loadingSuggestions}
            className="gap-1"
          >
            {loadingSuggestions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            اقتراحات
          </Button>
        </div>

        {/* Estimated Cost */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <span className="font-medium">التكلفة التقديرية</span>
            </div>
            <span className="text-2xl font-bold text-orange-700">
              {estimatedTotal.toFixed(2)} ج.م
            </span>
          </div>
        </div>

        {/* Store Selection */}
        <div className="flex gap-2 mb-4">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="اختر متجر للتسوق" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(storeLinks).map(store => (
                <SelectItem key={store} value={store}>{store}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={openStore} 
            disabled={!selectedStore}
            className="gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            اذهب للمتجر
          </Button>
        </div>

        {/* Shopping List */}
        <ScrollArea className="flex-1">
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <span>{category}</span>
                  <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                </h4>
                <div className="space-y-2">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        item.is_purchased 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <Checkbox
                        checked={item.is_purchased}
                        onCheckedChange={() => togglePurchased(item)}
                      />
                      <div className="flex-1">
                        <span className={item.is_purchased ? 'line-through text-slate-400' : ''}>
                          {item.name}
                        </span>
                        <span className="text-sm text-slate-500 mr-2">
                          {item.quantity} {item.unit}
                        </span>
                        {item.notes && (
                          <p className="text-xs text-slate-400">{item.notes}</p>
                        )}
                      </div>
                      {item.estimated_price && (
                        <Badge variant="outline">{item.estimated_price} ج.م</Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {shoppingList.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>قائمة التسوق فارغة</p>
                <Button 
                  variant="link" 
                  onClick={getSuggestions}
                  className="mt-2"
                >
                  احصل على اقتراحات ذكية
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Clear Purchased */}
        {purchasedCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full text-green-600"
              onClick={() => {
                shoppingList
                  .filter(i => i.is_purchased)
                  .forEach(i => deleteMutation.mutate(i.id));
              }}
            >
              <Check className="w-4 h-4 ml-2" />
              مسح العناصر المشتراة ({purchasedCount})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}