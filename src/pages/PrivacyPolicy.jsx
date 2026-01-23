import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy / سياسة الخصوصية - Smart Home Management';
    
    const metaDescription = document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = 'Privacy Policy: We respect your privacy and protect your personal data';
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
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-8 md:p-12">
            {/* Arabic Section */}
            <div className="mb-12" dir="rtl">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                سياسة الخصوصية
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg">
                  نحن نحترم خصوصيتك ونحمي بياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">جمع المعلومات</h2>
                <p>
                  نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل واستخدام التطبيق، مثل الاسم والبريد الإلكتروني.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">استخدام المعلومات</h2>
                <p>
                  نستخدم معلوماتك لتوفير وتحسين خدماتنا، وإرسال التحديثات والإشعارات المهمة.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">حماية البيانات</h2>
                <p>
                  نستخدم أحدث تقنيات التشفير والأمان لحماية بياناتك من الوصول غير المصرح به.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">مشاركة المعلومات</h2>
                <p>
                  لن نشارك معلوماتك الشخصية مع أطراف ثالثة إلا بموافقتك الصريحة أو عندما يتطلب القانون ذلك.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">حقوقك</h2>
                <p>
                  يحق لك الوصول إلى بياناتك الشخصية، وتصحيحها، وحذفها في أي وقت من خلال إعدادات حسابك.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">التواصل معنا</h2>
                <p>
                  إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-12"></div>

            {/* English Section */}
            <div dir="ltr">
              <h1 className="text-4xl font-bold text-slate-900 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              
              <div className="prose prose-slate max-w-none space-y-4 text-slate-700 leading-relaxed">
                <p className="text-lg">
                  We respect your privacy and protect your personal data. This policy explains how we collect, use, and safeguard your information.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Information Collection</h2>
                <p>
                  We collect information you provide directly to us when registering and using the application, such as your name and email address.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Use of Information</h2>
                <p>
                  We use your information to provide and improve our services, and to send important updates and notifications.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Data Protection</h2>
                <p>
                  We use the latest encryption and security technologies to protect your data from unauthorized access.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Information Sharing</h2>
                <p>
                  We will not share your personal information with third parties except with your explicit consent or when required by law.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Your Rights</h2>
                <p>
                  You have the right to access, correct, and delete your personal data at any time through your account settings.
                </p>

                <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our privacy policy, please contact us via email.
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