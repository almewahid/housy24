import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function AdvancedFilters({ 
  filters, 
  onFilterChange, 
  filterConfig,
  onClearFilters 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'الكل' && v !== '').length;

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              تصفية متقدمة
              {activeFiltersCount > 0 && (
                <Badge className="bg-rose-500 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFiltersCount}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">خيارات التصفية</h4>
                <Button variant="ghost" size="sm" onClick={onClearFilters}>
                  مسح الكل
                </Button>
              </div>

              {filterConfig.map((config) => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-sm">{config.label}</Label>
                  
                  {config.type === 'select' && (
                    <Select 
                      value={filters[config.key] || 'الكل'} 
                      onValueChange={v => handleFilterChange(config.key, v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="الكل">الكل</SelectItem>
                        {config.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {config.type === 'date' && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-right">
                          <CalendarIcon className="ml-2 h-4 w-4" />
                          {filters[config.key] ? format(new Date(filters[config.key]), 'PPP', { locale: ar }) : 'اختر تاريخ'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters[config.key] ? new Date(filters[config.key]) : undefined}
                          onSelect={(date) => handleFilterChange(config.key, date?.toISOString().split('T')[0])}
                        />
                      </PopoverContent>
                    </Popover>
                  )}

                  {config.type === 'dateRange' && (
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <CalendarIcon className="ml-1 h-3 w-3" />
                            {filters[`${config.key}_from`] ? format(new Date(filters[`${config.key}_from`]), 'd/M', { locale: ar }) : 'من'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters[`${config.key}_from`] ? new Date(filters[`${config.key}_from`]) : undefined}
                            onSelect={(date) => handleFilterChange(`${config.key}_from`, date?.toISOString().split('T')[0])}
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <CalendarIcon className="ml-1 h-3 w-3" />
                            {filters[`${config.key}_to`] ? format(new Date(filters[`${config.key}_to`]), 'd/M', { locale: ar }) : 'إلى'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={filters[`${config.key}_to`] ? new Date(filters[`${config.key}_to`]) : undefined}
                            onSelect={(date) => handleFilterChange(`${config.key}_to`, date?.toISOString().split('T')[0])}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {config.type === 'numberRange' && (
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        placeholder="من"
                        value={filters[`${config.key}_min`] || ''}
                        onChange={e => handleFilterChange(`${config.key}_min`, e.target.value)}
                        className="flex-1"
                      />
                      <Input 
                        type="number" 
                        placeholder="إلى"
                        value={filters[`${config.key}_max`] || ''}
                        onChange={e => handleFilterChange(`${config.key}_max`, e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'الكل' || value === '') return null;
              const config = filterConfig.find(c => c.key === key || key.startsWith(c.key));
              return (
                <Badge 
                  key={key} 
                  variant="secondary" 
                  className="gap-1 bg-slate-100"
                >
                  {config?.label}: {value}
                  <button onClick={() => handleFilterChange(key, '')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}