import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

export default function DeleteAccount() {
  const [formData, setFormData] = useState({
    email: '',
    reason: ''
  });
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    document.title = 'حذف الحساب | Delete Account - إدارة البيت الذكي';
    
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'طلب حذف الحساب نهائيًا من تطبيق إدارة البيت الذكي. Account deletion request for Smart Home Management app.';
    document.head.appendChild(metaDescription);
    
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);
    
    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaRobots);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subject = encodeURIComponent('طلب حذف حساب - Account Deletion Request');
    const body = encodeURIComponent(
      `البريد الإلكتروني / Email: ${formData.email}\n\nالسبب / Reason:\n${formData.reason || 'لم يتم تحديد سبب'}\n\n---\nهذا طلب حذف حساب من تطبيق إدارة البيت الذكي\nThis is an account deletion request from Smart Home Management app.`
    );
    
    window.location.href = `mailto:osakr100@gmail.com?subject=${subject}&body=${body}`;
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6" dir="rtl">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              تم إرسال الطلب
            </h2>
            <p className="text-gray-600 mb-6">
              تم فتح تطبيق البريد الإلكتروني لإرسال طلب حذف الحساب
            </p>
            <div className="space-y-3">
              <Link to={createPageUrl('Home')}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600">
                  العودة للرئيسية
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setSubmitted(false)}
              >
                إرسال طلب آخر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-4">
            <ArrowRight className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            حذف الحساب
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700">
            Delete Account
          </h2>
        </div>

        {/* Warning Card */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-900">
                  تحذير مهم | Important Warning
                </h3>
                <p className="text-red-800">
                  حذف الحساب إجراء نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
                </p>
                <p className="text-red-700" dir="ltr">
                  Account deletion is permanent and cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Trash2 className="w-6 h-6 text-red-600" />
              ماذا سيتم حذفه؟ | What will be deleted?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Arabic */}
              <div className="space-y-3">
                <h4 className="font-bold text-lg text-gray-900">البيانات التي سيتم حذفها:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>معلومات الحساب الشخصي</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>جميع المهام والملاحظات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>المصروفات والميزانيات</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>المخزون والقوائم</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>جميع الإعدادات والتفضيلات</span>
                  </li>
                </ul>
              </div>

              {/* English */}
              <div className="space-y-3" dir="ltr">
                <h4 className="font-bold text-lg text-gray-900">Data to be deleted:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Personal account information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>All tasks and notes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Expenses and budgets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Inventory and lists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>All settings and preferences</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">
                  ⏱️ مدة التنفيذ | Processing Time: <span className="text-blue-600">7 أيام عمل | 7 business days</span>
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="text-gray-800 font-medium">
                  🔒 لا يمكن استرجاع الحساب بعد الحذف | Account cannot be recovered after deletion
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deletion Request Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              طلب حذف الحساب | Account Deletion Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني | Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  dir="ltr"
                  className="text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السبب (اختياري) | Reason (Optional)
                </label>
                <Textarea
                  placeholder="يمكنك إخبارنا لماذا تريد حذف حسابك (اختياري)&#10;You can tell us why you want to delete your account (optional)"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="min-h-[120px]"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>ملاحظة:</strong> عند الضغط على "إرسال الطلب"، سيتم فتح تطبيق البريد الإلكتروني لإرسال طلبك مباشرة إلى فريق الدعم.
                </p>
                <p className="text-sm text-gray-600 mt-2" dir="ltr">
                  <strong>Note:</strong> When you click "Submit Request", your email app will open to send your request directly to the support team.
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white"
                >
                  إرسال الطلب | Submit Request
                </Button>
                <Link to={createPageUrl('Home')} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    إلغاء | Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Support Info */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 mb-2">
              <strong>هل تحتاج مساعدة؟ | Need Help?</strong>
            </p>
            <p className="text-gray-600">
              يمكنك التواصل معنا عبر | Contact us at:{' '}
              <a href="mailto:osakr100@gmail.com" className="text-emerald-600 font-medium hover:underline">
                osakr100@gmail.com
              </a>
            </p>
            <Link to={createPageUrl('Support')} className="inline-block mt-3">
              <Button variant="outline" size="sm">
                صفحة الدعم | Support Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}