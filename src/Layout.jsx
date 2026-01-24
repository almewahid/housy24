import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { supabase } from '@/components/api/supabaseClient';
import { Bell, LayoutDashboard, Calendar, CheckSquare, LogOut, Menu, X, Home as HomeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExternalLinkHandler from '@/components/common/ExternalLinkHandler';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    loadUnreadCount();
  }, []);

  const loadUser = async () => {
    try {
      // Get authenticated user from Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        setUser(null);
        return;
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setUser({ ...authUser, role: 'user' });
        return;
      }

      setUser({ 
        ...authUser, 
        role: profile?.role || 'user',
        full_name: profile?.full_name,
        email: profile?.email || authUser.email
      });
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUnreadCount(0);
        return;
      }

      // إذا كان عندك جدول Notifications في Supabase
      const { data: notifications, error } = await supabase
        .from('Notification')
        .select('id', { count: 'exact' })
        .eq('user_id', authUser.id)
        .eq('is_read', false);

      if (error) {
        console.error('Error loading notifications:', error);
        setUnreadCount(0);
        return;
      }

      setUnreadCount(notifications?.length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Load section visibility settings (disabled for now)
  const [sectionVisibility, setSectionVisibility] = React.useState({ show_tasks: true, show_gamification: true });

  // يمكنك تفعيل هذا لاحقاً إذا أنشأت جدول section_visibility في Supabase
  // React.useEffect(() => {
  //   if (user?.email) {
  //     supabase.from('section_visibility').select('*').eq('user_email', user.email).single()
  //       .then(({ data }) => {
  //         if (data) setSectionVisibility(data);
  //       })
  //       .catch(() => {});
  //   }
  // }, [user?.email]);

  const allNavItems = [
    { name: 'Home', icon: HomeIcon, label: 'الرئيسية', visible: true },
    { name: 'Dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', visible: true },
    { name: 'Tasks', icon: CheckSquare, label: 'المهام', visible: sectionVisibility?.show_tasks ?? true },
    { name: 'Calendar', icon: Calendar, label: 'التقويم', visible: true },
    { name: 'Notifications', icon: Bell, label: 'الإشعارات', badge: unreadCount, visible: true },
    { name: 'Gamification', icon: LayoutDashboard, label: 'التحفيز', visible: sectionVisibility?.show_gamification ?? true }
  ];

  const navItems = allNavItems.filter(item => item.visible);

  // حماية صفحة AdminSupport - الأدمن فقط
  if (currentPageName === 'AdminSupport' && user && user.role !== 'admin') {
    return <Navigate to={createPageUrl('Home')} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" dir="rtl">
      {/* External Link Handler for App Store Compliance */}
      <ExternalLinkHandler />
      
      <style>{`
        * {
          font-family: 'Tajawal', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        
        :root {
          --primary: #4F46E5;
          --primary-dark: #4338CA;
          --secondary: #7C3AED;
          --accent: #EC4899;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
        }

        body {
          overflow-x: hidden;
        }

        .nav-link {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link:hover {
          transform: translateX(-4px);
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Top Navigation Bar - Mobile */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-50 glass-effect border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            إدارة البيت الذكي
          </h1>
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -left-2 bg-red-500 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-0 left-0 bg-white border-b shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentPageName === item.name ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <Badge className="bg-red-500">{item.badge}</Badge>
                )}
              </Link>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">تسجيل الخروج</span>
              </button>
            ) : (
              <Link
                to={createPageUrl('Login')}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <LogOut className="h-5 w-5 transform rotate-180" />
                <span className="font-medium">تسجيل الدخول</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed right-0 top-0 h-screen w-72 glass-effect border-l shadow-xl z-40 overflow-hidden">
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              إدارة البيت الذكي
            </h1>
            <p className="text-xs text-gray-500 mt-1">إدارة المهام المنزلية بذكاء</p>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{user.email}</p>
              {user.role === 'admin' && (
                <Badge className="mt-1.5 bg-purple-600 text-xs">مدير</Badge>
              )}
            </div>
          )}

          {/* Navigation - مع scroll */}
          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`nav-link flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  currentPageName === item.name
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white hover:shadow-md dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <Badge className={currentPageName === item.name ? 'bg-white text-indigo-600 text-xs' : 'bg-red-500 text-xs'}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Login/Logout Button */}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          ) : (
            <Link
              to={createPageUrl('Login')}
              className="flex items-center gap-2 px-3 py-2 mt-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all text-sm"
            >
              <LogOut className="h-4 w-4 transform rotate-180" />
              <span className="font-medium">تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="lg:mr-72 bg-gradient-to-r from-slate-800 to-slate-900 text-white py-8 border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-300">
              © 2026 إدارة البيت الذكي | Smart Home Management
            </p>
            <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
              <Link 
                to={createPageUrl('PrivacyPolicy')} 
                className="text-slate-300 hover:text-white transition-colors hover:underline"
              >
                سياسة الخصوصية | Privacy
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                to={createPageUrl('TermsAndConditions')} 
                className="text-slate-300 hover:text-white transition-colors hover:underline"
              >
                الشروط | Terms
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                to={createPageUrl('CookiesPolicy')} 
                className="text-slate-300 hover:text-white transition-colors hover:underline"
              >
                ملفات تعريف الارتباط | Cookies
              </Link>
              <span className="text-slate-600">•</span>
              <Link 
                to={createPageUrl('Support')} 
                className="text-slate-300 hover:text-white transition-colors hover:underline"
              >
                الدعم | Support
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}