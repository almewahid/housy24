import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Phone, MessageCircle, MapPin, Globe, Store, Search, Plus, Heart } from "lucide-react";

export default function SupplierSelector({ selectedId, onSelect, category }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || s.category === category || s.category === 'سوبر ماركت';
    return matchesSearch && matchesCategory;
  });

  const selectedSupplier = suppliers.find(s => s.id === selectedId);

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => setOpen(true)}
        className="w-full justify-start gap-2"
      >
        <Store className="w-4 h-4" />
        {selectedSupplier ? selectedSupplier.name : 'اختر مورد مفضل'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>اختر المورد المفضل</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="ابحث عن مورد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredSuppliers.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>لا يوجد موردين</p>
              </div>
            ) : (
              filteredSuppliers.map(supplier => (
                <Card 
                  key={supplier.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedId === supplier.id ? 'ring-2 ring-teal-500 bg-teal-50' : ''
                  }`}
                  onClick={() => { onSelect(supplier.id); setOpen(false); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{supplier.name}</h4>
                          {supplier.is_favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                        </div>
                        <Badge variant="secondary" className="mb-2">{supplier.category}</Badge>
                        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                          {supplier.phone && (
                            <a href={`tel:${supplier.phone}`} className="flex items-center gap-1 hover:text-teal-600" onClick={e => e.stopPropagation()}>
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{supplier.phone}</span>
                            </a>
                          )}
                          {supplier.whatsapp && (
                            <a href={`https://wa.me/${supplier.whatsapp}`} target="_blank" className="flex items-center gap-1 hover:text-green-600" onClick={e => e.stopPropagation()}>
                              <MessageCircle className="w-3 h-3" />
                              واتساب
                            </a>
                          )}
                        </div>
                      </div>
                      {supplier.rating && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{supplier.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}