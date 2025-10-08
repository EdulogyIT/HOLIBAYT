import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfilePhotoUpload } from '@/components/ProfilePhotoUpload';
import { toast } from 'sonner';
import { 
  User, 
  BookOpen, 
  Home, 
  LogOut, 
  Settings, 
  Shield, 
  Bell, 
  Monitor, 
  Trash2,
  Camera,
  Save,
  Edit,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';

const Profile = () => {
  const { user, logout, hasRole } = useAuth();
  const { t, currentLang } = useLanguage();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  
  // Form states for various sections
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  const isViewingOtherUser = userId && userId !== user?.id;
  const displayUser = isViewingOtherUser ? viewedUser : user;
  const displayAvatarUrl = isViewingOtherUser ? viewedUser?.avatar_url : (currentAvatarUrl || user?.avatar_url);
  const [userStats, setUserStats] = useState({
    propertiesCount: 0,
    bookingsCount: 0,
  });

  useEffect(() => {
    if (isViewingOtherUser && hasRole('admin')) {
      setLoading(true);
      const fetchUserData = async () => {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!profileError && profileData) {
          setViewedUser(profileData);

          // Fetch properties count
          const { count: propertiesCount } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          // Fetch bookings count
          const { count: bookingsCount } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          setUserStats({
            propertiesCount: propertiesCount || 0,
            bookingsCount: bookingsCount || 0,
          });
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, [userId, isViewingOtherUser, hasRole]);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessions([{
          id: data.session.user.id,
          created_at: data.session.user.created_at,
          user_agent: navigator.userAgent,
          last_sign_in_at: data.session.user.last_sign_in_at,
        }]);
      }
    };
    fetchSessions();
  }, []);

  const translations = {
    en: {
      title: "Profile",
      subtitle: "Manage your details, preferences, and security in one place.",
      userRole: "User",
      hostRole: "Host",
      editProfile: "Edit Profile",
      myBookings: "My Bookings",
      publishProperty: "Publish Property",
      signOut: "Sign out",
      savedProperties: "Saved properties",
      savedSearches: "Saved searches", 
      upcomingBookings: "Upcoming bookings",
      activeListings: "Active listings",
      noBookings: "No bookings yet. Start exploring homes.",
      personalInfo: "Personal Information",
      personalInfoDesc: "Keep your details up to date. Only your name and photo are visible to others.",
      profilePhoto: "Profile photo",
      displayName: "Display name",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      country: "Country",
      wilaya: "Wilaya",
      commune: "Commune",
      street: "Street",
      postalCode: "Postal code",
      language: "Language",
      timezone: "Timezone",
      currency: "Currency",
      save: "Save",
      cancel: "Cancel",
      account: "Account",
      accountDesc: "Manage your Holibayt account settings.",
      changeEmail: "Change email",
      password: "Password",
      passwordDesc: "Choose a strong password you don't use elsewhere.",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmPassword: "Confirm new password",
      changePassword: "Change password",
      notifications: "Notifications",
      notificationsDesc: "Decide how you want to hear from us.",
      privacy: "Privacy",
      privacyDesc: "Control what others can see and how we use your data.",
      sessions: "Sessions & Devices",
      sessionsDesc: "You're signed in on these devices.",
      dangerZone: "Danger Zone",
      dangerDesc: "Permanent actions. Please proceed with caution.",
      deactivateAccount: "Deactivate account",
      deleteAccount: "Delete account",
      hostSettings: "Host Settings",
      hostSettingsDesc: "Fine-tune how guests see you and how you manage requests."
    },
    fr: {
      title: "Profil",
      subtitle: "Gérez vos informations, préférences et sécurité en un seul endroit.",
      userRole: "Utilisateur",
      hostRole: "Hôte",
      editProfile: "Modifier le profil",
      myBookings: "Mes réservations",
      publishProperty: "Publier un bien",
      signOut: "Se déconnecter",
      savedProperties: "Biens enregistrés",
      savedSearches: "Recherches enregistrées",
      upcomingBookings: "Réservations à venir",
      activeListings: "Annonces actives",
      noBookings: "Aucune réservation pour le moment. Commencez à explorer.",
      personalInfo: "Informations personnelles",
      personalInfoDesc: "Gardez vos informations à jour. Seuls votre nom et votre photo sont visibles des autres.",
      profilePhoto: "Photo de profil",
      displayName: "Nom affiché",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      phone: "Téléphone",
      country: "Pays",
      wilaya: "Wilaya",
      commune: "Commune",
      street: "Rue",
      postalCode: "Code postal",
      language: "Langue",
      timezone: "Fuseau horaire",
      currency: "Devise",
      save: "Enregistrer",
      cancel: "Annuler",
      account: "Compte",
      accountDesc: "Gérez les paramètres de votre compte Holibayt.",
      changeEmail: "Changer l'e-mail",
      password: "Mot de passe",
      passwordDesc: "Choisissez un mot de passe robuste que vous n'utilisez nulle part ailleurs.",
      currentPassword: "Mot de passe actuel",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer le nouveau mot de passe",
      changePassword: "Changer le mot de passe",
      notifications: "Notifications",
      notificationsDesc: "Choisissez comment vous souhaitez recevoir nos messages.",
      privacy: "Confidentialité",
      privacyDesc: "Contrôlez ce que les autres voient et comment nous utilisons vos données.",
      sessions: "Sessions et appareils",
      sessionsDesc: "Vous êtes connecté sur ces appareils.",
      dangerZone: "Zone de danger",
      dangerDesc: "Actions irréversibles. Procédez avec prudence.",
      deactivateAccount: "Désactiver le compte",
      deleteAccount: "Supprimer le compte",
      hostSettings: "Paramètres hôte",
      hostSettingsDesc: "Ajustez la façon dont les voyageurs vous voient et la gestion des demandes."
    },
    ar: {
      title: "الملف الشخصي",
      subtitle: "أدِر بياناتك وتفضيلاتك وأمانك في مكان واحد.",
      userRole: "مستخدم",
      hostRole: "مضيف",
      editProfile: "تعديل الملف",
      myBookings: "حجوزاتي",
      publishProperty: "نشر عقار",
      signOut: "تسجيل الخروج",
      savedProperties: "العقارات المحفوظة",
      savedSearches: "عمليات البحث المحفوظة",
      upcomingBookings: "الحجوزات القادمة",
      activeListings: "الإعلانات النشطة",
      noBookings: "لا توجد حجوزات بعد. ابدأ في الاستكشاف.",
      personalInfo: "المعلومات الشخصية",
      personalInfoDesc: "حدِّث معلوماتك باستمرار. لا يظهر للآخرين سوى اسمك وصورتك.",
      profilePhoto: "صورة الملف",
      displayName: "الاسم المعروض",
      firstName: "الاسم الأول",
      lastName: "اسم العائلة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      country: "الدولة",
      wilaya: "الولاية",
      commune: "البلدية",
      street: "الشارع",
      postalCode: "الرمز البريدي",
      language: "اللغة",
      timezone: "المنطقة الزمنية",
      currency: "العملة",
      save: "حفظ",
      cancel: "إلغاء",
      account: "الحساب",
      accountDesc: "إدارة إعدادات حسابك في هوليبَيت.",
      changeEmail: "تغيير البريد الإلكتروني",
      password: "كلمة المرور",
      passwordDesc: "اختر كلمة مرور قوية وغير مُستخدمة في مواقع أخرى.",
      currentPassword: "كلمة المرور الحالية",
      newPassword: "كلمة المرور الجديدة",
      confirmPassword: "تأكيد كلمة المرور الجديدة",
      changePassword: "تغيير كلمة المرور",
      notifications: "الإشعارات",
      notificationsDesc: "اختر طريقة تلقي الإشعارات.",
      privacy: "الخصوصية",
      privacyDesc: "تحكّم بما يراه الآخرون وكيفية استخدام بياناتك.",
      sessions: "الجلسات والأجهزة",
      sessionsDesc: "أنت مسجّل الدخول على هذه الأجهزة.",
      dangerZone: "منطقة الخطر",
      dangerDesc: "إجراءات دائمة. يرجى المتابعة بحذر.",
      deactivateAccount: "إيقاف تنشيط الحساب",
      deleteAccount: "حذف الحساب",
      hostSettings: "إعدادات المضيف",
      hostSettingsDesc: "خصّص كيف يراك الضيوف وكيف تدير الطلبات."
    }
  };

  const currentTranslations = translations[currentLang.toLowerCase()] || translations.en;

  const handleSave = () => {
    toast.success(currentLang === 'AR' ? 'تم تحديث الملف.' : currentLang === 'FR' ? 'Profil mis à jour.' : 'Profile updated.');
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success(currentLang === 'AR' ? 'تم تسجيل الخروج.' : currentLang === 'FR' ? 'Déconnecté avec succès.' : 'Successfully logged out.');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast.error('Failed to update password: ' + error.message);
    } else {
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleChangeEmail = () => {
    toast.info('Email change functionality coming soon!');
  };

  const handleDeactivateAccount = () => {
    toast.info('Account deactivation functionality coming soon!');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is permanent. Contact support if you want to proceed.');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved!');
  };

  const handleSavePrivacy = () => {
    toast.success('Privacy settings saved!');
  };

  if (!user || (isViewingOtherUser && loading)) {
    return <div>Loading...</div>;
  }

  if (isViewingOtherUser && !displayUser) {
    return <div>User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-accent/10 animate-fade-in">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-8 animate-scale-in">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 p-6 sm:p-8 rounded-2xl bg-gradient-primary shadow-elegant overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-24 -mb-24"></div>
            
            <div className="relative group z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full blur-lg opacity-75"></div>
              <Avatar className="relative h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white/20 shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                {displayAvatarUrl && <AvatarImage src={displayAvatarUrl} alt={displayUser?.name || displayUser?.email} />}
                <AvatarFallback className="text-2xl sm:text-3xl bg-white/20 text-white backdrop-blur-sm">
                  {(displayUser?.name || displayUser?.email || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 min-w-0 relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 break-words">{currentTranslations.title}</h1>
              <p className="text-white/80 text-base sm:text-lg mb-3 break-words">{currentTranslations.subtitle}</p>
              <div className="flex gap-2 flex-wrap">
                {displayUser?.is_superhost && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-900 font-bold hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 transition-all shadow-lg shadow-yellow-500/50 border-2 border-yellow-300"
                  >
                    <span className="flex items-center gap-1">
                      ⭐ Superhost
                    </span>
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 transition-all">
                  {hasRole('host') ? currentTranslations.hostRole : currentTranslations.userRole}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {!isViewingOtherUser && (
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="hover-scale bg-white/50 backdrop-blur-sm border-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                {currentTranslations.editProfile}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/bookings')}
                className="hover-scale bg-white/50 backdrop-blur-sm border-white/20"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {currentTranslations.myBookings}
              </Button>
              {hasRole('host') && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/publish-property')}
                  className="hover-scale bg-white/50 backdrop-blur-sm border-white/20"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {currentTranslations.publishProperty}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="hover-scale bg-white/50 backdrop-blur-sm border-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {currentTranslations.signOut}
              </Button>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        {isViewingOtherUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover-scale bg-gradient-to-br from-card to-accent/10 border-accent/20 shadow-elegant">
              <CardContent className="p-6">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{userStats.propertiesCount}</div>
                <div className="text-sm text-muted-foreground font-medium">Properties</div>
              </CardContent>
            </Card>
            <Card className="hover-scale bg-gradient-to-br from-card to-accent/10 border-accent/20 shadow-elegant">
              <CardContent className="p-6">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{userStats.bookingsCount}</div>
                <div className="text-sm text-muted-foreground font-medium">Bookings</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="personal" className="space-y-8 animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/80 backdrop-blur-sm shadow-elegant">
            <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.personalInfo}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.account}</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.password}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.notifications}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.privacy}</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white transition-all">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.sessions}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.personalInfo}</CardTitle>
                <CardDescription>{currentTranslations.personalInfoDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Profile Photo Upload */}
                {!isViewingOtherUser && (
                  <div className="flex justify-center pb-6 border-b border-accent/20">
                    <ProfilePhotoUpload 
                      currentPhotoUrl={displayAvatarUrl}
                      userName={displayUser?.name || displayUser?.email || 'User'}
                      onPhotoUpdate={(url) => {
                        // Update local avatar state to show new photo immediately
                        setCurrentAvatarUrl(url);
                      }}
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-primary font-medium">{currentTranslations.displayName}</Label>
                    <Input 
                      id="displayName" 
                      defaultValue={displayUser?.name || ''} 
                      disabled={!isEditing || isViewingOtherUser} 
                      readOnly={!isEditing || isViewingOtherUser}
                      className="border-accent/30 focus:border-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-primary font-medium">{currentTranslations.email}</Label>
                    <Input id="email" defaultValue={displayUser?.email || ''} disabled className="border-accent/30 bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-primary font-medium">{currentTranslations.phone}</Label>
                    <Input 
                      id="phone" 
                      placeholder="+213 555 123 456" 
                      disabled={!isEditing || isViewingOtherUser}
                      readOnly={!isEditing || isViewingOtherUser}
                      className="border-accent/30 focus:border-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-primary font-medium">{currentTranslations.country}</Label>
                    <Select disabled={!isEditing || isViewingOtherUser}>
                      <SelectTrigger className="border-accent/30 focus:border-primary transition-colors">
                        <SelectValue placeholder="Algeria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="algeria">Algeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {isEditing && !isViewingOtherUser && (
                  <div className="flex gap-4">
                    <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 transition-all shadow-lg">
                      <Save className="h-4 w-4 mr-2" />
                      {currentTranslations.save}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="border-accent/30 hover:bg-accent/10">
                      {currentTranslations.cancel}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.account}</CardTitle>
                <CardDescription>{currentTranslations.accountDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-foreground">{currentTranslations.changeEmail}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleChangeEmail}
                    className="border-primary/30 text-primary hover:bg-primary/10"
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone - Only in Account Section */}
            <Card className="border-destructive/20 bg-gradient-to-br from-card to-destructive/5 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-destructive/10 to-destructive/5 rounded-t-lg">
                <CardTitle className="text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  {currentTranslations.dangerZone}
                </CardTitle>
                <CardDescription>{currentTranslations.dangerDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-gradient-to-r from-white/50 to-destructive/5">
                  <div>
                    <div className="font-medium text-foreground">{currentTranslations.deactivateAccount}</div>
                    <div className="text-sm text-muted-foreground">Temporarily disable your account</div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeactivateAccount}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    {currentTranslations.deactivateAccount}
                  </Button>
                </div>
                <Separator className="bg-destructive/20" />
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-xl bg-gradient-to-r from-white/50 to-destructive/5">
                  <div>
                    <div className="font-medium text-foreground">{currentTranslations.deleteAccount}</div>
                    <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteAccount}
                    className="shadow-md hover:shadow-lg transition-all"
                  >
                    {currentTranslations.deleteAccount}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password */}
          <TabsContent value="password" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.password}</CardTitle>
                <CardDescription>{currentTranslations.passwordDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-primary font-medium">{currentTranslations.currentPassword}</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border-accent/30 focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-primary font-medium">{currentTranslations.newPassword}</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border-accent/30 focus:border-primary transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-primary font-medium">{currentTranslations.confirmPassword}</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-accent/30 focus:border-primary transition-colors" 
                  />
                </div>
                <Button 
                  onClick={handleChangePassword}
                  className="bg-gradient-primary hover:opacity-90 transition-all shadow-lg"
                >
                  {currentTranslations.changePassword}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.notifications}</CardTitle>
                <CardDescription>{currentTranslations.notificationsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5">
                  <div>
                    <div className="font-medium text-foreground">Email notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-gradient-primary" 
                  />
                </div>
                <Separator className="bg-accent/20" />
                <div className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5">
                  <div>
                    <div className="font-medium text-foreground">SMS notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via SMS</div>
                  </div>
                  <Switch 
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    className="data-[state=checked]:bg-gradient-primary" 
                  />
                </div>
                <Button 
                  onClick={handleSaveNotifications}
                  className="bg-gradient-primary hover:opacity-90 transition-all shadow-lg mt-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {currentTranslations.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.privacy}</CardTitle>
                <CardDescription>{currentTranslations.privacyDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5">
                  <div>
                    <div className="font-medium text-foreground">Show profile photo</div>
                    <div className="text-sm text-muted-foreground">Let others see your profile picture</div>
                  </div>
                  <Switch 
                    checked={showProfilePhoto}
                    onCheckedChange={setShowProfilePhoto}
                    className="data-[state=checked]:bg-gradient-primary" 
                  />
                </div>
                <Separator className="bg-accent/20" />
                <div className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5">
                  <div>
                    <div className="font-medium text-foreground">Analytics & personalization</div>
                    <div className="text-sm text-muted-foreground">Help us improve your experience</div>
                  </div>
                  <Switch 
                    checked={analytics}
                    onCheckedChange={setAnalytics}
                    className="data-[state=checked]:bg-gradient-primary" 
                  />
                </div>
                <Button 
                  onClick={handleSavePrivacy}
                  className="bg-gradient-primary hover:opacity-90 transition-all shadow-lg mt-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {currentTranslations.save}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions & Devices */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="bg-gradient-to-br from-card to-accent/5 border-accent/20 shadow-elegant">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-t-lg">
                <CardTitle className="text-primary">{currentTranslations.sessions}</CardTitle>
                <CardDescription>{currentTranslations.sessionsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sessions.length > 0 ? (
                    sessions.map((session) => {
                      const getBrowserAndOS = (userAgent: string) => {
                        let browser = 'Browser';
                        let os = 'Unknown OS';
                        
                        if (userAgent.includes('Chrome')) browser = 'Chrome';
                        else if (userAgent.includes('Firefox')) browser = 'Firefox';
                        else if (userAgent.includes('Safari')) browser = 'Safari';
                        else if (userAgent.includes('Edge')) browser = 'Edge';
                        
                        if (userAgent.includes('Windows')) os = 'Windows';
                        else if (userAgent.includes('Mac')) os = 'macOS';
                        else if (userAgent.includes('Linux')) os = 'Linux';
                        else if (userAgent.includes('Android')) os = 'Android';
                        else if (userAgent.includes('iOS')) os = 'iOS';
                        
                        return `${browser} on ${os}`;
                      };

                      const getLastActive = (lastSignIn: string) => {
                        const now = new Date();
                        const signInDate = new Date(lastSignIn);
                        const diffMs = now.getTime() - signInDate.getTime();
                        const diffMins = Math.floor(diffMs / 60000);
                        
                        if (diffMins < 1) return 'Active now';
                        if (diffMins < 60) return `${diffMins} minutes ago`;
                        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
                        return `${Math.floor(diffMins / 1440)} days ago`;
                      };

                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 border border-accent/20 rounded-xl bg-gradient-to-r from-white/50 to-accent/5 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <Monitor className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium text-foreground">Current session</div>
                              <div className="text-sm text-muted-foreground">
                                {getBrowserAndOS(session.user_agent)} • {getLastActive(session.last_sign_in_at)}
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Current</Badge>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-muted-foreground py-8">No active sessions</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;