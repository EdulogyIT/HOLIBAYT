import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Clock, 
  Shield, 
  Activity,
  Monitor,
  Smartphone,
  AlertTriangle,
  Eye,
  ExternalLink,
  Save,
  X
} from 'lucide-react';

// Admin Profile i18n strings
const adminProfileStrings = {
  en: {
    title: "My Profile (Admin)",
    breadcrumb: "Admin › My Profile",
    identity: {
      title: "Identity",
      subtitle: "Your details are used in audit logs and support replies.",
      staffId: "Staff ID",
      role: "Role",
      displayName: "Display Name"
    },
    contact: {
      title: "Contact Information",
      subtitle: "We use these for critical notices and password resets.",
      primaryEmail: "Primary Work Email",
      backupEmail: "Backup Email (Optional)",
      phone: "Phone (Optional)"
    },
    locale: {
      title: "Locale & Preferences",
      language: "Language",
      timezone: "Timezone", 
      theme: "Theme",
      dateFormat: "Date format preview",
      numberFormat: "Number format preview"
    },
    password: {
      title: "Password",
      subtitle: "At least 8 characters; mix letters and numbers.",
      current: "Current Password",
      new: "New Password",
      confirm: "Confirm New Password",
      changeBtn: "Change Password"
    },
    sessions: {
      title: "Sessions & Devices",
      subtitle: "You're signed in on these devices.",
      device: "Device",
      browser: "Browser",
      ip: "IP Address",
      location: "Location",
      lastSeen: "Last Seen",
      actions: "Actions",
      revoke: "Revoke",
      revokeAll: "Sign out of all other sessions"
    },
    rolePermissions: {
      title: "Role & Permissions",
      subtitle: "Role changes require a Super Admin.",
      permissions: "Can manage listings, view user profiles; cannot change roles."
    },
    signature: {
      title: "Signature / Attribution",
      subtitle: "Used in support replies and moderation notes.",
      publicName: "Public Name",
      footerText: "Footer Text (Optional)",
      preview: "Preview"
    },
    activity: {
      title: "Activity Glance",
      subtitle: "Last 10 actions from audit log",
      viewFull: "View full audit log"
    },
    danger: {
      title: "Danger Zone",
      subtitle: "Permanent actions. Please proceed with caution.",
      deactivate: "Deactivate Account",
      deactivateDesc: "Temporarily disables access; another Super Admin can re-enable.",
      delete: "Delete Account",
      deleteDisabled: "Contact a Super Admin to request deletion.",
      confirmDeactivate: "Are you sure you want to deactivate your account?",
      reason: "Reason for deactivation"
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
      edit: "Edit"
    },
    toasts: {
      saved: "Settings saved successfully",
      passwordUpdated: "Password updated",
      sessionRevoked: "Session revoked",
      allSessionsRevoked: "All other sessions signed out",
      accountDeactivated: "Your account is now deactivated",
      incorrectPassword: "Current password is incorrect",
      passwordMismatch: "Passwords don't match",
      validationError: "Please complete required fields"
    }
  },
  fr: {
    title: "Mon profil (Admin)",
    breadcrumb: "Admin › Mon profil",
    identity: {
      title: "Identité",
      subtitle: "Vos informations sont utilisées dans les journaux d'audit et les réponses de support.",
      staffId: "ID Personnel",
      role: "Rôle",
      displayName: "Nom affiché"
    },
    contact: {
      title: "Informations de contact",
      subtitle: "Nous les utilisons pour les avis critiques et la réinitialisation des mots de passe.",
      primaryEmail: "E-mail de travail principal",
      backupEmail: "E-mail de sauvegarde (Optionnel)",
      phone: "Téléphone (Optionnel)"
    },
    locale: {
      title: "Localisation et préférences",
      language: "Langue",
      timezone: "Fuseau horaire",
      theme: "Thème",
      dateFormat: "Aperçu du format de date",
      numberFormat: "Aperçu du format de nombre"
    },
    password: {
      title: "Mot de passe",
      subtitle: "Au moins 8 caractères ; mélangez lettres et chiffres.",
      current: "Mot de passe actuel",
      new: "Nouveau mot de passe",
      confirm: "Confirmer le nouveau mot de passe",
      changeBtn: "Changer le mot de passe"
    },
    sessions: {
      title: "Sessions et appareils",
      subtitle: "Vous êtes connecté sur ces appareils.",
      device: "Appareil",
      browser: "Navigateur",
      ip: "Adresse IP",
      location: "Lieu",
      lastSeen: "Dernière activité",
      actions: "Actions",
      revoke: "Révoquer",
      revokeAll: "Se déconnecter des autres sessions"
    },
    rolePermissions: {
      title: "Rôle et permissions",
      subtitle: "Les changements de rôle nécessitent un Super Admin.",
      permissions: "Peut gérer les annonces, voir les profils utilisateurs ; ne peut pas changer les rôles."
    },
    signature: {
      title: "Signature / Attribution",
      subtitle: "Utilisée dans les réponses de support et les notes de modération.",
      publicName: "Nom public",
      footerText: "Texte de pied de page (Optionnel)",
      preview: "Aperçu"
    },
    activity: {
      title: "Aperçu de l'activité",
      subtitle: "10 dernières actions du journal d'audit",
      viewFull: "Voir le journal d'audit complet"
    },
    danger: {
      title: "Zone de danger",
      subtitle: "Actions permanentes. Procédez avec prudence.",
      deactivate: "Désactiver le compte",
      deactivateDesc: "Désactive temporairement l'accès ; un autre Super Admin peut le réactiver.",
      delete: "Supprimer le compte",
      deleteDisabled: "Contactez un Super Admin pour demander la suppression.",
      confirmDeactivate: "Êtes-vous sûr de vouloir désactiver votre compte ?",
      reason: "Raison de la désactivation"
    },
    buttons: {
      save: "Enregistrer",
      cancel: "Annuler",
      edit: "Modifier"
    },
    toasts: {
      saved: "Paramètres enregistrés avec succès",
      passwordUpdated: "Mot de passe mis à jour",
      sessionRevoked: "Session révoquée",
      allSessionsRevoked: "Se déconnecter de toutes les autres sessions",
      accountDeactivated: "Votre compte est maintenant désactivé",
      incorrectPassword: "Le mot de passe actuel est incorrect",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      validationError: "Veuillez compléter les champs obligatoires"
    }
  },
  ar: {
    title: "ملفي الشخصي (مسؤول)",
    breadcrumb: "مسؤول › ملفي الشخصي",
    identity: {
      title: "الهوية",
      subtitle: "تُستخدم تفاصيلك في سجلات التدقيق وردود الدعم.",
      staffId: "معرف الموظف",
      role: "الدور",
      displayName: "الاسم المعروض"
    },
    contact: {
      title: "معلومات الاتصال",
      subtitle: "نستخدم هذه للإشعارات الهامة وإعادة تعيين كلمات المرور.",
      primaryEmail: "البريد الإلكتروني الأساسي للعمل",
      backupEmail: "البريد الإلكتروني الاحتياطي (اختياري)",
      phone: "الهاتف (اختياري)"
    },
    locale: {
      title: "الموقع والتفضيلات",
      language: "اللغة",
      timezone: "المنطقة الزمنية",
      theme: "السمة",
      dateFormat: "معاينة تنسيق التاريخ",
      numberFormat: "معاينة تنسيق الرقم"
    },
    password: {
      title: "كلمة المرور",
      subtitle: "8 أحرف على الأقل؛ امزج الحروف والأرقام.",
      current: "كلمة المرور الحالية",
      new: "كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور الجديدة",
      changeBtn: "تغيير كلمة المرور"
    },
    sessions: {
      title: "الجلسات والأجهزة",
      subtitle: "أنت مسجّل الدخول على هذه الأجهزة.",
      device: "الجهاز",
      browser: "المتصفح",
      ip: "عنوان IP",
      location: "الموقع",
      lastSeen: "آخر نشاط",
      actions: "الإجراءات",
      revoke: "إنهاء",
      revokeAll: "تسجيل الخروج من جميع الجلسات الأخرى"
    },
    rolePermissions: {
      title: "الدور والصلاحيات",
      subtitle: "تغيير الأدوار يتطلب مسؤول عام.",
      permissions: "يمكنه إدارة القوائم وعرض ملفات المستخدمين؛ لا يمكن تغيير الأدوار."
    },
    signature: {
      title: "التوقيع / الإسناد",
      subtitle: "تُستخدم في ردود الدعم وملاحظات الإشراف.",
      publicName: "الاسم العام",
      footerText: "نص التذييل (اختياري)",
      preview: "معاينة"
    },
    activity: {
      title: "لمحة النشاط",
      subtitle: "آخر 10 إجراءات من سجل التدقيق",
      viewFull: "عرض سجل التدقيق الكامل"
    },
    danger: {
      title: "منطقة الخطر",
      subtitle: "إجراءات دائمة. يرجى المتابعة بحذر.",
      deactivate: "إيقاف تنشيط الحساب",
      deactivateDesc: "يُوقف الوصول مؤقتًا؛ يمكن لمسؤول عام آخر إعادة التفعيل.",
      delete: "حذف الحساب",
      deleteDisabled: "اتصل بمسؤول عام لطلب الحذف.",
      confirmDeactivate: "هل أنت متأكد من أنك تريد إيقاف تنشيط حسابك؟",
      reason: "سبب إيقاف التنشيط"
    },
    buttons: {
      save: "حفظ",
      cancel: "إلغاء",
      edit: "تعديل"
    },
    toasts: {
      saved: "تم حفظ الإعدادات بنجاح",
      passwordUpdated: "تم تحديث كلمة المرور",
      sessionRevoked: "تم إنهاء الجلسة",
      allSessionsRevoked: "تم تسجيل الخروج من جميع الجلسات الأخرى",
      accountDeactivated: "تم إيقاف تنشيط حسابك الآن",
      incorrectPassword: "كلمة المرور الحالية غير صحيحة",
      passwordMismatch: "كلمات المرور غير متطابقة",
      validationError: "يرجى إكمال الحقول المطلوبة"
    }
  }
};

