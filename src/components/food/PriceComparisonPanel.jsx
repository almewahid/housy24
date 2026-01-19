import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingDown, ExternalLink, ShoppingCart, Store, Search, Sparkles, Info } from "lucide-react";

// روابط المتاجر الحقيقية
const storeLinks = {
  "نون": (q) => `https://www.noon.com/egypt-ar/search/?q=${encodeURIComponent(q)}`,
  "أمازون": (q) => `https://www.amazon.eg/s?k=${encodeURIComponent(q)}`,
  "كارفور": (q) => `https://www.carrefouregypt.com/mafegy/ar/search/?text=${encodeURIComponent(q)}`,
  "كازيون": () => `https://kazyon.com.eg/`,
  "بيم": () => `https://www.bim.com.eg/`,
  "لولو": (q) => `https://www.luluhypermarket.com/en-ae/search?q=${encodeURIComponent(q)}`
};

export default function PriceComparisonPanel({ productName, category, onAddToCart }) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const openStore = (storeName) => {
    const linkFn = storeLinks[storeName];
    if (linkFn) {
      window.open(linkFn(productName), '_blank');
    }
  };

  const searchPrices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `أريد معلومات عن شراء "${productName}" (${category || 'طعام'}).

أعطني:
1. نطاق السعر التقريبي المتوقع
2. أفضل المتاجر لشرائه (نون، أمازون، كارفور، لولو)
3. نصائح للتوفير
4. أفضل وقت للشراء

ملاحظة: هذه تقديرات عامة وليست أسعار حقيقية مباشرة من المتاجر.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            estimated_price_range: { type: "string" },
            recommended_stores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store_name: { type: "string" },
                  why: { type: "string" },
                  estimated_price: { type: "string" }
                }
              }
            },
            best_time_to_buy: { type: "string" },
            buying_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      setResults(response);
    } catch (err) {
      setError('حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingDown className="w-5 h-5 text-blue-600" />
          معلومات الشراء
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Important Notice */}
        <Alert className="bg-amber-50/80 border-amber-200">
          <Info className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-700 text-xs">
            الأسعار تقديرية. للسعر الدقيق والطلب، اضغط على اسم المتجر.
          </AlertDescription>
        </Alert>

        {!results && !loading && (
          <div className="text-center py-4">
            <p className="text-slate-600 mb-4">معلومات عن شراء "{productName}"</p>
            <Button onClick={searchPrices} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Search className="w-4 h-4" />
              بحث
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-slate-600">جاري البحث...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <Button variant="outline" onClick={searchPrices} className="mt-2">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {/* Estimated Price */}
            {results.estimated_price_range && (
              <div className="bg-green-100 rounded-xl p-4 text-center">
                <p className="text-sm text-green-600 mb-1">السعر التقريبي</p>
                <p className="text-2xl font-bold text-green-800">{results.estimated_price_range}</p>
              </div>
            )}

            {/* Stores List */}
            {results.recommended_stores?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">المتاجر المقترحة (اضغط للذهاب للمتجر):</h4>
                {results.recommended_stores.map((store, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg p-3 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openStore(store.store_name)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-blue-600 underline">{store.store_name}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400" />
                      </div>
                      <p className="text-sm text-slate-500">{store.why}</p>
                    </div>
                    {store.estimated_price && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        ~{store.estimated_price}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Best Time */}
            {results.best_time_to_buy && (
              <div className="text-center bg-purple-50 rounded-lg p-3">
                <span className="text-purple-600 text-sm">⏰ أفضل وقت للشراء: </span>
                <span className="font-medium text-purple-800">{results.best_time_to_buy}</span>
              </div>
            )}

            {/* Buying Tips */}
            {results.buying_tips?.length > 0 && (
              <div className="bg-amber-50 rounded-lg p-3">
                <h5 className="font-semibold text-amber-800 mb-2">💡 نصائح:</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {results.buying_tips.map((tip, idx) => (
                    <li key={idx}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Add to Shopping List */}
            <Button onClick={onAddToCart} className="w-full gap-2 bg-orange-600 hover:bg-orange-700">
              <ShoppingCart className="w-4 h-4" />
              إضافة لقائمة التسوق
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}