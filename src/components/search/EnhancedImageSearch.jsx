import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Camera, Loader2, X, ShoppingCart, Plus, 
  Leaf, AlertTriangle, Star, DollarSign, RefreshCw,
  ThumbsUp, ThumbsDown, Apple, Sparkles
} from "lucide-react";

export default function EnhancedImageSearch({ onAddToInventory, onAddToCart, onClose }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  const analyzeImage = async (file) => {
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل هذه الصورة للمنتج الغذائي بشكل شامل ومفصل.

قدم التحليل التالي:
1. تحديد المنتج بدقة (الاسم، النوع، العلامة التجارية إن وجدت)
2. تقييم الجودة والنضارة (من 1-10 مع شرح)
3. علامات تدل على الجودة الجيدة أو السيئة
4. السعر التقديري في السوق المصري
5. معلومات غذائية (سعرات، بروتين، كربوهيدرات، إلخ)
6. فوائد صحية
7. تحذيرات أو ملاحظات
8. بدائل مقترحة (إذا كان المنتج غير متوفر أو باهظ)
9. نصائح للشراء والتخزين
10. أفضل المتاجر لشراء هذا المنتج`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            category: { type: "string" },
            brand: { type: "string" },
            freshness_score: { type: "number" },
            freshness_description: { type: "string" },
            quality_indicators: {
              type: "object",
              properties: {
                good_signs: { type: "array", items: { type: "string" } },
                bad_signs: { type: "array", items: { type: "string" } }
              }
            },
            estimated_price: { type: "number" },
            price_range: { type: "string" },
            nutrition: {
              type: "object",
              properties: {
                calories: { type: "number" },
                protein: { type: "string" },
                carbs: { type: "string" },
                fat: { type: "string" },
                fiber: { type: "string" }
              }
            },
            health_benefits: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            alternatives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" },
                  price_comparison: { type: "string" }
                }
              }
            },
            buying_tips: { type: "array", items: { type: "string" } },
            storage_tips: { type: "array", items: { type: "string" } },
            recommended_stores: { type: "array", items: { type: "string" } },
            is_recommended: { type: "boolean" },
            recommendation_reason: { type: "string" }
          }
        }
      });
      
      setAnalysis(response);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
    setLoading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      analyzeImage(file);
    }
  };

  const getFreshnessColor = (score) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white border-0 shadow-xl max-h-[90vh] overflow-hidden">
      <CardHeader className="pb-3 border-b flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-600" />
          تحليل الصور الذكي
        </CardTitle>
        {onClose && (
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <ScrollArea className="max-h-[calc(90vh-80px)]">
        <CardContent className="p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {!imageUrl && !loading && (
            <div 
              className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center cursor-pointer hover:bg-purple-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-purple-700">التقط صورة أو اختر من المعرض</p>
              <p className="text-sm text-slate-500 mt-2">سيتم تحليل الصورة للتعرف على المنتج وتقييم جودته</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-slate-600">جاري تحليل الصورة...</p>
              <p className="text-sm text-slate-400 mt-2">التعرف على المنتج وتقييم الجودة</p>
            </div>
          )}

          {imageUrl && analysis && (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Product" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <RefreshCw className="w-4 h-4 ml-1" />
                  صورة جديدة
                </Button>
              </div>

              {/* Product Info */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-xl">{analysis.product_name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{analysis.category}</Badge>
                      {analysis.brand && <Badge variant="secondary">{analysis.brand}</Badge>}
                    </div>
                  </div>
                  {analysis.is_recommended ? (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      موصى به
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-700 gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      غير موصى
                    </Badge>
                  )}
                </div>
                {analysis.recommendation_reason && (
                  <p className="text-sm text-slate-600">{analysis.recommendation_reason}</p>
                )}
              </div>

              {/* Freshness Score */}
              <div className="p-4 bg-white border rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-600" />
                    تقييم النضارة والجودة
                  </span>
                  <span className="text-2xl font-bold">{analysis.freshness_score}/10</span>
                </div>
                <Progress 
                  value={analysis.freshness_score * 10} 
                  className={`h-3 ${getFreshnessColor(analysis.freshness_score)}`}
                />
                <p className="text-sm text-slate-600 mt-2">{analysis.freshness_description}</p>
              </div>

              {/* Quality Indicators */}
              {analysis.quality_indicators && (
                <div className="grid grid-cols-2 gap-3">
                  {analysis.quality_indicators.good_signs?.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-xl">
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        علامات جيدة
                      </h4>
                      <ul className="space-y-1">
                        {analysis.quality_indicators.good_signs.map((sign, i) => (
                          <li key={i} className="text-sm text-green-600">✓ {sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.quality_indicators.bad_signs?.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-xl">
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                        <ThumbsDown className="w-4 h-4" />
                        علامات تحذيرية
                      </h4>
                      <ul className="space-y-1">
                        {analysis.quality_indicators.bad_signs.map((sign, i) => (
                          <li key={i} className="text-sm text-red-600">✗ {sign}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    السعر التقديري
                  </span>
                  <div className="text-left">
                    <span className="text-2xl font-bold text-blue-700">{analysis.estimated_price} ج.م</span>
                    {analysis.price_range && (
                      <p className="text-xs text-blue-500">{analysis.price_range}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Nutrition */}
              {analysis.nutrition && (
                <div className="p-4 bg-amber-50 rounded-xl">
                  <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <Apple className="w-4 h-4" />
                    المعلومات الغذائية (لكل 100 جرام)
                  </h4>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-lg font-bold text-amber-700">{analysis.nutrition.calories}</p>
                      <p className="text-xs text-slate-500">سعرة</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-sm font-bold text-amber-700">{analysis.nutrition.protein}</p>
                      <p className="text-xs text-slate-500">بروتين</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-sm font-bold text-amber-700">{analysis.nutrition.carbs}</p>
                      <p className="text-xs text-slate-500">كربو</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-sm font-bold text-amber-700">{analysis.nutrition.fat}</p>
                      <p className="text-xs text-slate-500">دهون</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg">
                      <p className="text-sm font-bold text-amber-700">{analysis.nutrition.fiber}</p>
                      <p className="text-xs text-slate-500">ألياف</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Health Benefits */}
              {analysis.health_benefits?.length > 0 && (
                <div className="p-3 bg-green-50 rounded-xl">
                  <h4 className="font-semibold text-green-700 mb-2">🌿 الفوائد الصحية</h4>
                  <div className="flex flex-wrap gap-1">
                    {analysis.health_benefits.map((b, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700">{b}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {analysis.warnings?.length > 0 && (
                <div className="p-3 bg-red-50 rounded-xl">
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    تحذيرات
                  </h4>
                  <ul className="space-y-1">
                    {analysis.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-red-600">⚠ {w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternatives */}
              {analysis.alternatives?.length > 0 && (
                <div className="p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    بدائل مقترحة
                  </h4>
                  <div className="space-y-2">
                    {analysis.alternatives.map((alt, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{alt.name}</p>
                          <p className="text-xs text-slate-500">{alt.reason}</p>
                        </div>
                        <Badge variant="outline" className="text-purple-600">{alt.price_comparison}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="grid grid-cols-2 gap-3">
                {analysis.buying_tips?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-700 mb-2">🛒 نصائح الشراء</h4>
                    <ul className="space-y-1">
                      {analysis.buying_tips.slice(0, 3).map((t, i) => (
                        <li key={i} className="text-xs text-slate-600">• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.storage_tips?.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <h4 className="font-semibold text-slate-700 mb-2">📦 نصائح التخزين</h4>
                    <ul className="space-y-1">
                      {analysis.storage_tips.slice(0, 3).map((t, i) => (
                        <li key={i} className="text-xs text-slate-600">• {t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Recommended Stores */}
              {analysis.recommended_stores?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-slate-600">المتاجر الموصى بها:</span>
                  {analysis.recommended_stores.map((store, i) => (
                    <Badge key={i} variant="secondary">{store}</Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1"
                  variant="outline"
                  onClick={() => onAddToInventory?.({
                    name: analysis.product_name,
                    category: analysis.category,
                    last_purchase_price: analysis.estimated_price
                  })}
                >
                  <Plus className="w-4 h-4 ml-1" />
                  أضف للمخزون
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => onAddToCart?.({
                    name: analysis.product_name,
                    category: analysis.category,
                    estimated_price: analysis.estimated_price
                  })}
                >
                  <ShoppingCart className="w-4 h-4 ml-1" />
                  أضف للتسوق
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}