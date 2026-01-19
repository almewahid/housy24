import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard, Camera, ScanBarcode, FileText, Loader2, Check, X, Upload } from "lucide-react";

export default function ProductInputMethods({ open, onClose, onProductAdded }) {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const [manualData, setManualData] = useState({
    name: '',
    quantity: 1,
    unit: 'عدد',
    category: 'أخرى'
  });

  const [barcodeInput, setBarcodeInput] = useState('');

  const handleManualSubmit = () => {
    if (!manualData.name.trim()) return;
    onProductAdded(manualData);
    setManualData({ name: '', quantity: 1, unit: 'عدد', category: 'أخرى' });
    onClose();
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `ابحث عن معلومات المنتج بالباركود: ${barcodeInput}
        
أعطني معلومات المنتج إن وجدت:
- اسم المنتج
- الفئة (ألبان، لحوم، خضروات، فواكه، حبوب، معلبات، مشروبات، بهارات، مجمدات، أخرى)
- الوحدة
- معلومات إضافية`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            found: { type: "boolean" },
            name: { type: "string" },
            category: { type: "string" },
            unit: { type: "string" },
            brand: { type: "string" },
            description: { type: "string" }
          }
        }
      });
      
      if (response.found && response.name) {
        setResult(response);
      } else {
        setError('لم يتم العثور على المنتج. يمكنك إضافته يدوياً.');
      }
    } catch (err) {
      setError('حدث خطأ في البحث');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const prompt = type === 'product' 
        ? `حلل هذه الصورة وحدد المنتج الغذائي الموجود فيها. أعطني:
- اسم المنتج
- الفئة (ألبان، لحوم، خضروات، فواكه، حبوب، معلبات، مشروبات، بهارات، مجمدات، أخرى)
- الوحدة المناسبة
- أي معلومات إضافية مرئية`
        : `حلل هذه الفاتورة واستخرج قائمة المنتجات منها. لكل منتج حدد:
- اسم المنتج
- الكمية
- السعر إن وجد
- الفئة`;

      const schema = type === 'product' 
        ? {
            type: "object",
            properties: {
              found: { type: "boolean" },
              name: { type: "string" },
              category: { type: "string" },
              unit: { type: "string" },
              brand: { type: "string" }
            }
          }
        : {
            type: "object",
            properties: {
              store_name: { type: "string" },
              date: { type: "string" },
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    quantity: { type: "number" },
                    price: { type: "number" },
                    category: { type: "string" }
                  }
                }
              },
              total: { type: "number" }
            }
          };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: schema
      });
      
      setResult({ ...response, type });
    } catch (err) {
      setError('حدث خطأ في تحليل الصورة');
    }
    setLoading(false);
  };

  const handleAddFromResult = () => {
    if (result?.type === 'receipt' && result?.products) {
      result.products.forEach(p => {
        onProductAdded({
          name: p.name,
          quantity: p.quantity || 1,
          category: p.category || 'أخرى',
          last_purchase_price: p.price
        });
      });
    } else if (result?.name) {
      onProductAdded({
        name: result.name,
        category: result.category || 'أخرى',
        quantity: 1
      });
    }
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة منتج جديد</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="manual" className="gap-1 text-xs">
              <Keyboard className="w-4 h-4" />
              يدوي
            </TabsTrigger>
            <TabsTrigger value="barcode" className="gap-1 text-xs">
              <ScanBarcode className="w-4 h-4" />
              باركود
            </TabsTrigger>
            <TabsTrigger value="camera" className="gap-1 text-xs">
              <Camera className="w-4 h-4" />
              تصوير
            </TabsTrigger>
            <TabsTrigger value="receipt" className="gap-1 text-xs">
              <FileText className="w-4 h-4" />
              فاتورة
            </TabsTrigger>
          </TabsList>

          {/* Manual Input */}
          <TabsContent value="manual" className="space-y-4 mt-4">
            <div>
              <Label>اسم المنتج</Label>
              <Input
                value={manualData.name}
                onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                placeholder="مثال: أرز بسمتي"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الكمية</Label>
                <Input
                  type="number"
                  value={manualData.quantity}
                  onChange={(e) => setManualData({ ...manualData, quantity: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>الوحدة</Label>
                <Input
                  value={manualData.unit}
                  onChange={(e) => setManualData({ ...manualData, unit: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleManualSubmit} className="w-full" disabled={!manualData.name.trim()}>
              إضافة المنتج
            </Button>
          </TabsContent>

          {/* Barcode */}
          <TabsContent value="barcode" className="space-y-4 mt-4">
            <div>
              <Label>رقم الباركود</Label>
              <div className="flex gap-2">
                <Input
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="أدخل رقم الباركود"
                  dir="ltr"
                />
                <Button onClick={handleBarcodeSearch} disabled={loading || !barcodeInput.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'بحث'}
                </Button>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            {result && !result.type && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">تم العثور على المنتج</span>
                  </div>
                  <p className="font-bold text-lg">{result.name}</p>
                  {result.brand && <p className="text-sm text-slate-600">الماركة: {result.brand}</p>}
                  {result.category && <p className="text-sm text-slate-600">الفئة: {result.category}</p>}
                  <Button onClick={handleAddFromResult} className="w-full mt-3">
                    إضافة للمخزون
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Camera */}
          <TabsContent value="camera" className="space-y-4 mt-4">
            <div className="text-center p-8 border-2 border-dashed rounded-xl">
              <Camera className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-4">التقط صورة للمنتج لتحديده تلقائياً</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => handleImageUpload(e, 'product')}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Camera className="w-4 h-4 ml-2" />}
                التقاط صورة
              </Button>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            {result?.type === 'product' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="font-bold text-lg">{result.name}</p>
                  {result.category && <p className="text-sm text-slate-600">الفئة: {result.category}</p>}
                  <Button onClick={handleAddFromResult} className="w-full mt-3">
                    إضافة للمخزون
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Receipt */}
          <TabsContent value="receipt" className="space-y-4 mt-4">
            <div className="text-center p-8 border-2 border-dashed rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-4">صور الفاتورة لاستخراج المنتجات تلقائياً</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                id="receipt-input"
                onChange={(e) => handleImageUpload(e, 'receipt')}
              />
              <Button onClick={() => document.getElementById('receipt-input')?.click()} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                رفع صورة الفاتورة
              </Button>
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            {result?.type === 'receipt' && result?.products?.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">المنتجات المستخرجة ({result.products.length})</span>
                    {result.store_name && <span className="text-sm text-slate-600">{result.store_name}</span>}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {result.products.map((p, i) => (
                      <div key={i} className="flex justify-between bg-white p-2 rounded">
                        <span>{p.name}</span>
                        <span className="text-slate-600">
                          {p.quantity && `${p.quantity}x`} {p.price && `${p.price} ج.م`}
                        </span>
                      </div>
                    ))}
                  </div>
                  {result.total && (
                    <div className="mt-3 pt-3 border-t font-bold">
                      الإجمالي: {result.total} ج.م
                    </div>
                  )}
                  <Button onClick={handleAddFromResult} className="w-full mt-3">
                    إضافة الكل للمخزون
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}