import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Search, ExternalLink, ShoppingCart, Loader2, Star, MapPin, Phone, MessageCircle, Info, AlertTriangle, X } from "lucide-react";

// روابط المتاجر الحقيقية للبحث
const onlineStores = [
  { 
    name: "نون", 
    logo: "🛒", 
    color: "bg-yellow-100",
    searchUrl: (q) => `https://www.noon.com/search/?q=${encodeURIComponent(q)}`,
    countries: ["السعودية", "الإمارات", "مصر"]
  },
  { 
    name: "أمازون", 
    logo: "📦", 
    color: "bg-orange-100",
    searchUrl: (q) => `https://www.amazon.sa/s?k=${encodeURIComponent(q)}`,
    countries: ["السعودية", "الإمارات"]
  },
  { 
    name: "كارفور", 
    logo: "🏪", 
    color: "bg-blue-100",
    searchUrl: (q) => `https://www.carrefouregypt.com/mafegy/ar/search/?text=${encodeURIComponent(q)}`,
    countries: ["مصر"]
  },
  { 
    name: "كازيون", 
    logo: "🏪", 
    color: "bg-green-100",
    searchUrl: (q) => `https://kazyon.com.eg/`,
    countries: ["مصر"]
  },
  { 
    name: "بيم", 
    logo: "🛒", 
    color: "bg-red-100",
    searchUrl: (q) => `https://www.bim.com.eg/`,
    countries: ["مصر"]
  },
  { 
    name: "طلبات مارت", 
    logo: "🛍️", 
    color: "bg-orange-100",
    searchUrl: (q) => `https://www.talabat.com/uae/grocery`,
    countries: ["الإمارات", "مصر", "الكويت"]
  },
  { 
    name: "الدانوب", 
    logo: "🏬", 
    color: "bg-red-100",
    searchUrl: (q) => `https://www.danubehome.com/sa/en/search?q=${encodeURIComponent(q)}`,
    countries: ["السعودية"]
  }
];

