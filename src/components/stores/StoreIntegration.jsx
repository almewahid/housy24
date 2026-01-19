import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, Loader2, Search, ExternalLink, ShoppingCart,
  TrendingDown, Star, Package, RefreshCw, DollarSign
} from "lucide-react";

const stores = [
  { 
    id: 'carrefour', 
    name: 'كارفور', 
    logo: '🛒',
    baseUrl: 'https://www.carrefouregypt.com',
    searchUrl: 'https://www.carrefouregypt.com/mafegy/ar/search?text=',
    color: 'bg-blue-500'
  },
  { 
    id: 'noon', 
    name: 'نون', 
    logo: '🌙',
    baseUrl: 'https://www.noon.com',
    searchUrl: 'https://www.noon.com/egypt-ar/search?q=',
    color: 'bg-yellow-500'
  },
  { 
    id: 'amazon', 
    name: 'أمازون مصر', 
    logo: '📦',
    baseUrl: 'https://www.amazon.eg',
    searchUrl: 'https://www.amazon.eg/s?k=',
    color: 'bg-orange-500'
  },
  { 
    id: 'kazyon', 
    name: 'كازيون', 
    logo: '🏪',
    baseUrl: 'https://kazyon.com.eg',
    searchUrl: 'https://kazyon.com.eg/?s=',
    color: 'bg-red-500'
  },
  { 
    id: 'hyper', 
    name: 'هايبر وان', 
    logo: '🏬',
    baseUrl: 'https://www.hyperone.com.eg',
    searchUrl: 'https://www.hyperone.com.eg/ar/search?q=',
    color: 'bg-green-500'
  }
];

