import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Table, Loader2 } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import jsPDF from 'jspdf';

const columns = [
  { id: 'expense_date', label: 'التاريخ', enabled: true },
  { id: 'title', label: 'الوصف', enabled: true },
  { id: 'category', label: 'الفئة', enabled: true },
  { id: 'amount', label: 'المبلغ', enabled: true },
  { id: 'payment_method', label: 'طريقة الدفع', enabled: false },
  { id: 'store_name', label: 'المتجر', enabled: false },
  { id: 'notes', label: 'ملاحظات', enabled: false }
];

export default function AdvancedExportReport({ expenses, open, onClose }) {
  const [selectedColumns, setSelectedColumns] = useState(columns.filter(c => c.enabled).map(c => c.id));
  const [exporting, setExporting] = useState(false);

  const toggleColumn = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter(id => id !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const exportToCSV = () => {
    setExporting(true);
    
    const headers = columns
      .filter(col => selectedColumns.includes(col.id))
      .map(col => col.label)
      .join(',');
    
    const rows = expenses.map(expense => 
      selectedColumns.map(colId => {
        if (colId === 'expense_date') {
          return format(new Date(expense.expense_date || expense.created_date), 'yyyy-MM-dd');
        }
        return expense[colId] || '';
      }).join(',')
    ).join('\n');

    const csvContent = '\uFEFF' + headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setExporting(false), 1000);
  };

  const exportToPDF = () => {
    setExporting(true);
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    doc.setFontSize(18);
    doc.text('تقرير المصروفات', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`التاريخ: ${format(new Date(), 'd MMMM yyyy', { locale: ar })}`, 105, 30, { align: 'center' });
    
    // Add table
    let yPos = 45;
    const colWidth = 180 / selectedColumns.length;
    
    // Headers
    doc.setFillColor(147, 51, 234);
    doc.rect(15, yPos, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    columns.filter(col => selectedColumns.includes(col.id)).forEach((col, i) => {
      doc.text(col.label, 20 + (i * colWidth), yPos + 5);
    });
    
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    
    // Rows
    expenses.slice(0, 30).forEach((expense, rowIndex) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      selectedColumns.forEach((colId, i) => {
        let text = '';
        if (colId === 'expense_date') {
          text = format(new Date(expense.expense_date || expense.created_date), 'yyyy-MM-dd');
        } else if (colId === 'amount') {
          text = `${expense[colId]} ج.م`;
        } else {
          text = expense[colId] || '-';
        }
        
        doc.text(String(text).substring(0, 20), 20 + (i * colWidth), yPos + 5);
      });
      
      yPos += 8;
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPos - 7, 180, 7, 'F');
      }
    });
    
    // Add summary
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    doc.setFontSize(14);
    doc.text(`الإجمالي: ${total.toFixed(2)} ج.م`, 105, yPos + 15, { align: 'center' });
    
    doc.save(`expenses_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    setTimeout(() => setExporting(false), 1000);
  };

  // Top 5 expenses
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl dark:bg-slate-800 dark:text-white" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            تصدير وتخصيص التقرير
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Column Selection */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Table className="w-4 h-4" />
              اختر الأعمدة
            </h3>
            <div className="space-y-2 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              {columns.map(column => (
                <div key={column.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedColumns.includes(column.id)}
                    onCheckedChange={() => toggleColumn(column.id)}
                  />
                  <Label className="cursor-pointer">{column.label}</Label>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
              <strong>{selectedColumns.length}</strong> عمود محدد
            </div>
          </div>

          {/* Top 5 Expenses */}
          <div>
            <h3 className="font-semibold mb-3">أعلى 5 مصروفات</h3>
            <div className="space-y-2">
              {topExpenses.map((expense, index) => (
                <div 
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{expense.title}</p>
                      <Badge variant="outline" className="text-xs dark:border-slate-500">{expense.category}</Badge>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-purple-700 dark:text-purple-400">
                    {expense.amount} ج.م
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-400">
                <strong>إجمالي أعلى 5:</strong> {topExpenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)} ج.م
              </p>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={exportToCSV}
            disabled={exporting || selectedColumns.length === 0}
            className="gap-2 dark:border-slate-600 dark:hover:bg-slate-700"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
            تصدير CSV
          </Button>
          <Button 
            onClick={exportToPDF}
            disabled={exporting || selectedColumns.length === 0}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            تصدير PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}