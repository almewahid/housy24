import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const categoryColors = {
  "أثاث": "bg-amber-100 text-amber-800",
  "إلكترونيات": "bg-blue-100 text-blue-800",
  "أجهزة منزلية": "bg-green-100 text-green-800",
  "ديكور": "bg-purple-100 text-purple-800",
  "مطبخ": "bg-orange-100 text-orange-800",
  "حمام": "bg-cyan-100 text-cyan-800",
  "غرفة نوم": "bg-pink-100 text-pink-800",
  "حديقة": "bg-emerald-100 text-emerald-800",
  "أخرى": "bg-gray-100 text-gray-800"
};

export default function InventoryCard({ item, onClick }) {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm"
      onClick={() => onClick(item)}
    >
      <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-slate-300" />
          </div>
        )}
        <Badge className={`absolute top-3 right-3 ${categoryColors[item.category] || categoryColors["أخرى"]}`}>
          {item.category}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-1">{item.name}</h3>
        {item.room && (
          <p className="text-sm text-slate-500 mb-2">{item.room}</p>
        )}
        <div className="flex items-center justify-between text-sm">
          {item.current_value && (
            <div className="flex items-center gap-1 text-emerald-600">
              <DollarSign className="w-4 h-4" />
              <span>{item.current_value.toLocaleString()} ج.م</span>
            </div>
          )}
          {item.purchase_date && (
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(item.purchase_date), 'MMM yyyy', { locale: ar })}</span>
            </div>
          )}
        </div>
        {item.suppliers && item.suppliers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">{item.suppliers.length} متاجر موصى بها</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}