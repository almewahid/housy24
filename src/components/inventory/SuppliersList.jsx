import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Globe, MapPin, Star, X, Store } from "lucide-react";

const priceLevelColors = {
  "اقتصادي": "bg-green-100 text-green-700",
  "متوسط": "bg-yellow-100 text-yellow-700",
  "مرتفع": "bg-red-100 text-red-700"
};

export default function SuppliersList({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white" onClick={e => e.stopPropagation()}>
        <CardHeader className="sticky top-0 bg-white z-10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">أفضل الأماكن للشراء</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {(!item.suppliers || item.suppliers.length === 0) ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">لا توجد متاجر مضافة حتى الآن</p>
              <p className="text-sm text-slate-400 mt-2">يمكنك إضافة متاجر من صفحة التعديل</p>
            </div>
          ) : (
            <div className="space-y-4">
              {item.suppliers.map((supplier, index) => (
                <Card key={index} className="border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{supplier.name}</h3>
                        {supplier.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < supplier.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                              />
                            ))}
                            <span className="text-sm text-slate-500 mr-2">({supplier.rating})</span>
                          </div>
                        )}
                      </div>
                      {supplier.price_level && (
                        <Badge className={priceLevelColors[supplier.price_level]}>
                          {supplier.price_level}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {supplier.phone && (
                        <a 
                          href={`tel:${supplier.phone}`}
                          className="flex items-center gap-3 text-slate-600 hover:text-emerald-600 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span dir="ltr">{supplier.phone}</span>
                        </a>
                      )}
                      {supplier.website && (
                        <a 
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="truncate">{supplier.website}</span>
                        </a>
                      )}
                      {supplier.address && (
                        <div className="flex items-center gap-3 text-slate-600">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{supplier.address}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}