export default function StoreIntegration({ shoppingList = [], onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [priceComparison, setPriceComparison] = useState(null);
  const [selectedStore, setSelectedStore] = useState('all');

  const searchPrices = async (productName) => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `ابحث عن أسعار "${productName || searchQuery}" في المتاجر المصرية الكبرى.

قدم مقارنة أسعار تشمل:
- كارفور مصر
- نون مصر
- أمازون مصر
- كازيون
- هايبر وان

لكل متجر قدم:
- السعر التقديري
- توفر المنتج
- العروض الحالية إن وجدت
- رابط البحث المباشر`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            stores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store_id: { type: "string" },
                  store_name: { type: "string" },
                  price: { type: "number" },
                  original_price: { type: "number" },
                  available: { type: "boolean" },
                  offer: { type: "string" },
                  rating: { type: "number" }
                }
              }
            },
            best_deal: {
              type: "object",
              properties: {
                store: { type: "string" },
                price: { type: "number" },
                savings: { type: "number" }
              }
            },
            price_trend: { type: "string" },
            buying_recommendation: { type: "string" }
          }
        }
      });
      setPriceComparison(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const openStoreSearch = (store, query) => {
    const searchUrl = store.searchUrl + encodeURIComponent(query || searchQuery);
    window.open(searchUrl, '_blank');
  };

  const compareShoppingList = async () => {
    if (shoppingList.length === 0) return;
    
    setLoading(true);
    try {
      const items = shoppingList.map(i => `${i.name} (${i.quantity} ${i.unit || ''})`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قارن أسعار قائمة التسوق التالية في المتاجر المصرية:

${items}

قدم:
1. أفضل متجر لشراء كل منتج
2. إجمالي التكلفة في كل متجر
3. استراتيجية التوفير (هل من الأفضل الشراء من متجر واحد أم التقسيم)
4. العروض المتاحة حالياً`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            items_breakdown: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  item_name: { type: "string" },
                  best_store: { type: "string" },
                  best_price: { type: "number" },
                  alternatives: { type: "array", items: { type: "string" } }
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
                  items_available: { type: "number" }
                }
              }
            },
            recommended_strategy: { type: "string" },
            potential_savings: { type: "number" },
            current_offers: { type: "array", items: { type: "string" } }
          }
        }
      });
      setPriceComparison({ type: 'list', data: response });
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-600" />
          تكامل المتاجر الإلكترونية
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs defaultValue="search">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="search">بحث منتج</TabsTrigger>
            <TabsTrigger value="compare">مقارنة قائمة</TabsTrigger>
            <TabsTrigger value="stores">المتاجر</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchPrices()}
                />
                <Button onClick={() => searchPrices()} disabled={loading || !searchQuery}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {/* Quick Store Links */}
              <div className="flex gap-2 flex-wrap">
                {stores.map(store => (
                  <Button
                    key={store.id}
                    size="sm"
                    variant="outline"
                    onClick={() => openStoreSearch(store, searchQuery)}
                    className="gap-1"
                    disabled={!searchQuery}
                  >
                    <span>{store.logo}</span>
                    {store.name}
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                ))}
              </div>

              {/* Price Comparison Results */}
              {priceComparison && priceComparison.stores && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">{priceComparison.product_name}</h3>

                  {/* Best Deal */}
                  {priceComparison.best_deal && (
                    <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">أفضل سعر</p>
                          <p className="text-2xl font-bold">{priceComparison.best_deal.price} ج.م</p>
                          <p className="text-green-100 text-sm">{priceComparison.best_deal.store}</p>
                        </div>
                        {priceComparison.best_deal.savings > 0 && (
                          <Badge className="bg-white/20 text-white">
                            وفر {priceComparison.best_deal.savings} ج.م
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Store Prices */}
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {priceComparison.stores.map((store, i) => {
                        const storeInfo = stores.find(s => s.name === store.store_name || s.id === store.store_id);
                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border ${store.available ? 'bg-white' : 'bg-slate-50 opacity-60'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{storeInfo?.logo || '🏪'}</span>
                                <div>
                                  <p className="font-medium">{store.store_name}</p>
                                  {store.offer && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">{store.offer}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-lg">{store.price} ج.م</p>
                                {store.original_price > store.price && (
                                  <p className="text-sm text-slate-400 line-through">{store.original_price} ج.م</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                {store.available ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">متوفر</Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-700 text-xs">غير متوفر</Badge>
                                )}
                                {store.rating && (
                                  <Badge variant="outline" className="text-xs gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    {store.rating}
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => storeInfo && openStoreSearch(storeInfo, priceComparison.product_name)}
                              >
                                <ExternalLink className="w-3 h-3 ml-1" />
                                زيارة
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Recommendation */}
                  {priceComparison.buying_recommendation && (
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-700">💡 {priceComparison.buying_recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compare">
            <div className="space-y-4">
              {shoppingList.length > 0 ? (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600 mb-2">قائمة التسوق ({shoppingList.length} منتج)</p>
                    <div className="flex flex-wrap gap-1">
                      {shoppingList.slice(0, 5).map((item, i) => (
                        <Badge key={i} variant="outline">{item.name}</Badge>
                      ))}
                      {shoppingList.length > 5 && (
                        <Badge variant="secondary">+{shoppingList.length - 5}</Badge>
                      )}
                    </div>
                  </div>

                  <Button onClick={compareShoppingList} disabled={loading} className="w-full gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingDown className="w-4 h-4" />}
                    قارن الأسعار في المتاجر
                  </Button>

                  {priceComparison?.type === 'list' && priceComparison.data && (
                    <div className="space-y-4">
                      {/* Store Totals */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">إجمالي التكلفة حسب المتجر</h4>
                        {priceComparison.data.store_totals?.map((store, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium">{store.store}</p>
                              <p className="text-xs text-slate-500">{store.items_available} منتج متوفر</p>
                            </div>
                            <p className="font-bold text-lg">{store.total} ج.م</p>
                          </div>
                        ))}
                      </div>

                      {/* Strategy */}
                      {priceComparison.data.recommended_strategy && (
                        <div className="p-4 bg-green-50 rounded-xl">
                          <h4 className="font-semibold text-green-700 mb-2">💡 استراتيجية التوفير</h4>
                          <p className="text-sm text-green-600">{priceComparison.data.recommended_strategy}</p>
                          {priceComparison.data.potential_savings > 0 && (
                            <Badge className="bg-green-100 text-green-700 mt-2">
                              توفير محتمل: {priceComparison.data.potential_savings} ج.م
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Current Offers */}
                      {priceComparison.data.current_offers?.length > 0 && (
                        <div className="p-3 bg-amber-50 rounded-xl">
                          <h4 className="font-semibold text-amber-700 mb-2">🎁 العروض الحالية</h4>
                          <ul className="space-y-1">
                            {priceComparison.data.current_offers.map((offer, i) => (
                              <li key={i} className="text-sm text-amber-600">• {offer}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>قائمة التسوق فارغة</p>
                  <p className="text-sm">أضف منتجات للمقارنة</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stores">
            <div className="space-y-3">
              {stores.map(store => (
                <div key={store.id} className="p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${store.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                        {store.logo}
                      </div>
                      <div>
                        <p className="font-bold">{store.name}</p>
                        <p className="text-xs text-slate-500">{store.baseUrl}</p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => window.open(store.baseUrl, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-blue-50 rounded-xl mt-4">
                <h4 className="font-semibold text-blue-700 mb-2">🚀 قريباً</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• ربط مباشر مع API المتاجر</li>
                  <li>• تحديث الأسعار لحظياً</li>
                  <li>• الشراء المباشر من التطبيق</li>
                  <li>• تتبع الطلبات</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}