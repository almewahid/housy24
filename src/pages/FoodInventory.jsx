import React, { useState } from 'react';
import { db as base44 } from '@/components/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, ShoppingCart, AlertTriangle, Package, Trash2, Pencil, Sparkles, Store, X, Brain, Globe, ChefHat, TrendingDown, BookOpen, ScanSearch, Camera, Cpu } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from "framer-motion";
import FoodItemCard from '@/components/food/FoodItemCard';
import FoodItemForm from '@/components/food/FoodItemForm';
import AIRecommendations from '@/components/food/AIRecommendations';
import PriceComparisonPanel from '@/components/food/PriceComparisonPanel';
import CommentSection from '@/components/comments/CommentSection';
import SmartInventoryAI from '@/components/food/SmartInventoryAI';
import OnlineStoresPanel from '@/components/food/OnlineStoresPanel';
import ConsumptionAnalytics from '@/components/food/ConsumptionAnalytics';
import RecipeCookingModal from '@/components/cooking/RecipeCookingModal';
import ProductInputMethods from '@/components/food/ProductInputMethods';
import SmartProductSearch from '@/components/search/SmartProductSearch';
import ContentZone from '@/components/content/ContentZone';
import EnhancedImageSearch from '@/components/search/EnhancedImageSearch';
import StoreIntegration from '@/components/stores/StoreIntegration';
import SmartAIEngine from '@/components/ai/SmartAIEngine';
import ModalWrapper from '@/components/common/ModalWrapper';
import EditableQuantity from '@/components/common/EditableQuantity';

const categories = ["الكل", "ألبان", "لحوم", "خضروات", "فواكه", "حبوب", "معلبات", "مشروبات", "بهارات", "مجمدات", "أخرى"];
const storageLocations = ["الكل", "ثلاجة", "فريزر", "خزانة", "رف"];

