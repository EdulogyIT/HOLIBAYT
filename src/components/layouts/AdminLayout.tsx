import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  Users, 
  MessageSquare, 
  Settings,
  LogOut,
  Home
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const adminMenuItems = [
    { title: t('dashboard'), url: '/admin', icon: LayoutDashboard },
    { title: t('bookings'), url: '/admin/bookings', icon: Calendar },
    { title: t('properties'), url: '/admin/properties', icon: Building2 },
    { title: t('hostsAndGuests'), url: '/admin/users', icon: Users },
    { title: t('messages'), url: '/admin/messages', icon: MessageSquare },
    { title: t('settings'), url: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-64">
          <SidebarContent>
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png" 
                  alt="Holibayt" 
                  className="h-8 w-auto"
                />
                <span className="font-semibold text-lg">Admin</span>
              </div>
            </div>

            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>{t('administration')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end={item.url === '/admin'}
                          className={({ isActive }) => 
                            isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"
                          }
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User Actions */}
            <div className="mt-auto p-4 border-t">
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" onClick={() => navigate('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  {t('backToSite')}
                </Button>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('logout')}
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {t('loggedInAs')} {user?.name}
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          {/* Top bar */}
          <header className="h-16 border-b bg-background flex items-center px-6">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-xl font-semibold">{t('adminPanel')}</h1>
            </div>
          </header>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};