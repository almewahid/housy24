import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function TermsAndConditions() {
  useEffect(() => {
    document.title = 'Terms & Conditions / الشروط والأحكام - Smart Home Management';
    
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Terms and Conditions for using Smart Home Management application';
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
            {/* Arabic Section */}
            <div className="mb-12" dir="rtl">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                الشروط والأحكام
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg font-semibold text-slate-800">
                  مرحباً بك في تطبيق إدارة البيت الذكي. باستخدامك لهذا التطبيق، فإنك توافق على الشروط والأحكام التالية:
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. شروط الاستخدام</h2>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>يجب أن يكون عمرك 18 عاماً أو أكثر لاستخدام هذا التطبيق</li>
                  <li>يجب تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
                  <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك</li>
                  <li>يُمنع استخدام التطبيق لأي أغراض غير قانونية أو ضارة</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. مسؤولية المستخدم</h2>
                <p>
                  أنت مسؤول بالكامل عن جميع الأنشطة التي تتم تحت حسابك. يجب عليك:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>استخدام التطبيق بطريقة مسؤولة وأخلاقية</li>
                  <li>عدم مشاركة معلومات حسابك مع الآخرين</li>
                  <li>الإبلاغ فوراً عن أي استخدام غير مصرح به لحسابك</li>
                  <li>احترام حقوق المستخدمين الآخرين والخصوصية</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. الملكية الفكرية</h2>
                <p>
                  جميع المحتويات والتصاميم والشعارات والعلامات التجارية في هذا التطبيق هي ملك حصري لنا أو لشركائنا. يُمنع:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>نسخ أو توزيع أو تعديل أي جزء من التطبيق</li>
                  <li>استخدام المحتوى لأغراض تجارية دون إذن كتابي</li>
                  <li>إزالة أي إشعارات حقوق النشر أو الملكية</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. إيقاف الحسابات</h2>
                <p>
                  نحتفظ بالحق في إيقاف أو إلغاء حسابك في أي وقت إذا:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>انتهكت هذه الشروط والأحكام</li>
                  <li>قمت بأنشطة احتيالية أو ضارة</li>
                  <li>أساءت استخدام التطبيق أو خدماته</li>
                  <li>قدمت معلومات كاذبة أو مضللة</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">5. إخلاء المسؤولية</h2>
                <p>
                  يتم توفير هذا التطبيق "كما هو" دون أي ضمانات. نحن لا نتحمل المسؤولية عن:
                </p>
                <ul className="list-disc list-inside space-y-2 mr-4">
                  <li>أي خسائر أو أضرار ناتجة عن استخدام التطبيق</li>
                  <li>انقطاع الخدمة أو الأخطاء التقنية</li>
                  <li>فقدان البيانات أو عدم دقة المعلومات</li>
                  <li>أي محتوى من طرف ثالث</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">6. التعديلات على الشروط</h2>
                <p>
                  نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إشعارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال التطبيق.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">7. القانون الحاكم</h2>
                <p>
                  تخضع هذه الشروط والأحكام لقوانين الدولة التي يتم تشغيل الخدمة منها، ويتم حل أي نزاعات وفقاً لذلك.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">8. التواصل</h2>
                <p>
                  إذا كان لديك أي أسئلة حول هذه الشروط، يرجى التواصل معنا عبر البريد الإلكتروني.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-12"></div>

            {/* English Section */}
            <div dir="ltr">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Terms & Conditions
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg font-semibold text-slate-800">
                  Welcome to Smart Home Management application. By using this application, you agree to the following terms and conditions:
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">1. Terms of Use</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must be 18 years or older to use this application</li>
                  <li>You must provide accurate and truthful information when registering</li>
                  <li>You are responsible for maintaining the confidentiality of your password</li>
                  <li>You may not use the application for any illegal or harmful purposes</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">2. User Responsibility</h2>
                <p>
                  You are fully responsible for all activities under your account. You must:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the application in a responsible and ethical manner</li>
                  <li>Not share your account information with others</li>
                  <li>Report immediately any unauthorized use of your account</li>
                  <li>Respect other users' rights and privacy</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">3. Intellectual Property</h2>
                <p>
                  All content, designs, logos, and trademarks in this application are exclusive property of us or our partners. It is prohibited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Copy, distribute, or modify any part of the application</li>
                  <li>Use the content for commercial purposes without written permission</li>
                  <li>Remove any copyright or ownership notices</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">4. Account Suspension</h2>
                <p>
                  We reserve the right to suspend or cancel your account at any time if:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You violate these terms and conditions</li>
                  <li>You engage in fraudulent or harmful activities</li>
                  <li>You misuse the application or its services</li>
                  <li>You provide false or misleading information</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">5. Disclaimer</h2>
                <p>
                  This application is provided "as is" without any warranties. We are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any losses or damages resulting from using the application</li>
                  <li>Service interruptions or technical errors</li>
                  <li>Loss of data or inaccurate information</li>
                  <li>Any third-party content</li>
                </ul>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">6. Modifications to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. You will be notified of any material changes via email or through the application.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">7. Governing Law</h2>
                <p>
                  These terms and conditions are subject to the laws of the country from which the service is operated, and any disputes will be resolved accordingly.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">8. Contact</h2>
                <p>
                  If you have any questions about these terms, please contact us via email.
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
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