import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, History } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { ar } from "date-fns/locale";
import { motion } from "framer-motion";
import PriceTracker from './PriceTracker';
import EditableQuantity from '@/components/common/EditableQuantity';

const categoryIcons = {
  "ألبان": "🥛",
  "لحوم": "🥩",
  "خضروات": "🥬",
  "فواكه": "🍎",
  "حبوب": "🌾",
  "معلبات": "🥫",
  "مشروبات": "🥤",
  "بهارات": "🧂",
  "مجمدات": "🧊",
  "أخرى": "📦"
};

const storageColors = {
  "ثلاجة": "bg-blue-100 text-blue-700",
  "فريزر": "bg-cyan-100 text-cyan-700",
  "خزانة": "bg-amber-100 text-amber-700",
  "رف": "bg-gray-100 text-gray-700"
};

const categoryColors = {
  "ألبان": "from-blue-400 to-blue-500",
  "لحوم": "from-red-400 to-red-500",
  "خضروات": "from-green-400 to-green-500",
  "فواكه": "from-orange-400 to-orange-500",
  "حبوب": "from-amber-400 to-amber-500",
  "معلبات": "from-rose-400 to-rose-500",
  "مشروبات": "from-purple-400 to-purple-500",
  "بهارات": "from-yellow-400 to-yellow-500",
  "مجمدات": "from-cyan-400 to-cyan-500",
  "أخرى": "from-slate-400 to-slate-500"
};

export default function FoodItemCard({ item, onQuantityChange, onClick }) {
  const [showPriceTracker, setShowPriceTracker] = useState(false);
  
  const isLowStock = item.min_quantity && item.quantity <= item.min_quantity;
  const isExpiringSoon = item.expiry_date && differenceInDays(new Date(item.expiry_date), new Date()) <= 3;
  const isExpired = item.expiry_date && isPast(new Date(item.expiry_date));

  const gradientColor = categoryColors[item.category] || categoryColors["أخرى"];
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
    <Card 
      className={`group cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-xl overflow-hidden ${
        isExpired ? 'ring-2 ring-red-400' : isLowStock ? 'ring-2 ring-amber-400' : ''
      }`}
      onClick={() => onClick(item)}
    >
      <div className={`h-2 bg-gradient-to-r ${gradientColor}`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-xl`}>
              {categoryIcons[item.category] || "📦"}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{item.name}</h3>
              <p className="text-sm text-slate-500">{item.category}</p>
            </div>
          </div>
          {item.storage_location && (
            <Badge className={storageColors[item.storage_location]}>
              {item.storage_location}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-3" onClick={e => e.stopPropagation()}>
          <EditableQuantity
            value={item.quantity}
            unit={item.unit}
            onChange={(newQty) => onQuantityChange(item, newQty - item.quantity)}
          />
        </div>

        {/* Alerts */}
        <div className="space-y-1">
          {isLowStock && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>الكمية منخفضة (الحد الأدنى: {item.min_quantity})</span>
            </div>
          )}
          {isExpired && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>منتهي الصلاحية!</span>
            </div>
          )}
          {isExpiringSoon && !isExpired && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>ينتهي خلال {differenceInDays(new Date(item.expiry_date), new Date())} أيام</span>
            </div>
          )}
          {item.expiry_date && !isExpired && !isExpiringSoon && (
            <p className="text-xs text-slate-400">
              ينتهي: {format(new Date(item.expiry_date), 'd MMM yyyy', { locale: ar })}
            </p>
          )}
        </div>

        {/* Price & Last Purchase */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          {item.last_purchase_price && (
            <span className="text-sm text-slate-600">
              آخر سعر: <span className="font-semibold">{item.last_purchase_price} ج.م</span>
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-blue-600 hover:bg-blue-50 gap-1"
            onClick={(e) => {
              e.stopPropagation();
              setShowPriceTracker(true);
            }}
          >
            <History className="w-4 h-4" />
            تتبع الأسعار
          </Button>
        </div>
      </CardContent>

      {/* Price Tracker Modal */}
      <PriceTracker
        productName={item.name}
        foodItemId={item.id}
        open={showPriceTracker}
        onClose={() => setShowPriceTracker(false)}
      />
    </Card>
    </motion.div>
  );
}