// Mock admin user data
const mockAdminData = {
  staffId: "ADM-2024-001",
  role: "Admin",
  displayName: "Sarah Admin",
  avatarUrl: "",
  emails: {
    primary: "sarah.admin@holibayt.com",
    backup: "sarah.backup@holibayt.com"
  },
  phone: "+213 555 0123",
  locale: {
    language: "en",
    timezone: "Africa/Algiers",
    theme: "system"
  },
  signature: {
    publicName: "Sarah from Holibayt Support",
    footerText: "Have a great day!"
  },
  permissions: ["manage_listings", "view_users", "moderate_content"],
  sessions: [
    {
      id: "current",
      device: "MacBook Pro",
      browser: "Chrome 120",
      ip: "192.168.1.100",
      location: "Algiers, Algeria",
      lastSeen: "Active now",
      isCurrent: true
    },
    {
      id: "mobile",
      device: "iPhone 15",
      browser: "Safari Mobile",
      ip: "192.168.1.101", 
      location: "Algiers, Algeria",
      lastSeen: "2 hours ago",
      isCurrent: false
    }
  ],
  recentActions: [
    { action: "Unpublished listing #1234", time: "10:21 AM" },
    { action: "Approved user profile update", time: "09:45 AM" },
    { action: "Responded to support ticket #5678", time: "09:30 AM" },
    { action: "Updated property listing #9012", time: "08:15 AM" },
    { action: "Moderated user review", time: "Yesterday, 4:30 PM" }
  ]
};

