import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { HostLayout } from "@/components/layouts/HostLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { PlatformSettingsProvider } from "@/contexts/PlatformSettingsContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Buy from "./pages/Buy";
import Rent from "./pages/Rent";
import ShortStay from "./pages/ShortStay";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PublishProperty from "./pages/PublishProperty";
import EditProperty from "./pages/EditProperty";
import Property from "./pages/Property";
import PropertyEnhanced from "./pages/PropertyEnhanced";
import City from "./pages/City";
import ContactAdvisor from "./pages/ContactAdvisor";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Wishlist from "./pages/Wishlist";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminSuperhost from "./pages/admin/AdminSuperhost";
import AdminCommissions from "./pages/admin/AdminCommissions";
import AdminKYC from "./pages/admin/AdminKYC";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import CreateBlog from "./pages/host/CreateBlog";
import HostDashboard from "./pages/host/HostDashboard";
import HostOnboarding from "./pages/host/HostOnboarding";
import HostListings from "./pages/host/HostListings";
import HostMessages from "./pages/host/HostMessages";
import HostPayouts from "./pages/host/HostPayouts";
import HostBookings from "./pages/host/HostBookings";
import HostKYC from "./pages/host/HostKYC";
import CreateAgreement from "./pages/host/CreateAgreement";
import HostAgreements from "./pages/host/HostAgreements";
import PropertyCalendar from "@/components/PropertyCalendar";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import BookingSuccess from "./pages/BookingSuccess";
import BookingCancel from "./pages/BookingCancel";
import HolibaytPay from "./pages/HolibaytPay";
import Lawyers from "./pages/Lawyers";
import LegalProcess from "./pages/LegalProcess";
import SignAgreement from "./pages/SignAgreement";
import TenantAgreements from "./pages/TenantAgreements";
import AgreementTemplate from "./pages/AgreementTemplate";
import AdminLawyers from "./pages/admin/AdminLawyers";
import AdminLawyerRequests from "./pages/admin/AdminLawyerRequests";
import AdminDocumentTemplates from "./pages/admin/AdminDocumentTemplates";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlatformSettingsProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />

        <Routes>
          {/* ✅ All public routes wrapped in MaintenanceMode */}
          <Route path="/" element={<MaintenanceMode><Index /></MaintenanceMode>} />
          <Route path="/buy" element={<MaintenanceMode><Buy /></MaintenanceMode>} />
          <Route path="/rent" element={<MaintenanceMode><Rent /></MaintenanceMode>} />
          <Route path="/short-stay" element={<MaintenanceMode><ShortStay /></MaintenanceMode>} />
          <Route path="/holibayt-pay" element={<MaintenanceMode><HolibaytPay /></MaintenanceMode>} />
          <Route path="/about" element={<MaintenanceMode><About /></MaintenanceMode>} />
          <Route path="/blog" element={<MaintenanceMode><Blog /></MaintenanceMode>} />
          <Route path="/blog/:id" element={<MaintenanceMode><BlogPost /></MaintenanceMode>} />
          <Route path="/messages" element={<MaintenanceMode><Messages /></MaintenanceMode>} />
          <Route path="/property/:id" element={<MaintenanceMode><PropertyEnhanced /></MaintenanceMode>} />
          <Route path="/city/:cityId" element={<MaintenanceMode><City /></MaintenanceMode>} />
          <Route path="/contact-advisor" element={<MaintenanceMode><ContactAdvisor /></MaintenanceMode>} />
          <Route path="/lawyers" element={<MaintenanceMode><Lawyers /></MaintenanceMode>} />
          <Route path="/legal-process" element={<MaintenanceMode><LegalProcess /></MaintenanceMode>} />
          <Route path="/rental-agreement-template" element={<MaintenanceMode><AgreementTemplate /></MaintenanceMode>} />

          {/* ✅ Payment routes also gated */}
          <Route path="/payment-success" element={<MaintenanceMode><PaymentSuccess /></MaintenanceMode>} />
          <Route path="/payment-cancelled" element={<MaintenanceMode><PaymentCancelled /></MaintenanceMode>} />
          <Route path="/booking/success" element={<MaintenanceMode><BookingSuccess /></MaintenanceMode>} />
          <Route path="/booking/cancel" element={<MaintenanceMode><BookingCancel /></MaintenanceMode>} />

          {/* Auth routes (you may want to allow login/register even in maintenance) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sign-agreement/:agreementId" element={<ProtectedRoute requireAuth><MaintenanceMode><SignAgreement /></MaintenanceMode></ProtectedRoute>} />

          {/* Protected routes */}
          <Route
            path="/publish-property"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <PublishProperty />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-property/:id"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <EditProperty />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <Bookings />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <Profile />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <Wishlist />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/agreements"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <TenantAgreements />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />

          {/* Host onboarding */}
          <Route
            path="/host/onboarding"
            element={
              <ProtectedRoute requireAuth>
                <MaintenanceMode>
                  <HostOnboarding />
                </MaintenanceMode>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <Routes>
                    <Route index element={<MaintenanceMode><AdminDashboard /></MaintenanceMode>} />
                    <Route path="profile" element={<MaintenanceMode><AdminProfile /></MaintenanceMode>} />
                    <Route path="properties" element={<MaintenanceMode><AdminProperties /></MaintenanceMode>} />
                    <Route path="users" element={<MaintenanceMode><AdminUsers /></MaintenanceMode>} />
                    <Route path="superhosts" element={<MaintenanceMode><AdminSuperhost /></MaintenanceMode>} />
                    <Route path="commissions" element={<MaintenanceMode><AdminCommissions /></MaintenanceMode>} />
                    <Route path="users/:userId" element={<MaintenanceMode><Profile /></MaintenanceMode>} />
                    <Route path="messages" element={<MaintenanceMode><AdminMessages /></MaintenanceMode>} />
                    <Route path="blogs" element={<MaintenanceMode><AdminBlogs /></MaintenanceMode>} />
                    <Route path="create-blog" element={<MaintenanceMode><CreateBlog /></MaintenanceMode>} />
                    <Route path="testimonials" element={<MaintenanceMode><AdminTestimonials /></MaintenanceMode>} />
                    <Route path="settings" element={<MaintenanceMode><AdminSettings /></MaintenanceMode>} />
                    <Route path="kyc" element={<MaintenanceMode><AdminKYC /></MaintenanceMode>} />
                    <Route path="lawyers" element={<MaintenanceMode><AdminLawyers /></MaintenanceMode>} />
                    <Route path="lawyer-requests" element={<MaintenanceMode><AdminLawyerRequests /></MaintenanceMode>} />
                    <Route path="document-templates" element={<MaintenanceMode><AdminDocumentTemplates /></MaintenanceMode>} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Host routes */}
          <Route
            path="/host/*"
            element={
              <ProtectedRoute requiredRole="host">
                <HostLayout>
                  <Routes>
                    <Route index element={<MaintenanceMode><HostDashboard /></MaintenanceMode>} />
                    <Route path="bookings" element={<MaintenanceMode><HostBookings /></MaintenanceMode>} />
                    <Route path="calendar" element={<MaintenanceMode><PropertyCalendar /></MaintenanceMode>} />
                    <Route path="listings" element={<MaintenanceMode><HostListings /></MaintenanceMode>} />
                    <Route path="agreements" element={<MaintenanceMode><HostAgreements /></MaintenanceMode>} />
                    <Route path="create-agreement" element={<MaintenanceMode><CreateAgreement /></MaintenanceMode>} />
                    <Route path="messages" element={<MaintenanceMode><HostMessages /></MaintenanceMode>} />
                    <Route path="payouts" element={<MaintenanceMode><HostPayouts /></MaintenanceMode>} />
                    <Route path="kyc" element={<MaintenanceMode><HostKYC /></MaintenanceMode>} />
                  </Routes>
                </HostLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<MaintenanceMode><NotFound /></MaintenanceMode>} />
        </Routes>
        </ErrorBoundary>
      </TooltipProvider>
    </PlatformSettingsProvider>
  </QueryClientProvider>
);

export default App;
