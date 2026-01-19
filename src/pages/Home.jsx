import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, ArrowLeft, Wrench, Calendar, Leaf, BarChart3, ShoppingCart, Users, Car, Store, Pill, Wallet, PawPrint, Star, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "مخزون الطعام",
    description: "تتبع المواد الغذائية والمستهلكات",
    icon: ShoppingCart,
    color: "from-orange-400 to-rose-500",
    page: "FoodInventory"
  },
  {
    title: "المهام",
    description: "وزع المهام بين أفراد العائلة",
    icon: ClipboardList,
    color: "from-pink-400 to-rose-500",
    page: "Tasks"
  },
  {
    title: "الصيانة",
    description: "جدولة صيانة الأجهزة المنزلية",
    icon: Wrench,
    color: "from-amber-400 to-orange-500",
    page: "Maintenance"
  },
  {
    title: "الجدول",
    description: "تنظيم جدول الأنشطة والمواعيد",
    icon: Calendar,
    color: "from-sky-400 to-blue-500",
    page: "Schedule"
  },
  {
    title: "النباتات",
    description: "تذكيرات للعناية بالنباتات",
    icon: Leaf,
    color: "from-lime-400 to-green-500",
    page: "Plants"
  },
  {
    title: "الحيوانات الأليفة",
    description: "رعاية شاملة لحيواناتك",
    icon: PawPrint,
    color: "from-pink-500 to-purple-600",
    page: "Pets"
  },
  {
    title: "الأدوية",
    description: "تتبع أدوية أفراد العائلة",
    icon: Pill,
    color: "from-rose-400 to-pink-500",
    page: "Medications"
  },
  {
    title: "العائلة",
    description: "إدارة أفراد الأسرة والتواصل",
    icon: Users,
    color: "from-cyan-400 to-teal-500",
    page: "Family"
  },
  {
    title: "المحادثة العائلية",
    description: "تواصل مع عائلتك بسهولة",
    icon: MessageCircle,
    color: "from-blue-400 to-cyan-500",
    page: "FamilyChat"
  },
  {
    title: "الزيارات",
    description: "تسجيل الزيارات والمشاوير",
    icon: Car,
    color: "from-indigo-400 to-violet-500",
    page: "Visits"
  },
  {
    title: "الموردين",
    description: "إدارة الموردين والمتاجر المفضلة",
    icon: Store,
    color: "from-emerald-400 to-green-500",
    page: "Suppliers"
  },
  {
    title: "المصروفات",
    description: "تتبع وتحليل مصروفات الأسرة",
    icon: Wallet,
    color: "from-purple-500 to-violet-600",
    page: "Expenses"
  },
  {
    title: "مميزات التطبيق",
    description: "اكتشف كل ما يقدمه التطبيق",
    icon: Star,
    color: "from-indigo-500 to-purple-600",
    page: "Features"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-rose-50/30 to-teal-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to={createPageUrl(feature.page)}>
                <Card className={`group h-full border-0 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden bg-gradient-to-br ${feature.color} cursor-pointer`}>
                  <CardContent className="p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <ArrowLeft className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-2 transition-all" />
                    </div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Link */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to={createPageUrl('Analytics')}>
            <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 cursor-pointer">
              <CardContent className="p-5 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">التحليلات والتقارير</h3>
                    <p className="text-white/70 text-sm">إحصائيات شاملة</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-2 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Quran Verse Footer */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 mt-6">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="relative"
          >
            <div className="border-2 border-amber-400/40 rounded-2xl p-4 bg-gradient-to-r from-emerald-900/30 via-transparent to-emerald-900/30">
              <div className="flex items-center justify-center gap-4">
                <span className="text-amber-400 text-2xl">❁</span>
                <p className="text-white text-base md:text-lg leading-relaxed text-center" style={{ fontFamily: 'Amiri, serif' }}>
                  ﴿وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً﴾
                </p>
                <span className="text-amber-400 text-2xl">❁</span>
              </div>
              <p className="text-emerald-300 text-xs text-center mt-2">سورة الروم - ٢١</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}