export default function OnlineStoresPanel({ productName, category, suppliers, onAddToCart, onAddToInventory, onClose }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(productName || '');
  const [results, setResults] = useState(null);

  const openStoreSearch = (store) => {
    const url = store.searchUrl(searchQuery);
    window.open(url, '_blank');
  };

  const searchPrices = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `أريد معرفة معلومات عن شراء "${searchQuery}" في المتاجر العربية.

أعطني:
1. نطاق الأسعار التقريبي المتوقع (ليس سعر دقيق)
2. أفضل المتاجر لشراء هذا المنتج
3. نصائح للحصول على أفضل سعر
4. بدائل أرخص إن وجدت
5. ملاحظات عن جودة المنتج

ملاحظة: هذه تقديرات عامة وليست أسعار حقيقية مباشرة.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            estimated_price_range: { type: "string", description: "نطاق السعر التقريبي" },
            recommended_stores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store_name: { type: "string" },
                  why_recommended: { type: "string" },
                  price_level: { type: "string", enum: ["اقتصادي", "متوسط", "مرتفع"] }
                }
              }
            },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  benefit: { type: "string" }
                }
              }
            },
            buying_tips: { type: "array", items: { type: "string" } },
            quality_notes: { type: "string" }
          }
        }
      });
      setResults(result);
    } catch (error) {
      console.error('Error searching prices:', error);
    }
    setLoading(false);
  };

  const relevantSuppliers = suppliers?.filter(s => 
    s.category === 'سوبر ماركت' || 
    s.category === 'بقالة' || 
    s.category?.includes(category)
  ) || [];

  return (
    <Card className="bg-white border-0 shadow-lg max-h-[90vh] flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            البحث في المتاجر
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {/* Important Notice */}
        <Alert className="mb-4 bg-amber-50 border-amber-200">
          <Info className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-sm">
            <strong>ملاحظة:</strong> الأسعار المعروضة تقديرية. للأسعار الدقيقة والطلب، اضغط على المتجر للذهاب مباشرة لموقعه.
          </AlertDescription>
        </Alert>

        {/* Search */}
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="اكتب اسم المنتج (مثال: أرز بسمتي، زيت زيتون)"
            onKeyPress={(e) => e.key === 'Enter' && searchPrices()}
          />
          <Button onClick={searchPrices} disabled={loading || !searchQuery.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {/* Online Stores - Direct Links */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2 text-slate-600">🛒 اذهب مباشرة للمتجر للبحث والشراء:</h4>
          <div className="flex gap-2 flex-wrap">
            {onlineStores.map(store => (
              <Button 
                key={store.name} 
                variant="outline" 
                size="sm"
                className={`${store.color} border-0`}
                onClick={() => openStoreSearch(store)}
                disabled={!searchQuery.trim()}
              >
                <span className="ml-1">{store.logo}</span>
                {store.name}
                <ExternalLink className="w-3 h-3 mr-1" />
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Results */}
          {results && (
            <div className="space-y-4">
              {/* Estimated Price Range */}
              {results.estimated_price_range && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-1">💰 السعر التقريبي</h4>
                  <p className="text-xl font-bold text-blue-700">{results.estimated_price_range}</p>
                  <p className="text-xs text-blue-600 mt-1">* تقدير عام - الأسعار تختلف حسب المتجر والموقع</p>
                </div>
              )}

              {/* Recommended Stores */}
              {results.recommended_stores?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">🏆 أفضل المتاجر للشراء</h4>
                  <div className="space-y-2">
                    {results.recommended_stores.map((store, i) => {
                      const storeInfo = onlineStores.find(s => s.name.includes(store.store_name) || store.store_name.includes(s.name));
                      return (
                        <div key={i} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{store.store_name}</span>
                            <Badge className={
                              store.price_level === 'اقتصادي' ? 'bg-green-100 text-green-700' :
                              store.price_level === 'مرتفع' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }>
                              {store.price_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{store.why_recommended}</p>
                          {storeInfo && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => openStoreSearch(storeInfo)}
                            >
                              <ExternalLink className="w-3 h-3 ml-1" />
                              ابحث في {store.store_name}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {results.alternatives?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">💡 بدائل مقترحة</h4>
                  <div className="space-y-2">
                    {results.alternatives.map((alt, i) => (
                      <div key={i} className="p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">{alt.name}</span>
                        <p className="text-sm text-green-600">{alt.benefit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Notes */}
              {results.quality_notes && (
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-1">📝 ملاحظات عن الجودة</h5>
                  <p className="text-sm text-purple-700">{results.quality_notes}</p>
                </div>
              )}

              {/* Tips */}
              {results.buying_tips?.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg">
                  <h5 className="font-semibold text-amber-800 mb-2">💡 نصائح الشراء</h5>
                  <ul className="text-sm space-y-1">
                    {results.buying_tips.map((tip, i) => (
                      <li key={i} className="text-amber-700">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => onAddToCart({ name: searchQuery })}
                >
                  <ShoppingCart className="w-4 h-4 ml-1" />
                  أضف للتسوق
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1"
                  onClick={() => onAddToInventory({ name: searchQuery })}
                >
                  أضف للمخزون
                </Button>
              </div>
            </div>
          )}

          {/* Local Suppliers */}
          {relevantSuppliers.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                الموردين المحليين (مضافين من قبلك)
              </h4>
              <div className="space-y-2">
                {relevantSuppliers.map(supplier => (
                  <div key={supplier.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{supplier.name}</span>
                      {supplier.rating && (
                        <div className="flex items-center text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm mr-1">{supplier.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {supplier.phone && (
                        <a href={`tel:${supplier.phone}`}>
                          <Button size="sm" variant="outline" className="h-7">
                            <Phone className="w-3 h-3 ml-1" />
                            اتصال
                          </Button>
                        </a>
                      )}
                      {supplier.whatsapp && (
                        <a href={`https://wa.me/${supplier.whatsapp}`} target="_blank">
                          <Button size="sm" variant="outline" className="h-7 text-green-600">
                            <MessageCircle className="w-3 h-3 ml-1" />
                            واتساب
                          </Button>
                        </a>
                      )}
                      {supplier.google_maps_url && (
                        <a href={supplier.google_maps_url} target="_blank">
                          <Button size="sm" variant="outline" className="h-7">
                            <MapPin className="w-3 h-3 ml-1" />
                            الموقع
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results && !loading && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>اكتب اسم المنتج واضغط بحث</p>
              <p className="text-xs mt-2">أو اضغط على أحد المتاجر للذهاب مباشرة وتصفح الأسعار الحقيقية</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}