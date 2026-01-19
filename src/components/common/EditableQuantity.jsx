import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function EditableQuantity({ value, unit, onChange, min = 0 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleIncrement = () => {
    onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleSave = () => {
    const newValue = Math.max(min, Number(tempValue) || 0);
    onChange(newValue);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="flex items-center gap-1"
      >
        <Input
          type="number"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleSave}
          className="w-20 h-8 text-center"
          autoFocus
        />
        <span className="text-sm text-slate-500">{unit}</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSave}>
          <Check className="w-4 h-4 text-green-600" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex items-center gap-1"
      whileHover={{ scale: 1.02 }}
    >
      <Button 
        size="icon" 
        variant="outline" 
        className="h-7 w-7"
        onClick={handleDecrement}
      >
        <Minus className="w-3 h-3" />
      </Button>
      <motion.span 
        className="font-bold text-base min-w-[50px] text-center cursor-pointer hover:bg-slate-100 px-2 py-1 rounded"
        onClick={() => { setTempValue(value); setIsEditing(true); }}
        whileTap={{ scale: 0.95 }}
      >
        {value} {unit}
      </motion.span>
      <Button 
        size="icon" 
        variant="outline" 
        className="h-7 w-7"
        onClick={handleIncrement}
      >
        <Plus className="w-3 h-3" />
      </Button>
    </motion.div>
  );
}