import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { 
  TrendingUp, TrendingDown, Minus, Plus, Store, Calendar, 
  DollarSign, Tag, History, Star, X, Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const currencies = ["ج.م", "ر.س", "د.إ", "د.ك", "ر.ق"];

export default function PriceTracker({ productName, foodItemId, open, onClose }) {
  const queryClient = useQueryClient();
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [newPrice, setNewPrice] = useState({
    store_name: '',
    price: '',
    currency: 'ج.م',
    quantity: 1,
    unit: '',
    is_offer: false,
    offer_end_date: '',
    notes: ''
  });

  const { data: priceRecords = [], isLoading } = useQuery({
    queryKey: ['priceRecords', productName],
    queryFn: () => base44.entities.PriceRecord.filter(
      { product_name: productName },
      '-record_date'
    ),
    enabled: !!productName
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PriceRecord.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceRecords', productName] });
      setShowAddPrice(false);
      setNewPrice({
        store_name: '',
        price: '',
        currency: 'ج.م',
        quantity: 1,
        unit: '',
        is_offer: false,
        offer_end_date: '',
        notes: ''
      });
    }
  });

  const handleAddPrice = () => {
    if (!newPrice.store_name || !newPrice.price) return;
    createMutation.mutate({
      product_name: productName,
      food_item_id: foodItemId,
      store_name: newPrice.store_name,
      price: parseFloat(newPrice.price),
      currency: newPrice.currency,
      quantity: newPrice.quantity,
      unit: newPrice.unit,
      is_offer: newPrice.is_offer,
      offer_end_date: newPrice.offer_end_date || null,
      notes: newPrice.notes,
      record_date: new Date().toISOString().split('T')[0]
    });
  };

  // Calculate statistics
  const prices = priceRecords.map(r => r.price);
  const avgPrice = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const latestPrice = priceRecords[0]?.price || 0;
  const previousPrice = priceRecords[1]?.price;
  const priceChange = previousPrice ? ((latestPrice - previousPrice) / previousPrice * 100).toFixed(1) : 0;

  // Prepare chart data
  const chartData = [...priceRecords]
    .reverse()
    .slice(-10)
    .map(r => ({
      date: format(new Date(r.record_date || r.created_date), 'MM/dd'),
      price: r.price,
      store: r.store_name
    }));

  // Group by store for comparison
  const storeGroups = priceRecords.reduce((acc, r) => {
    if (!acc[r.store_name]) {
      acc[r.store_name] = { prices: [], latest: null };
    }
    acc[r.store_name].prices.push(r.price);
    if (!acc[r.store_name].latest || new Date(r.record_date) > new Date(acc[r.store_name].latest.record_date)) {
      acc[r.store_name].latest = r;
    }
    return acc;
  }, {});

  const activeOffers = priceRecords.filter(r => 
    r.is_offer && r.offer_end_date && new Date(r.offer_end_date) >= new Date()
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            تتبع أسعار: {productName}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Price Statistics */}
            <div className="grid grid-cols-4 gap-3">
              <Card className="bg-blue-50 border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-blue-600">آخر سعر</p>
                  <p className="text-xl font-bold text-blue-800">{latestPrice}</p>
                  {priceChange !== 0 && (
                    <div className={`flex items-center justify-center text-xs ${priceChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {priceChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(priceChange)}%
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-green-600">أقل سعر</p>
                  <p className="text-xl font-bold text-green-800">{minPrice}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-red-600">أعلى سعر</p>
                  <p className="text-xl font-bold text-red-800">{maxPrice}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-50 border-0">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-slate-600">المتوسط</p>
                  <p className="text-xl font-bold text-slate-800">{avgPrice}</p>
                </CardContent>
              </Card>
            </div>

            {/* Active Offers */}
            {activeOffers.length > 0 && (
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                    <Tag className="w-4 h-4" />
                    عروض حالية
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {activeOffers.map((offer, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/80 p-2 rounded-lg">
                        <div>
                          <span className="font-medium">{offer.store_name}</span>
                          <p className="text-xs text-slate-500">ينتهي: {offer.offer_end_date}</p>
                        </div>
                        <Badge className="bg-red-500">{offer.price} {offer.currency}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Chart */}
            {chartData.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">تغير السعر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          formatter={(value) => [`${value} ج.م`, 'السعر']}
                          labelFormatter={(label) => `التاريخ: ${label}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Store Comparison */}
            {Object.keys(storeGroups).length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">مقارنة المتاجر</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(storeGroups)
                      .sort((a, b) => a[1].latest.price - b[1].latest.price)
                      .map(([store, data], i) => {
                        const avg = (data.prices.reduce((a, b) => a + b, 0) / data.prices.length).toFixed(2);
                        const isCheapest = i === 0;
                        return (
                          <div 
                            key={store} 
                            className={`flex items-center justify-between p-3 rounded-lg ${isCheapest ? 'bg-green-50 border border-green-200' : 'bg-slate-50'}`}
                          >
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">{store}</span>
                              {isCheapest && <Badge className="bg-green-500 text-xs">الأرخص</Badge>}
                            </div>
                            <div className="text-left">
                              <p className="font-bold">{data.latest.price} {data.latest.currency}</p>
                              <p className="text-xs text-slate-500">متوسط: {avg}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Add Price Button */}
            <Button onClick={() => setShowAddPrice(true)} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              إضافة سعر جديد
            </Button>

            {/* Add Price Form */}
            {showAddPrice && (
              <Card className="border-2 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    إضافة سعر
                    <Button variant="ghost" size="icon" onClick={() => setShowAddPrice(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>المتجر *</Label>
                    <Select value={newPrice.store_name} onValueChange={(v) => setNewPrice({ ...newPrice, store_name: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر أو اكتب اسم المتجر" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(s => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                        <SelectItem value="كارفور">كارفور</SelectItem>
                        <SelectItem value="كازيون">كازيون</SelectItem>
                        <SelectItem value="بيم">بيم</SelectItem>
                        <SelectItem value="نون">نون</SelectItem>
                        <SelectItem value="أمازون">أمازون</SelectItem>
                        <SelectItem value="أخرى">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label>السعر *</Label>
                      <Input
                        type="number"
                        value={newPrice.price}
                        onChange={(e) => setNewPrice({ ...newPrice, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>العملة</Label>
                      <Select value={newPrice.currency} onValueChange={(v) => setNewPrice({ ...newPrice, currency: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newPrice.is_offer}
                        onCheckedChange={(c) => setNewPrice({ ...newPrice, is_offer: c })}
                      />
                      <Label>هذا عرض خاص</Label>
                    </div>
                    {newPrice.is_offer && (
                      <Input
                        type="date"
                        value={newPrice.offer_end_date}
                        onChange={(e) => setNewPrice({ ...newPrice, offer_end_date: e.target.value })}
                        className="w-40"
                        placeholder="تاريخ انتهاء العرض"
                      />
                    )}
                  </div>

                  <div>
                    <Label>ملاحظات</Label>
                    <Input
                      value={newPrice.notes}
                      onChange={(e) => setNewPrice({ ...newPrice, notes: e.target.value })}
                      placeholder="مثال: حجم كبير، عبوة 5 كيلو"
                    />
                  </div>

                  <Button 
                    onClick={handleAddPrice} 
                    className="w-full"
                    disabled={!newPrice.store_name || !newPrice.price || createMutation.isPending}
                  >
                    {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ السعر'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Price History */}
            {priceRecords.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">سجل الأسعار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {priceRecords.map((record, i) => (
                      <div key={record.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{record.store_name}</span>
                          {record.is_offer && <Badge className="mr-2 text-xs bg-red-100 text-red-700">عرض</Badge>}
                          <p className="text-xs text-slate-500">
                            {format(new Date(record.record_date || record.created_date), 'dd/MM/yyyy', { locale: ar })}
                          </p>
                        </div>
                        <span className="font-bold">{record.price} {record.currency}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            )}

            {!isLoading && priceRecords.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد أسعار مسجلة بعد</p>
                <p className="text-sm">أضف أول سعر لهذا المنتج</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}