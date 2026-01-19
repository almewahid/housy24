import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store, Plus, Phone, MessageCircle, MapPin, Globe, Star, Heart, Edit, Trash2, Search, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StoreReviews from '@/components/food/StoreReviews';

const supplierCategories = ["سوبر ماركت", "خضار وفاكهة", "لحوم", "ألبان", "بقالة", "إلكترونيات", "أثاث", "أدوات منزلية", "أخرى"];

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('suppliers')
        .insert([data])
        .select();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('suppliers')
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setEditingSupplier(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] })
  });

  const toggleFavorite = (supplier) => {
    updateMutation.mutate({ id: supplier.id, data: { ...supplier, is_favorite: !supplier.is_favorite } });
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'الكل' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const favoriteSuppliers = filteredSuppliers.filter(s => s.is_favorite);
  const otherSuppliers = filteredSuppliers.filter(s => !s.is_favorite);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50/30" dir="rtl">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">الموردين والمتاجر</h1>
            <p className="text-slate-500">إدارة الموردين المفضلين ومعلومات الاتصال</p>
          </div>
          <Button onClick={() => { setEditingSupplier(null); setShowForm(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-5 h-5" />
            إضافة مورد
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ابحث عن مورد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10 bg-white/80"
            />
          </div>
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="bg-white/80 flex-wrap">
              <TabsTrigger value="الكل">الكل</TabsTrigger>
              {supplierCategories.slice(0, 4).map(c => (
                <TabsTrigger key={c} value={c}>{c}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Favorites Section */}
        {favoriteSuppliers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              المفضلين
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteSuppliers.map((supplier, index) => (
                <SupplierCard
                  key={supplier.id}
                  supplier={supplier}
                  index={index}
                  onEdit={() => { setEditingSupplier(supplier); setShowForm(true); }}
                  onDelete={() => deleteMutation.mutate(supplier.id)}
                  onToggleFavorite={() => toggleFavorite(supplier)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Suppliers */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {otherSuppliers.map((supplier, index) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                index={index}
                onEdit={() => { setEditingSupplier(supplier); setShowForm(true); }}
                onDelete={() => deleteMutation.mutate(supplier.id)}
                onToggleFavorite={() => toggleFavorite(supplier)}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">لا يوجد موردين</p>
            <Button onClick={() => setShowForm(true)}>إضافة أول مورد</Button>
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}</DialogTitle>
            </DialogHeader>
            <SupplierForm
              supplier={editingSupplier}
              onSave={(data) => {
                if (editingSupplier) {
                  updateMutation.mutate({ id: editingSupplier.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function SupplierCard({ supplier, index, onEdit, onDelete, onToggleFavorite }) {
  const [showReviews, setShowReviews] = React.useState(false);
  
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-white/90 border-0 shadow-md hover:shadow-lg transition-all group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{supplier.name}</h3>
                <Badge variant="secondary">{supplier.category}</Badge>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleFavorite}
              className={supplier.is_favorite ? 'text-red-500' : 'text-slate-400'}
            >
              <Heart className={`w-5 h-5 ${supplier.is_favorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {supplier.rating && (
            <div className="flex items-center gap-1 text-amber-500 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < supplier.rating ? 'fill-current' : ''}`} />
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm">
            {supplier.phone && (
              <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{supplier.phone}</span>
              </a>
            )}
            {supplier.whatsapp && (
              <a href={`https://wa.me/${supplier.whatsapp}`} target="_blank" className="flex items-center gap-2 text-slate-600 hover:text-green-600">
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{supplier.address}</span>
              </div>
            )}
            {supplier.google_maps_url && (
              <a href={supplier.google_maps_url} target="_blank" className="flex items-center gap-2 text-blue-600 hover:underline">
                <MapPin className="w-4 h-4" />
                <span>عرض على الخريطة</span>
              </a>
            )}
            {supplier.website && (
              <a href={supplier.website} target="_blank" className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
                <Globe className="w-4 h-4" />
                <span>الموقع الإلكتروني</span>
              </a>
            )}
          </div>

          {supplier.notes && (
            <p className="text-sm text-slate-500 mt-3 pt-3 border-t">{supplier.notes}</p>
          )}

          <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => setShowReviews(true)}>
              <Star className="w-4 h-4 ml-1" />
              التقييمات
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Edit className="w-4 h-4 ml-1" />
              تعديل
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500" onClick={onDelete}>
              <Trash2 className="w-4 h-4 ml-1" />
              حذف
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
    
    <StoreReviews
      storeName={supplier.name}
      supplierId={supplier.id}
      open={showReviews}
      onClose={() => setShowReviews(false)}
    />
    </>
  );
}

function SupplierForm({ supplier, onSave, onCancel }) {
  const [formData, setFormData] = useState(supplier || {
    name: '',
    category: 'سوبر ماركت',
    phone: '',
    whatsapp: '',
    address: '',
    google_maps_url: '',
    website: '',
    rating: 0,
    notes: '',
    is_favorite: false
  });

  const handleSubmit = () => {
    // تنظيف البيانات قبل الحفظ
    const dataToSave = {
      name: formData.name,
      category: formData.category || null,
      phone: formData.phone || null,
      whatsapp: formData.whatsapp || null,
      address: formData.address || null,
      google_maps_url: formData.google_maps_url || null,
      website: formData.website || null,
      rating: formData.rating || 0,
      notes: formData.notes || null,
      is_favorite: formData.is_favorite || false,
      created_by: 'user' // إضافة created_by
    };
    
    onSave(dataToSave);
  };

  return (
    <ScrollArea className="max-h-[65vh] pr-4">
      <div className="space-y-4">
        <div>
          <Label>اسم المورد/المتجر *</Label>
          <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div>
          <Label>التصنيف</Label>
          <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {supplierCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>رقم الهاتف</Label>
            <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} dir="ltr" />
          </div>
          <div>
            <Label>واتساب</Label>
            <Input value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} dir="ltr" placeholder="مع رمز الدولة" />
          </div>
        </div>
        <div>
          <Label>العنوان</Label>
          <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </div>
        <div>
          <Label>رابط خرائط جوجل</Label>
          <Input value={formData.google_maps_url} onChange={e => setFormData({ ...formData, google_maps_url: e.target.value })} dir="ltr" />
        </div>
        <div>
          <Label>الموقع الإلكتروني</Label>
          <Input value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} dir="ltr" />
        </div>
        <div>
          <Label>التقييم (من 5)</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setFormData({ ...formData, rating: n })}>
                <Star className={`w-6 h-6 ${n <= formData.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>ملاحظات</Label>
          <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onCancel}>إلغاء</Button>
          <Button onClick={handleSubmit} disabled={!formData.name} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}