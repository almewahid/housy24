import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, Link as LinkIcon, CheckCircle, AlertCircle, 
  TrendingDown, Sparkles, Loader2, ShoppingCart, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from '@/api/base44Client';

const stores = [
  { 
    id: 'carrefour', 
    name: 'كارفور', 
    logo: '🛒',
    color: 'from-blue-500 to-blue-600',
    url: 'https://www.carrefouregypt.com'
  },
  { 
    id: 'noon', 
    name: 'نون', 
    logo: '🌙',
    color: 'from-yellow-500 to-orange-500',
    url: 'https://www.noon.com'
  },
  { 
    id: 'amazon', 
    name: 'أمازون', 
    logo: '📦',
    color: 'from-orange-400 to-orange-600',
    url: 'https://www.amazon.eg'
  },
  { 
    id: 'kazyon', 
    name: 'كازيون', 
    logo: '🏪',
    color: 'from-green-500 to-green-600',
    url: 'https://kazyon.com'
  }
];

export default function SmartStoresIntegration({ shoppingList, onClose }) {
  const [connectedStores, setConnectedStores] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState(null);

  const connectStore = (storeId) => {
    if (connectedStores.includes(storeId)) {
      setConnectedStores(connectedStores.filter(id => id !== storeId));
    } else {
      setConnectedStores([...connectedStores, storeId]);
    }
  };

  const compareAllStores = async () => {
    if (connectedStores.length === 0) return;
    
    setComparing(true);
    
    try {
      const itemsList = shoppingList.map(item => `${item.name} (${item.quantity} ${item.unit})`).join('\n');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `قم بمقارنة الأسعار التقديرية لقائمة التسوق التالية عبر المتاجر المحددة، وقدم توصية بأفضل متجر:

قائمة التسوق:
${itemsList}

المتاجر المتصلة:
${connectedStores.map(id => stores.find(s => s.id === id).name).join('، ')}

قدم:
1. سعر تقديري لكل منتج في كل متجر
2. إجمالي الفاتورة المتوقعة لكل متجر
3. أفضل متجر بناءً على السعر الإجمالي
4. توصيات إضافية (عروض، توصيل، جودة)`,
        response_json_schema: {
          type: "object",
          properties: {
            store_totals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  store: { type: "string" },
                  total: { type: "number" },
                  delivery_fee: { type: "number" }
                }
              }
            },
            best_store: { type: "string" },
            best_store_reason: { type: "string" },
            special_offers: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
      
      setComparison(response);
    } catch (error) {
      console.error('Error:', error);
    }
    
    setComparing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
      >
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-2xl">
          <CardHeader className="border-b dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2 text-slate-900 dark:text-white">
                <Store className="w-6 h-6" />
                المتاجر الذكية
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              قارن الأسعار واحصل على أفضل العروض من متاجرك المفضلة
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <Tabs defaultValue="connect">
              <TabsList className="grid w-full grid-cols-2 mb-6 dark:bg-slate-700">
                <TabsTrigger value="connect" className="dark:data-[state=active]:bg-slate-600">
                  <LinkIcon className="w-4 h-4 ml-2" />
                  ربط المتاجر
                </TabsTrigger>
                <TabsTrigger value="compare" className="dark:data-[state=active]:bg-slate-600">
                  <Sparkles className="w-4 h-4 ml-2" />
                  المقارنة والتوصيات
                </TabsTrigger>
              </TabsList>

              {/* Connect Stores Tab */}
              <TabsContent value="connect" className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {stores.map(store => {
                    const isConnected = connectedStores.includes(store.id);
                    return (
                      <motion.div
                        key={store.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            isConnected 
                              ? 'ring-2 ring-green-500 dark:ring-green-400' 
                              : 'hover:shadow-md'
                          } dark:bg-slate-700`}
                          onClick={() => connectStore(store.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${store.color} flex items-center justify-center text-2xl`}>
                                  {store.logo}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{store.name}</h3>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{store.url}</p>
                                </div>
                              </div>
                              {isConnected ? (
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                              ) : (
                                <AlertCircle className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                            <Badge 
                              className={isConnected 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                              }
                            >
                              {isConnected ? 'متصل' : 'غير متصل'}
                            </Badge>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>{connectedStores.length}</strong> متجر متصل
                  </p>
                </div>
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare">
                {connectedStores.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4">قم بربط متجر واحد على الأقل للمقارنة</p>
                  </div>
                ) : (
                  <>
                    <Button 
                      onClick={compareAllStores} 
                      disabled={comparing}
                      className="w-full mb-6 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      {comparing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          جاري المقارنة...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          قارن الأسعار الآن
                        </>
                      )}
                    </Button>

                    {comparison && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        {/* Store Totals */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-0">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                              <ShoppingCart className="w-5 h-5" />
                              مقارنة الأسعار
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {comparison.store_totals?.map((store, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-700 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">
                                    {stores.find(s => s.name === store.store)?.logo || '🏪'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{store.store}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      توصيل: {store.delivery_fee || 0} ج.م
                                    </p>
                                  </div>
                                </div>
                                <div className="text-left">
                                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                                    {store.total} ج.م
                                  </p>
                                  {store.store === comparison.best_store && (
                                    <Badge className="bg-green-500 text-white mt-1">
                                      الأفضل
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Best Store */}
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                              <h3 className="font-bold text-lg text-green-800 dark:text-green-400">
                                أفضل متجر: {comparison.best_store}
                              </h3>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              {comparison.best_store_reason}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Special Offers */}
                        {comparison.special_offers?.length > 0 && (
                          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-400">
                                <Tag className="w-5 h-5" />
                                عروض خاصة
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {comparison.special_offers.map((offer, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700 dark:text-orange-300">
                                    <span>🎁</span>
                                    <span>{offer}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}

                        {/* Recommendations */}
                        {comparison.recommendations?.length > 0 && (
                          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                            <CardHeader>
                              <CardTitle className="text-lg flex items-center gap-2 text-blue-800 dark:text-blue-400">
                                <Sparkles className="w-5 h-5" />
                                توصيات
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {comparison.recommendations.map((rec, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                                    <span>💡</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </motion.div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}