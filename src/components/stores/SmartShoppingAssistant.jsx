import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  ShoppingCart, Loader2, Search, TrendingDown, Bell,
  Plus, Store, DollarSign, AlertTriangle, Check, X,
  RefreshCw, ArrowDown, Sparkles, Edit, Trash2
} from "lucide-react";

const stores = [
  { id: 'carrefour', name: 'كارفور', color: 'bg-blue-500', icon: '🛒' },
  { id: 'noon', name: 'نون', color: 'bg-yellow-500', icon: '🌙' },
  { id: 'amazon', name: 'أمازون', color: 'bg-orange-500', icon: '📦' },
  { id: 'kazyon', name: 'كازيون', color: 'bg-red-500', icon: '🏪' },
  { id: 'hyperone', name: 'هايبر وان', color: 'bg-green-500', icon: '🏬' },
  { id: 'spinneys', name: 'سبينيز', color: 'bg-purple-500', icon: '🛍️' }
];

export default function SmartShoppingAssistant({ shoppingList = [], onClose }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [showManualPrice, setShowManualPrice] = useState(false);
  const [manualPriceData, setManualPriceData] = useState({ product: '', store: '', price: '' });
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // Fetch saved price records
  const { data: priceRecords = [] } = useQuery({
    queryKey: ['priceRecords'],
    queryFn: () => base44.entities.PriceRecord.list('-record_date', 200)
  });

  // Save price record mutation
  const savePriceMutation = useMutation({
    mutationFn: (data) => base44.entities.PriceRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceRecords'] });
      setShowManualPrice(false);
      setManualPriceData({ product: '', store: '', price: '' });
    }
  });

  // Compare all shopping list items
  const compareAllPrices = async () => {
    if (shoppingList.length === 0) return;
    
    setLoading(true);
    try {
      const items = shoppingList.map(i => `${i.name} (${i.quantity} ${i.unit || 'قطعة'})`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد تسوق ذكي. قدم تقديرات أسعار لهذه المنتجات في السوق المصري:

قائمة التسوق:
${items}

المتاجر:
- كارفور مصر
- نون مصر  
- أمازون مصر
- كازيون
- هايبر وان

لكل منتج قدم السعر التقديري في كل متجر وأفضل سعر.`,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "string" },
                  prices: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        store: { type: "string" },
                        price: { type: "number" },
                        original_price: { type: "number" },
                        available: { type: "boolean" },
                        offer: { type: "string" }
                      }
                    }
                  },
                  best_price: { type: "number" },
                  best_store: { type: "string" },
                  savings_percent: { type: "number" }
                }
              }
            },
            store_totals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store: { type: "string" },
                  total: { type: "number" },
                  items_available: { type: "number" },
                  items_unavailable: { type: "number" }
                }
              }
            },
            best_store_overall: { type: "string" },
            best_store_total: { type: "number" },
            mixed_strategy_total: { type: "number" },
            total_savings: { type: "number" },
            savings_strategy: { type: "string" },
            current_offers: { type: "array", items: { type: "string" } },
            price_alerts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  message: { type: "string" },
                  type: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      setComparison(response);
      
      // Check for price alerts
      if (response.price_alerts?.length > 0) {
        setPriceAlerts(response.price_alerts);
      }

      // Save prices to database for future reference
      for (const item of response.items || []) {
        for (const priceInfo of item.prices || []) {
          if (priceInfo.price > 0) {
            await base44.entities.PriceRecord.create({
              product_name: item.name,
              store_name: priceInfo.store,
              price: priceInfo.price,
              is_offer: !!priceInfo.offer,
              record_date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error comparing prices:', error);
    }
    setLoading(false);
  };

  const getStoreInfo = (storeName) => {
    return stores.find(s => 
      storeName?.includes(s.name) || 
      s.name.includes(storeName) ||
      s.id === storeName?.toLowerCase()
    ) || { icon: '🏪', color: 'bg-slate-500', name: storeName };
  };

  const handleManualPriceSave = () => {
    if (!manualPriceData.product || !manualPriceData.store || !manualPriceData.price) return;
    
    savePriceMutation.mutate({
      product_name: manualPriceData.product,
      store_name: manualPriceData.store,
      price: Number(manualPriceData.price),
      record_date: new Date().toISOString().split('T')[0],
      notes: 'تم إضافته يدوياً'
    });
  };

  return (
    <Card className="bg-white border-0 shadow-xl max-h-[90vh] overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            مساعد التسوق الذكي
          </CardTitle>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <ScrollArea className="max-h-[calc(90vh-80px)]">
        <CardContent className="p-4">
          <Tabs defaultValue="compare">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="compare">مقارنة الأسعار</TabsTrigger>
              <TabsTrigger value="alerts" className="gap-1">
                <Bell className="w-3 h-3" />
                التنبيهات
                {priceAlerts.length > 0 && (
                  <Badge className="bg-red-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {priceAlerts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="manual">إضافة يدوية</TabsTrigger>
            </TabsList>

            {/* Compare Tab */}
            <TabsContent value="compare" className="space-y-4">
              {/* Shopping List Summary */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">قائمة التسوق</span>
                  <Badge variant="secondary">{shoppingList.length} منتج</Badge>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-auto">
                  {shoppingList.map((item, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {item.name} ({item.quantity})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compare Button */}
              <Button 
                onClick={compareAllPrices} 
                disabled={loading || shoppingList.length === 0}
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري البحث عن أفضل الأسعار...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    قارن الأسعار الآن
                  </>
                )}
              </Button>

              {/* Results */}
              {comparison && (
                <div className="space-y-4">
                  {/* Best Deal Summary */}
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5" />
                      <span className="font-bold">أفضل صفقة</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-green-100 text-sm">أفضل متجر شامل</p>
                        <p className="text-xl font-bold">{comparison.best_store_overall}</p>
                        <p className="text-lg">{comparison.best_store_total} ج.م</p>
                      </div>
                      <div>
                        <p className="text-green-100 text-sm">استراتيجية مختلطة</p>
                        <p className="text-xl font-bold">{comparison.mixed_strategy_total} ج.م</p>
                        <Badge className="bg-white/20 text-white mt-1">
                          وفّر {comparison.total_savings} ج.م
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Strategy */}
                  {comparison.savings_strategy && (
                    <div className="p-3 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-700">💡 {comparison.savings_strategy}</p>
                    </div>
                  )}

                  {/* Store Totals */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">إجمالي كل متجر</h4>
                    {comparison.store_totals?.sort((a, b) => a.total - b.total).map((store, i) => {
                      const storeInfo = getStoreInfo(store.store);
                      const isBest = i === 0;
                      return (
                        <div 
                          key={i} 
                          className={`p-3 rounded-xl border ${isBest ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{storeInfo.icon}</span>
                              <div>
                                <p className="font-medium">{store.store}</p>
                                <p className="text-xs text-slate-500">
                                  {store.items_available} متوفر
                                  {store.items_unavailable > 0 && (
                                    <span className="text-red-500"> • {store.items_unavailable} غير متوفر</span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className={`font-bold text-lg ${isBest ? 'text-green-600' : ''}`}>
                                {store.total} ج.م
                              </p>
                              {isBest && <Badge className="bg-green-100 text-green-700">الأرخص</Badge>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Item Details */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">تفاصيل المنتجات</h4>
                    {comparison.items?.map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-bold">{item.best_price} ج.م</span>
                            <Badge variant="outline" className="text-xs">{item.best_store}</Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.prices?.map((p, j) => {
                            const storeInfo = getStoreInfo(p.store);
                            const isBest = p.store === item.best_store;
                            return (
                              <Badge 
                                key={j} 
                                variant={isBest ? "default" : "outline"}
                                className={`text-xs ${!p.available ? 'opacity-50' : ''} ${isBest ? 'bg-green-600' : ''}`}
                              >
                                {storeInfo.icon} {p.price} ج.م
                                {p.offer && <span className="text-red-300 mr-1">🎁</span>}
                              </Badge>
                            );
                          })}
                        </div>
                        {item.savings_percent > 0 && (
                          <p className="text-xs text-green-600 mt-1">
                            <ArrowDown className="w-3 h-3 inline" /> وفّر {item.savings_percent}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Current Offers */}
                  {comparison.current_offers?.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-xl">
                      <h4 className="font-semibold text-red-700 mb-2">🎁 العروض الحالية</h4>
                      <ul className="space-y-1">
                        {comparison.current_offers.map((offer, i) => (
                          <li key={i} className="text-sm text-red-600">• {offer}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!comparison && !loading && shoppingList.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>أضف منتجات لقائمة التسوق للمقارنة</p>
                </div>
              )}
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span>تنبيهات الأسعار</span>
                </div>
                <Switch 
                  checked={alertsEnabled} 
                  onCheckedChange={setAlertsEnabled}
                />
              </div>

              {priceAlerts.length > 0 ? (
                <div className="space-y-2">
                  {priceAlerts.map((alert, i) => (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl ${
                        alert.type === 'drop' ? 'bg-green-50 border border-green-200' :
                        alert.type === 'increase' ? 'bg-red-50 border border-red-200' :
                        'bg-blue-50 border border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {alert.type === 'drop' ? (
                          <ArrowDown className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : alert.type === 'increase' ? (
                          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        ) : (
                          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">{alert.product}</p>
                          <p className={`text-sm ${
                            alert.type === 'drop' ? 'text-green-600' :
                            alert.type === 'increase' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد تنبيهات حالياً</p>
                  <p className="text-sm">سيتم إشعارك عند انخفاض أسعار منتجاتك</p>
                </div>
              )}

              {/* Historical Prices */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">سجل الأسعار المحفوظة</h4>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {priceRecords.slice(0, 20).map((record, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{record.product_name}</span>
                          <span className="text-slate-400 mr-2">- {record.store_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{record.price} ج.م</span>
                          {record.is_offer && <Badge className="bg-red-100 text-red-600 text-xs">عرض</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Manual Price Tab */}
            <TabsContent value="manual" className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-700">
                  💡 أضف أسعار المنتجات يدوياً لتحسين دقة المقارنة في المستقبل
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>اسم المنتج</Label>
                  <Input
                    placeholder="مثال: حليب جهينة 1 لتر"
                    value={manualPriceData.product}
                    onChange={(e) => setManualPriceData({...manualPriceData, product: e.target.value})}
                  />
                </div>

                <div>
                  <Label>المتجر</Label>
                  <Select 
                    value={manualPriceData.store} 
                    onValueChange={(v) => setManualPriceData({...manualPriceData, store: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المتجر" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.name}>
                          {store.icon} {store.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">🏪 متجر آخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>السعر (ج.م)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={manualPriceData.price}
                    onChange={(e) => setManualPriceData({...manualPriceData, price: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={handleManualPriceSave}
                  disabled={!manualPriceData.product || !manualPriceData.store || !manualPriceData.price}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  حفظ السعر
                </Button>
              </div>

              {/* Recent Manual Entries */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">الأسعار المضافة يدوياً</h4>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {priceRecords
                      .filter(r => r.notes?.includes('يدوياً'))
                      .slice(0, 10)
                      .map((record, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                          <div>
                            <span className="font-medium">{record.product_name}</span>
                            <span className="text-slate-400 mr-2">- {record.store_name}</span>
                          </div>
                          <span className="font-bold">{record.price} ج.م</span>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}