export default function AdminProfile() {
  const { user } = useAuth();
  const { currentLang } = useLanguage();
  const t = adminProfileStrings[currentLang.toLowerCase() as keyof typeof adminProfileStrings];
  
  // Form states
  const [contactForm, setContactForm] = useState({
    primaryEmail: mockAdminData.emails.primary,
    backupEmail: mockAdminData.emails.backup,
    phone: mockAdminData.phone
  });
  
  const [localeForm, setLocaleForm] = useState(mockAdminData.locale);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  
  const [signatureForm, setSignatureForm] = useState(mockAdminData.signature);
  const [deactivateReason, setDeactivateReason] = useState("");

  // Edit states
  const [editingContact, setEditingContact] = useState(false);
  const [editingLocale, setEditingLocale] = useState(false);
  const [editingSignature, setEditingSignature] = useState(false);

  // Handlers
  const handleContactSave = () => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.saved });
      setEditingContact(false);
    }, 500);
  };

  const handleLocaleSave = () => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.saved });
      setEditingLocale(false);
    }, 500);
  };

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: t.toasts.passwordMismatch, variant: "destructive" });
      return;
    }
    if (passwordForm.current !== "password") {
      toast({ title: t.toasts.incorrectPassword, variant: "destructive" });
      return;
    }
    
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.passwordUpdated });
      setPasswordForm({ current: "", new: "", confirm: "" });
    }, 500);
  };

  const handleSignatureSave = () => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.saved });
      setEditingSignature(false);
    }, 500);
  };

  const handleSessionRevoke = (sessionId: string) => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.sessionRevoked });
    }, 500);
  };

  const handleRevokeAllSessions = () => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.allSessionsRevoked });
    }, 500);
  };

  const handleDeactivateAccount = () => {
    // Mock API call
    setTimeout(() => {
      toast({ title: t.toasts.accountDeactivated });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">{t.breadcrumb}</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {t.title}
          </h1>
        </div>

        {/* Identity Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={mockAdminData.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-lg">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-semibold">{mockAdminData.displayName}</h2>
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    <Shield className="w-3 h-3 mr-1" />
                    {mockAdminData.role}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {t.identity.staffId}: {mockAdminData.staffId}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t.identity.subtitle}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact Information */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{t.contact.title}</CardTitle>
                </div>
                {!editingContact ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingContact(true)}
                    className="hover:bg-primary/10"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">{t.contact.subtitle}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingContact ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="primary-email">{t.contact.primaryEmail}</Label>
                    <Input
                      id="primary-email"
                      value={contactForm.primaryEmail}
                      onChange={(e) => setContactForm({...contactForm, primaryEmail: e.target.value})}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup-email">{t.contact.backupEmail}</Label>
                    <Input
                      id="backup-email"
                      value={contactForm.backupEmail}
                      onChange={(e) => setContactForm({...contactForm, backupEmail: e.target.value})}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.contact.phone}</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleContactSave} className="bg-gradient-to-r from-primary to-primary/80">
                      <Save className="w-4 h-4 mr-2" />
                      {t.buttons.save}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingContact(false)}
                      className="border-primary/30 hover:bg-primary/5"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.buttons.cancel}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.contact.primaryEmail}</Label>
                    <p className="font-medium">{contactForm.primaryEmail}</p>
                  </div>
                  {contactForm.backupEmail && (
                    <div>
                      <Label className="text-xs text-muted-foreground">{t.contact.backupEmail}</Label>
                      <p className="font-medium">{contactForm.backupEmail}</p>
                    </div>
                  )}
                  {contactForm.phone && (
                    <div>
                      <Label className="text-xs text-muted-foreground">{t.contact.phone}</Label>
                      <p className="font-medium">{contactForm.phone}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locale & Preferences */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{t.locale.title}</CardTitle>
                </div>
                {!editingLocale ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLocale(true)}
                    className="hover:bg-primary/10"
                  >
                    <User className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingLocale ? (
                <>
                  <div className="space-y-2">
                    <Label>{t.locale.language}</Label>
                    <Select value={localeForm.language} onValueChange={(value) => setLocaleForm({...localeForm, language: value})}>
                      <SelectTrigger className="border-primary/20 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t.locale.timezone}</Label>
                    <Select value={localeForm.timezone} onValueChange={(value) => setLocaleForm({...localeForm, timezone: value})}>
                      <SelectTrigger className="border-primary/20 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Algiers">Africa/Algiers (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                        <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleLocaleSave} className="bg-gradient-to-r from-primary to-primary/80">
                      <Save className="w-4 h-4 mr-2" />
                      {t.buttons.save}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingLocale(false)}
                      className="border-primary/30 hover:bg-primary/5"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.buttons.cancel}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.locale.language}</Label>
                    <p className="font-medium capitalize">{localeForm.language}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">{t.locale.timezone}</Label>
                    <p className="font-medium">{localeForm.timezone}</p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{t.locale.dateFormat}: {new Date().toLocaleDateString()}</p>
                    <p>{t.locale.numberFormat}: {(1234.56).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Password */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">{t.password.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{t.password.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t.password.current}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.password.new}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.password.confirm}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="border-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button 
                onClick={handlePasswordChange}
                disabled={!passwordForm.current || !passwordForm.new || !passwordForm.confirm}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {t.password.changeBtn}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sessions & Devices */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t.sessions.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{t.sessions.subtitle}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAdminData.sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-primary/10">
                    <div className="flex items-center gap-3">
                      {session.device.includes('iPhone') ? (
                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Monitor className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{session.device}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.browser} • {session.ip} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">{session.lastSeen}</p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSessionRevoke(session.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {t.sessions.revoke}
                      </Button>
                    )}
                    {session.isCurrent && (
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                        Current
                      </Badge>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleRevokeAllSessions}
                  className="w-full border-primary/30 hover:bg-primary/5"
                >
                  {t.sessions.revokeAll}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Role & Permissions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t.rolePermissions.title}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">{t.rolePermissions.subtitle}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/20 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 border-primary/30">
                      {mockAdminData.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.rolePermissions.permissions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signature / Attribution */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t.signature.title}</CardTitle>
              </div>
              {!editingSignature ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSignature(true)}
                  className="hover:bg-primary/10"
                >
                  <User className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{t.signature.subtitle}</p>
          </CardHeader>
          <CardContent>
            {editingSignature ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="public-name">{t.signature.publicName}</Label>
                  <Input
                    id="public-name"
                    value={signatureForm.publicName}
                    onChange={(e) => setSignatureForm({...signatureForm, publicName: e.target.value})}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-text">{t.signature.footerText}</Label>
                  <Textarea
                    id="footer-text"
                    value={signatureForm.footerText}
                    onChange={(e) => setSignatureForm({...signatureForm, footerText: e.target.value})}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSignatureSave} className="bg-gradient-to-r from-primary to-primary/80">
                    <Save className="w-4 h-4 mr-2" />
                    {t.buttons.save}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingSignature(false)}
                    className="border-primary/30 hover:bg-primary/5"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t.buttons.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/20 border border-primary/10">
                  <h4 className="font-medium text-sm mb-2">{t.signature.preview}</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{signatureForm.publicName}</p>
                    {signatureForm.footerText && (
                      <p className="text-muted-foreground">{signatureForm.footerText}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Glance */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t.activity.title}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.activity.viewFull}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{t.activity.subtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAdminData.recentActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/20 border border-primary/10">
                  <p className="text-sm">{action.action}</p>
                  <p className="text-xs text-muted-foreground">{action.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">{t.danger.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{t.danger.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <h4 className="font-medium text-destructive">{t.danger.deactivate}</h4>
                <p className="text-sm text-muted-foreground">{t.danger.deactivateDesc}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                    {t.danger.deactivate}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.danger.confirmDeactivate}</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p>{t.danger.deactivateDesc}</p>
                      <div className="space-y-2">
                        <Label htmlFor="deactivate-reason">{t.danger.reason}</Label>
                        <Textarea
                          id="deactivate-reason"
                          value={deactivateReason}
                          onChange={(e) => setDeactivateReason(e.target.value)}
                          placeholder="Optional reason for deactivation..."
                          className="border-primary/20 focus:border-primary"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.buttons.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeactivateAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {t.danger.deactivate}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-muted bg-muted/20">
              <div>
                <h4 className="font-medium text-muted-foreground">{t.danger.delete}</h4>
                <p className="text-sm text-muted-foreground">{t.danger.deleteDisabled}</p>
              </div>
              <Button disabled variant="outline">
                {t.danger.delete}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}