export default function FoodInventory() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [storageFilter, setStorageFilter] = useState('الكل');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showSmartAI, setShowSmartAI] = useState(false);
  const [showStoresPanel, setShowStoresPanel] = useState(false);
  const [showCookingModal, setShowCookingModal] = useState(false);
  const [showConsumption, setShowConsumption] = useState(false);
  const [showProductInput, setShowProductInput] = useState(false);
  const [showSmartSearch, setShowSmartSearch] = useState(false);
  const [showContentZone, setShowContentZone] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showStoreIntegration, setShowStoreIntegration] = useState(false);
  const [showAIEngine, setShowAIEngine] = useState(false);
  const [selectedItemForPrice, setSelectedItemForPrice] = useState(null);
  const [selectedItemForComments, setSelectedItemForComments] = useState(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['foodInventory'],
    queryFn: () => base44.entities.FoodInventory.list()
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FoodInventory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodInventory'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FoodInventory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodInventory'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FoodInventory.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['foodInventory'] })
  });

  const handleSave = (data) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleQuantityChange = (item, change) => {
    const newQuantity = Math.max(0, item.quantity + change);
    updateMutation.mutate({ id: item.id, data: { ...item, quantity: newQuantity } });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'الكل' || item.category === categoryFilter;
    const matchesStorage = storageFilter === 'الكل' || item.storage_location === storageFilter;
    const matchesLowStock = !showLowStock || (item.min_quantity && item.quantity <= item.min_quantity);
    return matchesSearch && matchesCategory && matchesStorage && matchesLowStock;
  });

  const lowStockItems = items.filter(i => i.min_quantity && i.quantity <= i.min_quantity);
  const lowStockCount = lowStockItems.length;
  const expiringCount = items.filter(i => {
    if (!i.expiry_date) return false;
    const diff = (new Date(i.expiry_date) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  }).length;

  const addToShoppingList = async (item) => {
    await base44.entities.ShoppingList.create({
      name: item.name,
      category: item.category,
      quantity: 1,
      unit: item.unit,
      food_inventory_id: item.id
    });
    queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">مخزون الطعام</h1>
            <p className="text-slate-500">تتبع المواد الغذائية والمستهلكات</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('ShoppingList')}>
              <Button variant="outline" className="gap-2">
                <ShoppingCart className="w-5 h-5" />
                قائمة التسوق
              </Button>
            </Link>
            <Link to={createPageUrl('Suppliers')}>
              <Button variant="outline" className="gap-2">
                <Store className="w-5 h-5" />
                الموردين
              </Button>
            </Link>
            <Button onClick={() => setShowAI(!showAI)} variant={showAI ? "secondary" : "outline"} className="gap-2">
              <Sparkles className="w-5 h-5" />
              توصيات
            </Button>
            <Button onClick={() => setShowSmartAI(!showSmartAI)} variant={showSmartAI ? "secondary" : "outline"} className="gap-2">
              <Brain className="w-5 h-5" />
              تحليل ذكي
            </Button>
            <Button onClick={() => setShowStoresPanel(!showStoresPanel)} variant={showStoresPanel ? "secondary" : "outline"} className="gap-2">
              <Globe className="w-5 h-5" />
              مقارنة أسعار
            </Button>
            <Button onClick={() => setShowConsumption(!showConsumption)} variant={showConsumption ? "secondary" : "outline"} className="gap-2">
              <TrendingDown className="w-5 h-5" />
              الاستهلاك
            </Button>
            <Button onClick={() => setShowSmartSearch(!showSmartSearch)} variant={showSmartSearch ? "secondary" : "outline"} className="gap-2">
              <ScanSearch className="w-5 h-5" />
              بحث ذكي
            </Button>
            <Button onClick={() => setShowContentZone(!showContentZone)} variant={showContentZone ? "secondary" : "outline"} className="gap-2">
              <BookOpen className="w-5 h-5" />
              محتوى
            </Button>
            <Button onClick={() => setShowImageSearch(true)} variant="outline" className="gap-2">
              <Camera className="w-5 h-5" />
              صور
            </Button>
            <Button onClick={() => setShowStoreIntegration(true)} variant="outline" className="gap-2">
              <Store className="w-5 h-5" />
              المتاجر
            </Button>
            <Button onClick={() => setShowAIEngine(true)} variant="outline" className="gap-2">
              <Cpu className="w-5 h-5" />
              AI
            </Button>
            <Button onClick={() => setShowCookingModal(true)} className="gap-2 bg-amber-600 hover:bg-amber-700">
              <ChefHat className="w-5 h-5" />
              طبخ وجبة
            </Button>
            <Button onClick={() => setShowProductInput(true)} className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="w-5 h-5" />
              إضافة منتج
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{items.length}</p>
                <p className="text-sm text-slate-500">منتج</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`border-0 shadow-sm cursor-pointer transition-all ${showLowStock ? 'bg-amber-100 ring-2 ring-amber-400' : 'bg-white/80'}`}
            onClick={() => setShowLowStock(!showLowStock)}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-sm text-slate-500">كمية منخفضة</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiringCount}</p>
                <p className="text-sm text-slate-500">ينتهي قريباً</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className="text-sm text-slate-500">للتسوق</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/80"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-40 bg-white/80">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={storageFilter} onValueChange={setStorageFilter}>
            <SelectTrigger className="w-full md:w-40 bg-white/80">
              <SelectValue placeholder="مكان التخزين" />
            </SelectTrigger>
            <SelectContent>
              {storageLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">لا توجد منتجات</p>
            <Button onClick={() => setShowForm(true)}>إضافة أول منتج</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <FoodItemCard 
                    item={item} 
                    onQuantityChange={handleQuantityChange}
                    onClick={handleEdit}
                  />
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="h-7 w-7"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(item.id);
                      }}
                      className="h-7 w-7 bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* AI Recommendations Panel */}
        {showAI && (
          <div className="fixed left-6 top-24 w-80 z-40">
            <AIRecommendations inventory={items} lowStockItems={lowStockItems} />
          </div>
        )}

        {/* Smart AI Analysis Panel */}
        {showSmartAI && (
          <div className="fixed right-6 top-24 w-96 z-40">
            <SmartInventoryAI 
              inventory={items} 
              onAddToShoppingList={addToShoppingList}
            />
          </div>
        )}

        {/* Online Stores Panel */}
        {showStoresPanel && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowStoresPanel(false)}>
            <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <OnlineStoresPanel 
                suppliers={suppliers}
                onAddToCart={(item) => {
                  addToShoppingList(item);
                  setShowStoresPanel(false);
                }}
                onAddToInventory={(item) => {
                  setEditingItem(null);
                  setShowForm(true);
                  setShowStoresPanel(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Consumption Analytics Panel */}
        {showConsumption && (
          <div className="fixed left-6 top-24 w-96 z-40">
            <ConsumptionAnalytics 
              inventory={items}
              onReorderSuggestion={addToShoppingList}
            />
          </div>
        )}

        {/* Smart Search Panel */}
        <ModalWrapper open={showSmartSearch} onClose={() => setShowSmartSearch(false)} maxWidth="max-w-lg">
          <SmartProductSearch
            onAddToInventory={(data) => {
              createMutation.mutate(data);
              setShowSmartSearch(false);
            }}
            onAddToCart={(data) => {
              addToShoppingList(data);
              setShowSmartSearch(false);
            }}
          />
        </ModalWrapper>

        {/* Content Zone Panel */}
        <ModalWrapper open={showContentZone} onClose={() => setShowContentZone(false)}>
          <ContentZone />
        </ModalWrapper>

        {/* Enhanced Image Search */}
        <ModalWrapper open={showImageSearch} onClose={() => setShowImageSearch(false)} maxWidth="max-w-lg">
          <EnhancedImageSearch
            onClose={() => setShowImageSearch(false)}
            onAddToInventory={(data) => {
              createMutation.mutate(data);
              setShowImageSearch(false);
            }}
            onAddToCart={(data) => {
              addToShoppingList(data);
              setShowImageSearch(false);
            }}
          />
        </ModalWrapper>

        {/* Store Integration */}
        <ModalWrapper open={showStoreIntegration} onClose={() => setShowStoreIntegration(false)}>
          <StoreIntegration onAddToCart={addToShoppingList} />
        </ModalWrapper>

        {/* Smart AI Engine */}
        <ModalWrapper open={showAIEngine} onClose={() => setShowAIEngine(false)} maxWidth="max-w-lg">
          <SmartAIEngine
            onAddToCart={addToShoppingList}
            onSuggestRecipe={(recipe) => {
              setShowAIEngine(false);
              setShowCookingModal(true);
            }}
          />
        </ModalWrapper>

        {/* Cooking Modal */}
        {showCookingModal && (
          <RecipeCookingModal onClose={() => setShowCookingModal(false)} />
        )}

        {/* Product Input Methods */}
        <ProductInputMethods
          open={showProductInput}
          onClose={() => setShowProductInput(false)}
          onProductAdded={(data) => {
            createMutation.mutate(data);
            setShowProductInput(false);
          }}
        />

        {/* Price Comparison Panel */}
        {selectedItemForPrice && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItemForPrice(null)}>
            <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setSelectedItemForPrice(null)}>
                <X className="w-6 h-6" />
              </Button>
              <PriceComparisonPanel 
                productName={selectedItemForPrice.name}
                category={selectedItemForPrice.category}
                onAddToCart={() => { addToShoppingList(selectedItemForPrice); setSelectedItemForPrice(null); }}
              />
            </div>
          </div>
        )}

        {/* Comments Panel */}
        {selectedItemForComments && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItemForComments(null)}>
            <div className="max-w-md w-full" onClick={e => e.stopPropagation()}>
              <Button size="icon" variant="ghost" className="absolute top-4 right-4 text-white" onClick={() => setSelectedItemForComments(null)}>
                <X className="w-6 h-6" />
              </Button>
              <CommentSection 
                entityType="FoodInventory"
                entityId={selectedItemForComments.id}
                entityName={selectedItemForComments.name}
              />
            </div>
          </div>
        )}

        {/* Form Modal */}
        <AnimatePresence>
          {showForm && (
            <FoodItemForm 
              item={editingItem}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingItem(null); }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}