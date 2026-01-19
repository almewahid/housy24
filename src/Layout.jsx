import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth } from '@/context/AuthContext';
import { db as base44 } from '@/components/api/db';
import { Bell, LayoutDashboard, Calendar, CheckSquare, LogOut, Menu, X, Home as HomeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const { user, signOut } = useAuth(); // ✅ استخدام signOut من AuthContext
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadUnreadCount();
    }
    
    const unsubscribe = base44.entities.Notification.subscribe((event) => {
      if (event.type === 'create') {
        loadUnreadCount();
      }
    });
    
    return unsubscribe;
  }, [user?.email]);

  const loadUnreadCount = async () => {
    if (!user?.email) return;
    
    try {
      const notifications = await base44.entities.Notification.filter({
        user_email: user.email,
        is_read: false
      });
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = async () => {
    // ✅ استخدام signOut من AuthContext
    await signOut();
  };

  // Load section visibility settings
  const [sectionVisibility, setSectionVisibility] = React.useState(null);

  React.useEffect(() => {
    if (user?.email) {
      base44.entities.SectionVisibility.filter({ user_email: user.email })
        .then(results => {
          if (results.length > 0) {
            setSectionVisibility(results[0]);
          }
        })
        .catch(() => {});
    }
  }, [user?.email]);

  const allNavItems = [
    { name: 'Home', icon: HomeIcon, label: 'الرئيسية', visible: true },
    { name: 'Dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', visible: true },
    { name: 'Tasks', icon: CheckSquare, label: 'المهام', visible: sectionVisibility?.show_tasks ?? true },
    { name: 'Calendar', icon: Calendar, label: 'التقويم', visible: true },
    { name: 'Notifications', icon: Bell, label: 'الإشعارات', badge: unreadCount, visible: true },
    { name: 'Gamification', icon: LayoutDashboard, label: 'التحفيز', visible: sectionVisibility?.show_gamification ?? true }
  ];

  const navItems = allNavItems.filter(item => item.visible);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" dir="rtl">
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
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed right-0 top-0 h-screen w-72 glass-effect border-l shadow-xl z-40">
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              إدارة البيت الذكي
            </h1>
            <p className="text-sm text-gray-500 mt-1">إدارة المهام المنزلية بذكاء</p>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              {user.role === 'admin' && (
                <Badge className="mt-2 bg-purple-600">مدير</Badge>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={createPageUrl(item.name)}
                className={`nav-link flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  currentPageName === item.name
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <Badge className={currentPageName === item.name ? 'bg-white text-indigo-600' : 'bg-red-500'}>
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:mr-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}