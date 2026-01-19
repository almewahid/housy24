import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, Activity, Pencil, Trash2, AlertCircle } from "lucide-react";
import { differenceInYears, differenceInMonths, differenceInDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';

const petIcons = {
  "قطة": "🐱",
  "فرس": "🐴",
  "طائر": "🐦",
  "سمك": "🐟",
  "أرنب": "🐰",
  "سلحفاة": "🐢",
  "أخرى": "🐾"
};

const healthColors = {
  "ممتاز": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  "جيد": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  "يحتاج متابعة": "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  "مريض": "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
};

export default function PetCard({ pet, onEdit, onDelete, onClick }) {
  const getAge = () => {
    if (!pet.birth_date) return null;
    const years = differenceInYears(new Date(), new Date(pet.birth_date));
    const months = differenceInMonths(new Date(), new Date(pet.birth_date)) % 12;
    if (years > 0) return `${years} سنة${months > 0 ? ` و ${months} شهر` : ''}`;
    return `${months} شهر`;
  };

  const nextEvent = () => {
    const events = [];
    if (pet.next_vet_visit) events.push({ type: 'طبيب', date: pet.next_vet_visit });
    if (pet.next_grooming) events.push({ type: 'تنظيف', date: pet.next_grooming });
    if (pet.vaccinations) {
      pet.vaccinations.forEach(v => {
        if (v.next_due) events.push({ type: 'تطعيم', date: v.next_due });
      });
    }
    
    events.sort((a, b) => new Date(a.date) - new Date(b.date));
    const next = events[0];
    if (!next) return null;
    
    const days = differenceInDays(new Date(next.date), new Date());
    if (days < 0) return null;
    return { ...next, days };
  };

  const upcoming = nextEvent();
  const age = getAge();

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-xl bg-white dark:bg-slate-800 overflow-hidden"
      onClick={() => onClick(pet)}
    >
      <div className="h-2 bg-gradient-to-r from-pink-400 to-purple-500" />
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl">
              {petIcons[pet.type] || "🐾"}
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pet.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{pet.breed || pet.type}</p>
            </div>
          </div>
          <Badge className={healthColors[pet.health_status] || healthColors["جيد"]}>
            {pet.health_status}
          </Badge>
        </div>

        {age && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
            <Calendar className="w-4 h-4" />
            <span>العمر: {age}</span>
          </div>
        )}

        {pet.weight && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
            <Activity className="w-4 h-4" />
            <span>الوزن: {pet.weight} كجم</span>
          </div>
        )}

        {upcoming && (
          <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 text-sm ${
            upcoming.days <= 3 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>{upcoming.type} بعد {upcoming.days} يوم</span>
          </div>
        )}

        {pet.vet_name && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            الطبيب: {pet.vet_name}
          </p>
        )}

        <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(pet);
            }}
            className="flex-1 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <Pencil className="w-3 h-3 ml-1" />
            تعديل
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pet.id);
            }}
            className="flex-1 text-red-500 dark:text-red-400 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            <Trash2 className="w-3 h-3 ml-1" />
            حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}