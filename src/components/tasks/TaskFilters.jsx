import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function TaskFilters({ filters, onFilterChange }) {
  return (
    <Card className="p-4 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">تصفية المهام</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="بحث في المهام..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="pr-10"
          />
        </div>

        <Select value={filters.status} onValueChange={(value) => onFilterChange({ ...filters, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="completed">مكتملة</SelectItem>
            <SelectItem value="cancelled">ملغاة</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => onFilterChange({ ...filters, priority: value })}>
          <SelectTrigger>
            <SelectValue placeholder="الأولوية" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأولويات</SelectItem>
            <SelectItem value="urgent">عاجلة</SelectItem>
            <SelectItem value="high">عالية</SelectItem>
            <SelectItem value="medium">متوسطة</SelectItem>
            <SelectItem value="low">منخفضة</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.category} onValueChange={(value) => onFilterChange({ ...filters, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="cleaning">تنظيف</SelectItem>
            <SelectItem value="cooking">طبخ</SelectItem>
            <SelectItem value="shopping">تسوق</SelectItem>
            <SelectItem value="laundry">غسيل</SelectItem>
            <SelectItem value="childcare">رعاية الأطفال</SelectItem>
            <SelectItem value="maintenance">صيانة</SelectItem>
            <SelectItem value="organization">تنظيم</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}