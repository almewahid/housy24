import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Cookie } from 'lucide-react';

export default function CookiesPolicy() {
  useEffect(() => {
    document.title = 'Cookies Policy / سياسة ملفات تعريف الارتباط - Smart Home Management';
    
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Learn about how we use cookies, localStorage, and authentication sessions';
    document.head.appendChild(metaDescription);

    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'index, follow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaDescription);
      document.head.removeChild(metaRobots);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home */}
        <Link 
          to={createPageUrl('Home')} 
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية | Back to Home
        </Link>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 md:p-12">
            {/* Icon Header */}
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full">
                <Cookie className="w-12 h-12 text-amber-600" />
              </div>
            </div>

            {/* Arabic Section */}
            <div className="mb-12" dir="rtl">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                سياسة ملفات تعريف الارتباط (Cookies)
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg">
                  نستخدم تقنيات مختلفة لتخزين البيانات وتحسين تجربتك في استخدام التطبيق. هذه السياسة توضح كيفية استخدامنا لهذه التقنيات.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. ما هي ملفات تعريف الارتباط (Cookies)</h2>
                <p>
                  ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها في متصفحك عند زيارتك لموقعنا. تساعدنا هذه الملفات في:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تذكر تفضيلاتك وإعداداتك</li>
                  <li>تحسين أداء التطبيق</li>
                  <li>توفير تجربة مخصصة لك</li>
                  <li>تحليل كيفية استخدامك للتطبيق</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. التخزين المحلي (LocalStorage)</h2>
                <p>
                  نستخدم التخزين المحلي في متصفحك لحفظ:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>تفضيلات اللغة:</strong> لتذكر اللغة التي اخترتها (عربي/إنجليزي)</li>
                  <li><strong>الوضع الليلي/النهاري:</strong> لحفظ تفضيلات العرض</li>
                  <li><strong>البيانات المؤقتة:</strong> لتحسين سرعة التطبيق وتقليل استهلاك البيانات</li>
                  <li><strong>الإعدادات الشخصية:</strong> مثل ترتيب الصفحات وتفضيلات العرض</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. جلسات المصادقة (Authentication Sessions)</h2>
                <p>
                  نستخدم Supabase لإدارة حسابات المستخدمين والمصادقة. يتم تخزين معلومات جلستك بشكل آمن ومشفر:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>Access Token:</strong> للتحقق من هويتك عند الوصول للتطبيق</li>
                  <li><strong>Refresh Token:</strong> لتجديد جلستك تلقائياً دون الحاجة لتسجيل الدخول مجدداً</li>
                  <li><strong>مدة الجلسة:</strong> تبقى جلستك نشطة حتى تسجل الخروج أو تنتهي صلاحية التوكن</li>
                  <li><strong>الأمان:</strong> جميع معلومات المصادقة مشفرة ومحمية</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. أنواع ملفات الارتباط المستخدمة</h2>
                
                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">ملفات ضرورية (Essential Cookies)</h3>
                <p>
                  ضرورية لتشغيل التطبيق بشكل صحيح ولا يمكن تعطيلها:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>ملفات المصادقة وتسجيل الدخول</li>
                  <li>ملفات الأمان والحماية</li>
                  <li>ملفات إدارة الجلسات</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">ملفات الأداء (Performance Cookies)</h3>
                <p>
                  تساعدنا في فهم كيفية استخدامك للتطبيق وتحسين الأداء:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>تتبع الصفحات الأكثر زيارة</li>
                  <li>قياس سرعة تحميل الصفحات</li>
                  <li>اكتشاف الأخطاء وحلها</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">ملفات التفضيلات (Preference Cookies)</h3>
                <p>
                  تخزن تفضيلاتك وإعداداتك الشخصية:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>اللغة المفضلة</li>
                  <li>الثيم (فاتح/داكن)</li>
                  <li>خيارات العرض والترتيب</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">5. التحكم في ملفات الارتباط</h2>
                <p>
                  يمكنك التحكم في ملفات الارتباط بعدة طرق:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>إعدادات المتصفح:</strong> معظم المتصفحات تسمح لك بحذف أو حظر الملفات</li>
                  <li><strong>التصفح الخاص:</strong> يمنع حفظ معظم الملفات</li>
                  <li><strong>إعدادات التطبيق:</strong> يمكنك مسح البيانات المحلية من إعدادات التطبيق</li>
                </ul>
                <p className="mt-4 text-amber-700 bg-amber-50 p-4 rounded-lg">
                  <strong>⚠️ ملاحظة:</strong> حظر ملفات الارتباط الضرورية قد يؤثر على وظائف التطبيق ويمنع تسجيل الدخول.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">6. الجهات الخارجية</h2>
                <p>
                  نستخدم خدمات طرف ثالث موثوقة:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li><strong>Supabase:</strong> لإدارة قواعد البيانات والمصادقة</li>
                  <li><strong>Base44:</strong> منصة استضافة التطبيق</li>
                </ul>
                <p className="mt-4">
                  هذه الخدمات قد تستخدم ملفات ارتباط خاصة بها لتوفير خدماتها. نوصي بمراجعة سياساتها الخاصة.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">7. التحديثات على السياسة</h2>
                <p>
                  قد نقوم بتحديث هذه السياسة من وقت لآخر. سيتم عرض تاريخ آخر تحديث في أسفل الصفحة. ننصح بمراجعة هذه الصفحة بشكل دوري.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">8. الأسئلة والاستفسارات</h2>
                <p>
                  إذا كان لديك أي أسئلة حول سياسة ملفات الارتباط، يرجى التواصل معنا عبر البريد الإلكتروني.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-12"></div>

            {/* English Section */}
            <div dir="ltr">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Cookies Policy
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg">
                  We use various technologies to store data and improve your experience using our application. This policy explains how we use these technologies.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. What are Cookies</h2>
                <p>
                  Cookies are small text files stored in your browser when you visit our site. These files help us:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Improve application performance</li>
                  <li>Provide a personalized experience</li>
                  <li>Analyze how you use the application</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. LocalStorage</h2>
                <p>
                  We use your browser's local storage to save:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Language preferences:</strong> To remember your chosen language (Arabic/English)</li>
                  <li><strong>Dark/Light mode:</strong> To save display preferences</li>
                  <li><strong>Temporary data:</strong> To improve app speed and reduce data usage</li>
                  <li><strong>Personal settings:</strong> Such as page order and display preferences</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. Authentication Sessions</h2>
                <p>
                  We use Supabase to manage user accounts and authentication. Your session information is stored securely and encrypted:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access Token:</strong> To verify your identity when accessing the app</li>
                  <li><strong>Refresh Token:</strong> To automatically renew your session without re-login</li>
                  <li><strong>Session duration:</strong> Your session remains active until you log out or token expires</li>
                  <li><strong>Security:</strong> All authentication information is encrypted and protected</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. Types of Cookies Used</h2>
                
                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">Essential Cookies</h3>
                <p>
                  Necessary for the app to function properly and cannot be disabled:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Authentication and login cookies</li>
                  <li>Security and protection cookies</li>
                  <li>Session management cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">Performance Cookies</h3>
                <p>
                  Help us understand how you use the app and improve performance:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Track most visited pages</li>
                  <li>Measure page load speed</li>
                  <li>Detect and resolve errors</li>
                </ul>

                <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">Preference Cookies</h3>
                <p>
                  Store your personal preferences and settings:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Preferred language</li>
                  <li>Theme (light/dark)</li>
                  <li>Display and ordering options</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">5. Cookie Control</h2>
                <p>
                  You can control cookies in several ways:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Browser settings:</strong> Most browsers allow you to delete or block cookies</li>
                  <li><strong>Private browsing:</strong> Prevents saving most cookies</li>
                  <li><strong>App settings:</strong> You can clear local data from app settings</li>
                </ul>
                <p className="mt-4 text-amber-700 bg-amber-50 p-4 rounded-lg">
                  <strong>⚠️ Note:</strong> Blocking essential cookies may affect app functionality and prevent login.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">6. Third Parties</h2>
                <p>
                  We use trusted third-party services:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Supabase:</strong> For database management and authentication</li>
                  <li><strong>Base44:</strong> Application hosting platform</li>
                </ul>
                <p className="mt-4">
                  These services may use their own cookies to provide their services. We recommend reviewing their policies.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">7. Policy Updates</h2>
                <p>
                  We may update this policy from time to time. The last update date will be shown at the bottom of the page. We advise reviewing this page periodically.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">8. Questions and Inquiries</h2>
                <p>
                  If you have any questions about our cookies policy, please contact us via email.
                </p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-12 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
              <p>آخر تحديث: يناير 2026 | Last Updated: January 2026</p>
            </div>

            {/* Back to Home Button */}
            <div className="mt-8 text-center">
              <Link 
                to={createPageUrl('Home')} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowRight className="w-5 h-5" />
                العودة للرئيسية | Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}