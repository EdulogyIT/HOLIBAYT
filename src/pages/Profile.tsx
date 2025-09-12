import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [isEditing, setIsEditing] = useState(false);

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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{currentTranslations.title}</h1>
              <p className="text-muted-foreground">{currentTranslations.subtitle}</p>
              <Badge variant="secondary" className="mt-2">
                {hasRole('host') ? currentTranslations.hostRole : currentTranslations.userRole}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {currentTranslations.editProfile}
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              {currentTranslations.myBookings}
            </Button>
            {hasRole('host') && (
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                {currentTranslations.publishProperty}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {currentTranslations.signOut}
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">{currentTranslations.savedProperties}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">{currentTranslations.savedSearches}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">2</div>
              <div className="text-sm text-muted-foreground">{currentTranslations.upcomingBookings}</div>
            </CardContent>
          </Card>
          {hasRole('host') && (
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">5</div>
                <div className="text-sm text-muted-foreground">{currentTranslations.activeListings}</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.personalInfo}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.account}</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.password}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.notifications}</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.privacy}</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">{currentTranslations.sessions}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.personalInfo}</CardTitle>
                <CardDescription>{currentTranslations.personalInfoDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">{currentTranslations.displayName}</Label>
                    <Input id="displayName" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{currentTranslations.email}</Label>
                    <Input id="email" defaultValue={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{currentTranslations.phone}</Label>
                    <Input id="phone" placeholder="+213 555 123 456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">{currentTranslations.country}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Algeria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="algeria">Algeria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    {currentTranslations.save}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {currentTranslations.cancel}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.account}</CardTitle>
                <CardDescription>{currentTranslations.accountDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{currentTranslations.changeEmail}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password */}
          <TabsContent value="password" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.password}</CardTitle>
                <CardDescription>{currentTranslations.passwordDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{currentTranslations.currentPassword}</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{currentTranslations.newPassword}</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{currentTranslations.confirmPassword}</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>{currentTranslations.changePassword}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.notifications}</CardTitle>
                <CardDescription>{currentTranslations.notificationsDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">SMS notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via SMS</div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.privacy}</CardTitle>
                <CardDescription>{currentTranslations.privacyDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Show profile photo</div>
                    <div className="text-sm text-muted-foreground">Let others see your profile picture</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Analytics & personalization</div>
                    <div className="text-sm text-muted-foreground">Help us improve your experience</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions & Devices */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentTranslations.sessions}</CardTitle>
                <CardDescription>{currentTranslations.sessionsDesc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Current session</div>
                        <div className="text-sm text-muted-foreground">Chrome on Windows • Active now</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Current</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {currentTranslations.dangerZone}
            </CardTitle>
            <CardDescription>{currentTranslations.dangerDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{currentTranslations.deactivateAccount}</div>
                <div className="text-sm text-muted-foreground">Temporarily disable your account</div>
              </div>
              <Button variant="destructive" size="sm">
                {currentTranslations.deactivateAccount}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{currentTranslations.deleteAccount}</div>
                <div className="text-sm text-muted-foreground">Permanently delete your account and data</div>
              </div>
              <Button variant="destructive" size="sm">
                {currentTranslations.deleteAccount}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;