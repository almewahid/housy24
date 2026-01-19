import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalWrapper({ open, onClose, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`${maxWidth} w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden`}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
            <div></div>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="max-h-[calc(90vh-60px)]">
            <div className="p-4">
              {children}
            </div>
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}