import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, X, Image as ImageIcon, Loader2, Link2, Save } from 'lucide-react';
import { format } from 'date-fns';

const categories = ["طعام", "خضروات", "لحوم", "ألبان", "منظفات", "مدرسة", "دروس خصوصية", "تدريب", "صحة", "مواصلات", "فواتير", "ترفيه", "ملابس", "صيانة", "أخرى"];

export default function ExpenseFormWithReceipt({ editingExpense, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'طعام',
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    payment_method: 'نقدي',
    store_name: '',
    notes: '',
    receipt_image_url: '',
    linked_task_id: '',
    is_recurring: false
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title,
        amount: editingExpense.amount,
        category: editingExpense.category,
        expense_date: editingExpense.expense_date || format(new Date(), 'yyyy-MM-dd'),
        payment_method: editingExpense.payment_method || 'نقدي',
        store_name: editingExpense.store_name || '',
        notes: editingExpense.notes || '',
        receipt_image_url: editingExpense.receipt_image_url || '',
        linked_task_id: editingExpense.linked_task_id || '',
        is_recurring: editingExpense.is_recurring || false
      });
    }
    loadTasks();
  }, [editingExpense]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptFile(file);
    setUploading(true);

    try {
      // 1. إنشاء اسم فريد للملف
      const fileName = `${Date.now()}_${file.name}`;
      
      // 2. رفع الملف إلى Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file);
      
      if (error) throw error;
      
      // 3. الحصول على رابط الصورة
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      
      setFormData({ ...formData, receipt_image_url: publicUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('فشل رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // تنظيف البيانات قبل الحفظ
    const data = {
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category || null,
      expense_date: formData.expense_date || null,
      payment_method: formData.payment_method || null,
      store_name: formData.store_name || null,
      notes: formData.notes || null,
      receipt_image_url: formData.receipt_image_url || null,
      linked_task_id: formData.linked_task_id || null,
      is_recurring: formData.is_recurring || false,
      created_by: 'user' // إضافة created_by
    };
    
    onSave(data, editingExpense?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-4">
      <div>
        <Label>الوصف *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="مثال: مشتريات كارفور"
          required
        />
      </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>المبلغ *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0"
              required
            />
          </div>
          <div>
            <Label>التصنيف</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
            />
          </div>
          <div>
            <Label>طريقة الدفع</Label>
            <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="نقدي">نقدي</SelectItem>
                <SelectItem value="بطاقة">بطاقة</SelectItem>
                <SelectItem value="تحويل">تحويل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>اسم المتجر</Label>
          <Input
            value={formData.store_name}
            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
            placeholder="اختياري"
          />
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            ربط بمهمة (اختياري)
          </Label>
          <Select value={formData.linked_task_id || "none"} onValueChange={(v) => setFormData({ ...formData, linked_task_id: v === "none" ? null : v })}>
            <SelectTrigger><SelectValue placeholder="اختر مهمة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">بدون ربط</SelectItem>
              {tasks.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>صورة الإيصال</Label>
          <div className="mt-2">
            {formData.receipt_image_url ? (
              <div className="relative">
                <img 
                  src={formData.receipt_image_url} 
                  alt="Receipt" 
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 left-2"
                  onClick={() => setFormData({ ...formData, receipt_image_url: '' })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">انقر لرفع صورة الإيصال</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <Label>ملاحظات</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="أي ملاحظات إضافية..."
            className="h-20"
          />
        </div>

        <div className="flex gap-3 justify-end pt-4 sticky bottom-0 bg-white pb-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
          <Button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!formData.title || !formData.amount}
          >
            <Save className="w-4 h-4 ml-2" />
            حفظ
          </Button>
        </div>
      </form>
  );
}