# دليل النقل الكامل إلى Supabase

## الخطوة 1: إنشاء الجداول في Supabase

1. افتح [Supabase Dashboard](https://app.supabase.com)
2. اذهب إلى SQL Editor
3. أنشئ Query جديدة والصق الكود التالي:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables (استخدم schema من ملف التوثيق المُرسل سابقاً)
-- يمكن نسخها كاملة من التوثيق JSON الذي أرسلته لك

-- أمثلة على الجداول الأساسية:

CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  expense_date DATE,
  payment_method TEXT DEFAULT 'نقدي',
  store_name TEXT,
  notes TEXT,
  receipt_image_url TEXT,
  linked_task_id UUID,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_type TEXT
);

CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'other',
  assigned_to TEXT,
  due_date DATE NOT NULL,
  progress NUMERIC DEFAULT 0,
  reminder_sent BOOLEAN DEFAULT FALSE
);

-- ... أكمل باقي الجداول من التوثيق

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
-- ... لكل الجداول

-- Create policies
CREATE POLICY "Allow all for authenticated users" ON expenses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON tasks FOR ALL USING (auth.role() = 'authenticated');
-- ... لكل الجداول

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... لكل الجداول
```

## الخطوة 2: تفعيل Authentication في Supabase

1. اذهب إلى Authentication > Settings
2. فعّل Email Authentication
3. اضبط Site URL على رابط تطبيقك
4. اضبط Redirect URLs

## الخطوة 3: إضافة Environment Variables

في ملف `.env` أو في Vercel Settings:

```
VITE_SUPABASE_URL=https://tugrpzywepplllhmsxbk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## الخطوة 4: تحديث باقي المكونات

جميع الملفات تم تحويلها من `base44` إلى wrapper يستخدم Supabase.

الملفات المحولة:
- ✅ Layout.js
- ✅ pages/Home.jsx
- ✅ pages/Dashboard.jsx
- ✅ pages/Tasks.jsx
- ✅ pages/Expenses.jsx
- ✅ pages/Calendar.jsx
- ✅ pages/Notifications.jsx
- ✅ pages/Settings.jsx
- ✅ pages/Analytics.jsx
- ✅ pages/Family.jsx
- ✅ pages/FamilyChat.jsx
- ✅ pages/FoodInventory.jsx
- ✅ pages/Maintenance.jsx
- ✅ pages/Medications.jsx
- ✅ pages/Pets.jsx
- ✅ pages/Plants.jsx
- ✅ pages/Schedule.jsx
- ✅ pages/ShoppingList.jsx
- ✅ pages/Suppliers.jsx
- ✅ pages/Visits.jsx
- ✅ pages/Gamification.jsx

## ملاحظات مهمة

1. **Authentication**: حالياً الـ wrapper يدعم الدوال الأساسية. قد تحتاج لإضافة صفحة Login/Signup إذا كان التطبيق غير public.

2. **File Upload**: دالة `base44.integrations.Core.UploadFile` لن تعمل. يجب استبدالها بـ Supabase Storage.

3. **Real-time**: تم إضافة دعم Subscriptions في الـ wrapper.

4. **الفروقات**:
   - أسماء الجداول بصيغة snake_case (expenses بدلاً من Expense)
   - التواريخ بصيغة ISO strings
   - الـ IDs بصيغة UUID بدلاً من ObjectID

## التحويلات المتبقية

Components التي تحتاج تحويل يدوي:
- جميع المكونات التي تستخدم `base44.integrations.Core.*`
- المكونات التي تستخدم file uploads
- أي مكونات أخرى تستدعي base44 مباشرة

## Test Checklist

بعد النقل اختبر:
- [ ] تسجيل الدخول
- [ ] إنشاء سجلات جديدة
- [ ] تعديل السجلات
- [ ] حذف السجلات
- [ ] Real-time updates
- [ ] الفلترة والبحث