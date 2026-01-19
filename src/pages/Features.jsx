import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, ClipboardList, Wrench, Calendar, Leaf, PawPrint, 
  Pill, Users, Car, Store, Wallet, BarChart3, 
  CheckCircle, Sparkles, Zap, Shield, Clock, Heart,
  Download, Star
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    id: "food",
    title: "مخزون الطعام",
    icon: ShoppingCart,
    color: "from-orange-400 to-rose-500",
    benefits: [
      "تتبع تواريخ انتهاء الصلاحية تلقائياً",
      "تنبيهات عند نفاد المنتجات",
      "مقارنة الأسعار بين المتاجر",
      "توصيات ذكية بناءً على الاستهلاك"
    ],
    quote: "لن تنسى أبداً شراء ما تحتاجه!"
  },
  {
    id: "tasks",
    title: "المهام المنزلية",
    icon: ClipboardList,
    color: "from-pink-400 to-rose-500",
    benefits: [
      "توزيع عادل للمهام بين أفراد الأسرة",
      "نظام نقاط تحفيزي للأطفال",
      "تذكيرات تلقائية",
      "متابعة الإنجاز والتقدم"
    ],
    quote: "منزل منظم = عائلة سعيدة!"
  },
  {
    id: "maintenance",
    title: "الصيانة الدورية",
    icon: Wrench,
    color: "from-amber-400 to-orange-500",
    benefits: [
      "جدولة صيانة الأجهزة المنزلية",
      "تذكيرات قبل موعد الصيانة",
      "حفظ تاريخ كل صيانة",
      "تقدير التكاليف"
    ],
    quote: "الوقاية خير من العلاج - لأجهزتك المنزلية!"
  },
  {
    id: "schedule",
    title: "جدول العائلة",
    icon: Calendar,
    color: "from-sky-400 to-blue-500",
    benefits: [
      "تنسيق مواعيد جميع أفراد الأسرة",
      "تنبيهات للأنشطة المهمة",
      "دمج مع تقويم جوجل",
      "رؤية شاملة للأسبوع"
    ],
    quote: "نظم وقتك، نظم حياتك!"
  },
  {
    id: "plants",
    title: "رعاية النباتات",
    icon: Leaf,
    color: "from-lime-400 to-green-500",
    benefits: [
      "جدول ري مخصص لكل نبتة",
      "تذكيرات التسميد والعناية",
      "نصائح للعناية بالنباتات",
      "متابعة النمو والصحة"
    ],
    quote: "حديقتك الخضراء في متناول يدك!"
  },
  {
    id: "pets",
    title: "رعاية الحيوان",
    icon: PawPrint,
    color: "from-pink-500 to-purple-600",
    benefits: [
      "سجل صحي كامل لحيواناتك",
      "جدول التطعيمات والأدوية",
      "تذكيرات الوجبات والعناية",
      "معلومات الطبيب البيطري"
    ],
    quote: "حيواناتك تستحق أفضل رعاية!"
  },
  {
    id: "medications",
    title: "إدارة الأدوية",
    icon: Pill,
    color: "from-rose-400 to-pink-500",
    benefits: [
      "تذكيرات دقيقة لمواعيد الأدوية",
      "متابعة الجرعات والكميات",
      "تنبيهات نفاد الأدوية",
      "سجل كامل لكل فرد"
    ],
    quote: "صحتك أمانة، لا تنساها!"
  },
  {
    id: "family",
    title: "إدارة العائلة",
    icon: Users,
    color: "from-cyan-400 to-teal-500",
    benefits: [
      "ملفات شخصية لكل فرد",
      "نظام صلاحيات مرن",
      "تتبع الإنجازات والنقاط",
      "تواصل فعال بين الأفراد"
    ],
    quote: "عائلة متصلة، عائلة قوية!"
  },
  {
    id: "expenses",
    title: "المصروفات والميزانية",
    icon: Wallet,
    color: "from-purple-500 to-violet-600",
    benefits: [
      "تتبع دقيق لكل مصروف",
      "تقارير تحليلية تفصيلية",
      "ميزانية ذكية لكل فئة",
      "توقعات الإنفاق القادم"
    ],
    quote: "تحكم في مصروفك، تحكم في مستقبلك!"
  },
  {
    id: "analytics",
    title: "التحليلات الذكية",
    icon: BarChart3,
    color: "from-slate-600 to-slate-800",
    benefits: [
      "رؤى شاملة عن حياتك المنزلية",
      "اتجاهات وأنماط الإنفاق",
      "تقارير مخصصة",
      "توصيات AI للتحسين"
    ],
    quote: "البيانات تقود إلى القرارات الأفضل!"
  }
];

const appBenefits = [
  { icon: Zap, text: "سهل الاستخدام", desc: "واجهة بسيطة وواضحة" },
  { icon: Shield, text: "آمن تماماً", desc: "بياناتك محمية" },
  { icon: Clock, text: "وفر وقتك", desc: "أتمتة ذكية للمهام" },
  { icon: Heart, text: "لكل العائلة", desc: "مناسب لجميع الأعمار" },
  { icon: Sparkles, text: "ذكاء اصطناعي", desc: "توصيات وتحليلات ذكية" },
  { icon: CheckCircle, text: "مجاني", desc: "جميع الميزات مجانية" }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white">
              <Star className="w-5 h-5" />
              <span className="font-bold">التطبيق الأول لإدارة المنزل الذكي</span>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
            مدير المنزل الذكي
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            كل ما تحتاجه لإدارة منزلك وعائلتك بكفاءة وذكاء - في تطبيق واحد شامل
          </p>
          <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8">
            <Download className="w-5 h-5" />
            ابدأ الآن مجاناً
          </Button>
        </motion.div>

        {/* App Benefits */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16"
        >
          {appBenefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-white/80 dark:bg-slate-800/80 border-0 shadow-md hover:shadow-xl transition-all">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{benefit.text}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{benefit.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="food" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 h-auto bg-white/50 dark:bg-slate-800/50 p-2 rounded-xl mb-8">
              {features.map((feature) => (
                <TabsTrigger 
                  key={feature.id} 
                  value={feature.id}
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg dark:data-[state=active]:bg-blue-700"
                >
                  <feature.icon className="w-4 h-4" />
                </TabsTrigger>
              ))}
            </TabsList>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id}>
                <Card className="bg-white/90 dark:bg-slate-800/90 border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{feature.title}</h2>
                        <p className="text-lg text-purple-600 dark:text-purple-400 font-medium italic">
                          "{feature.quote}"
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {feature.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-700 dark:to-purple-900/20 rounded-xl"
                        >
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                جاهز لتحويل منزلك إلى منزل ذكي؟
              </h2>
              <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                انضم لآلاف العائلات التي تستخدم مدير المنزل الذكي لحياة أسهل وأكثر تنظيماً
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="gap-2 bg-white text-purple-600 hover:bg-purple-50 text-lg px-8">
                  <Download className="w-5 h-5" />
                  ابدأ الآن مجاناً
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg px-8">
                  <Sparkles className="w-5 h-5" />
                  شاهد العرض التوضيحي
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}