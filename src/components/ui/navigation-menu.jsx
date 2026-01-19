export function AppNavigationMenu() {
  const { user, signOut, isLoadingAuth } = useAuth();

  console.log('=== Navigation Menu Debug ===');
  console.log('user:', user);
  console.log('isLoadingAuth:', isLoadingAuth);
  console.log('user exists?', !!user);

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    await signOut();
  };

  if (isLoadingAuth) {
    return null; // أخفي القائمة أثناء التحميل
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>الحساب</NavigationMenuTrigger>
          <NavigationMenuContent className="flex flex-col p-2 space-y-1">
            {user ? (
              <>
                <NavigationMenuLink 
                  href="/profile" 
                  className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                >
                  الملف الشخصي
                </NavigationMenuLink>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-right px-4 py-2 hover:bg-gray-100 rounded-md text-red-600"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <NavigationMenuLink 
                href="/login" 
                className="block px-4 py-2 hover:bg-gray-100 rounded-md"
              >
                تسجيل الدخول
              </NavigationMenuLink>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}