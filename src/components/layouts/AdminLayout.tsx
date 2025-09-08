import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  const adminMenuItems = [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'Bookings', url: '/admin/bookings', icon: Calendar },
    { title: 'Properties', url: '/admin/properties', icon: Building2 },
    { title: 'Hosts & Guests', url: '/admin/users', icon: Users },
    { title: 'Messages', url: '/admin/messages', icon: MessageSquare },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar 
          variant={isMobile ? "floating" : "sidebar"}
          className={isMobile ? "w-64" : "w-64"}
          collapsible="icon"
        >
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
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
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
                  Back to Site
                </Button>
                <Button variant="ghost" className="justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Logged in as {user?.name}
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 md:ml-64">
          {/* Top bar */}
          <header className="h-16 border-b bg-background flex items-center px-4 md:px-6">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-lg md:text-xl font-semibold">Admin Panel</h1>
            </div>
          </header>
          
          {/* Content */}
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};