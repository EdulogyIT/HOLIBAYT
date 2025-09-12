import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { HostLayout } from "@/components/layouts/HostLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import ShortStay from "./pages/ShortStay";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PublishProperty from "./pages/PublishProperty";
import Property from "./pages/Property";
import City from "./pages/City";
import ContactAdvisor from "./pages/ContactAdvisor";
import LoginPage from "./pages/auth/LoginPage";
import Bookings from "./pages/Bookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HostDashboard from "./pages/host/HostDashboard";
import HostOnboarding from "./pages/host/HostOnboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/buy" element={<Buy />} />
              <Route path="/rent" element={<Rent />} />
              <Route path="/short-stay" element={<ShortStay />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/publish-property" element={
                <ProtectedRoute requireAuth>
                  <PublishProperty />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute requireAuth>
                  <Bookings />
                </ProtectedRoute>
              } />
              <Route path="/property/:id" element={<Property />} />
              <Route path="/city/:cityId" element={<City />} />
              <Route path="/contact-advisor" element={<ContactAdvisor />} />
              
              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Host onboarding - requires login but not host role */}
              <Route path="/host/onboarding" element={
                <ProtectedRoute requireAuth>
                  <HostOnboarding />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="bookings" element={<div>Admin Bookings - Coming Soon</div>} />
                      <Route path="properties" element={<div>Admin Properties - Coming Soon</div>} />
                      <Route path="users" element={<div>Admin Users - Coming Soon</div>} />
                      <Route path="messages" element={<div>Admin Messages - Coming Soon</div>} />
                      <Route path="settings" element={<div>Admin Settings - Coming Soon</div>} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Host routes */}
              <Route path="/host/*" element={
                <ProtectedRoute requiredRole="host">
                  <HostLayout>
                    <Routes>
                      <Route index element={<HostDashboard />} />
                      <Route path="calendar" element={<div>Host Calendar - Coming Soon</div>} />
                      <Route path="listings" element={<div>Host Listings - Coming Soon</div>} />
                      <Route path="messages" element={<div>Host Messages - Coming Soon</div>} />
                      <Route path="payouts" element={<div>Host Payouts - Coming Soon</div>} />
                    </Routes>
                  </HostLayout>
                </ProtectedRoute>
              } />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
