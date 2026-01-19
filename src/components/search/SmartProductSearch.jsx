import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Barcode, Camera, Mic, Loader2, X, 
  ShoppingCart, Plus, Info, Star, DollarSign 
} from "lucide-react";

export default function SmartProductSearch({ onAddToInventory, onAddToCart }) {
  const [searchMode, setSearchMode] = useState('text');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);

  // Text Search
  const handleTextSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `ابحث عن معلومات المنتج التالي: "${query}"
        
قدم معلومات تشمل:
- اسم المنتج الكامل
- الفئة
- متوسط السعر في مصر
- المتاجر الموصى بها
- معلومات غذائية إن وجدت
- بدائل أرخص
- نصائح شراء`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            category: { type: "string" },
            average_price: { type: "number" },
            price_range: { type: "string" },
            recommended_stores: { type: "array", items: { type: "string" } },
            nutrition_info: { type: "string" },
            cheaper_alternatives: { type: "array", items: { type: "string" } },
            buying_tips: { type: "array", items: { type: "string" } },
            quality_indicators: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResults(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Barcode Search
  const handleBarcodeSearch = async () => {
    const barcode = query.trim();
    if (!barcode) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `ابحث عن المنتج بالباركود: ${barcode}
إذا لم تجد المنتج بالضبط، قدم معلومات عن منتجات مشابهة.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            category: { type: "string" },
            brand: { type: "string" },
            average_price: { type: "number" },
            found: { type: "boolean" }
          }
        }
      });
      setResults(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Image Search
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `حلل هذه الصورة وحدد المنتج الغذائي فيها.
قدم:
- اسم المنتج
- الفئة
- السعر التقديري
- معلومات إضافية`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            product_name: { type: "string" },
            category: { type: "string" },
            average_price: { type: "number" },
            description: { type: "string" },
            buying_tips: { type: "array", items: { type: "string" } }
          }
        }
      });
      setResults(response);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Voice Search
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('البحث الصوتي غير مدعوم في هذا المتصفح');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-EG';
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setTimeout(() => handleTextSearch(), 500);
    };
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  };

  return (
    <Card className="bg-white border-0 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          البحث الذكي عن المنتجات
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={searchMode} onValueChange={setSearchMode} className="mb-4">
          <TabsList className="grid grid-cols-4 h-auto">
            <TabsTrigger value="text" className="gap-1 py-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">نصي</span>
            </TabsTrigger>
            <TabsTrigger value="barcode" className="gap-1 py-2">
              <Barcode className="w-4 h-4" />
              <span className="hidden sm:inline">باركود</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1 py-2">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">صورة</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1 py-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">صوت</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="ابحث عن منتج..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <Button onClick={handleTextSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="barcode" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="أدخل رقم الباركود..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBarcodeSearch()}
              />
              <Button onClick={handleBarcodeSearch} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Barcode className="w-4 h-4" />}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {loading ? 'جاري التحليل...' : 'التقط صورة أو اختر من المعرض'}
            </Button>
          </TabsContent>

          <TabsContent value="voice" className="mt-4">
            <Button 
              onClick={startVoiceSearch}
              className={`w-full gap-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : ''}`}
              disabled={loading}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening ? 'جاري الاستماع...' : 'اضغط للبحث صوتياً'}
            </Button>
            {query && searchMode === 'voice' && (
              <p className="text-center mt-2 text-sm text-slate-600">"{query}"</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Results */}
        {results && (
          <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg">{results.product_name}</h3>
                <Badge variant="outline">{results.category}</Badge>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setResults(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {results.average_price && (
              <div className="flex items-center gap-2 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span>السعر التقديري: {results.average_price} ج.م</span>
                {results.price_range && <Badge variant="secondary">{results.price_range}</Badge>}
              </div>
            )}

            {results.recommended_stores?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">المتاجر الموصى بها:</p>
                <div className="flex flex-wrap gap-1">
                  {results.recommended_stores.map((store, i) => (
                    <Badge key={i} variant="secondary">{store}</Badge>
                  ))}
                </div>
              </div>
            )}

            {results.cheaper_alternatives?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">بدائل أرخص:</p>
                <div className="flex flex-wrap gap-1">
                  {results.cheaper_alternatives.map((alt, i) => (
                    <Badge key={i} className="bg-green-100 text-green-700">{alt}</Badge>
                  ))}
                </div>
              </div>
            )}

            {results.buying_tips?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1">نصائح الشراء:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {results.buying_tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.nutrition_info && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700 mb-1 flex items-center gap-1">
                  <Info className="w-4 h-4" />
                  معلومات غذائية
                </p>
                <p className="text-sm text-blue-600">{results.nutrition_info}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAddToInventory?.({
                  name: results.product_name,
                  category: results.category,
                  last_purchase_price: results.average_price
                })}
              >
                <Plus className="w-4 h-4 ml-1" />
                أضف للمخزون
              </Button>
              <Button 
                size="sm"
                onClick={() => onAddToCart?.({
                  name: results.product_name,
                  category: results.category,
                  estimated_price: results.average_price
                })}
              >
                <ShoppingCart className="w-4 h-4 ml-1" />
                أضف للتسوق
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}