import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Calendar, 
  CalendarDays, 
  Building2, 
  MessageSquare, 
  CreditCard,
  LogOut,
  Home,
  Plus
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HostLayoutProps {
  children: ReactNode;
}

export const HostLayout = ({ children }: HostLayoutProps) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const hostMenuItems = [
    { title: 'Reservations', url: '/host', icon: Calendar },
    { title: 'Calendar', url: '/host/calendar', icon: CalendarDays },
    { title: 'Listings', url: '/host/listings', icon: Building2 },
    { title: 'Messages', url: '/host/messages', icon: MessageSquare },
    { title: 'Payouts & Settings', url: '/host/payouts', icon: CreditCard },
  ];

  const quickActions = [
    { title: 'Publish Property', url: '/publish-property', icon: Plus },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/bd206675-bfd0-4aee-936b-479f6c1240ca.png" 
              alt="Holibayt" 
              className="h-8 w-auto"
            />
            <span className="font-semibold text-lg text-foreground">Host</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </div>
              {quickActions.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.title}
                </NavLink>
              ))}
            </div>

            {/* Main Navigation */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Host Dashboard
              </div>
              {hostMenuItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end={item.url === '/host'}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  {item.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        {/* User Actions */}
        <div className="p-4 border-t border-border">
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
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background flex items-center px-4 md:px-6">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Host Dashboard</h1>
        </header>
        
        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};