import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

type Language = 'FR' | 'EN' | 'AR';

interface LanguageContextType {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  t: (key: string) => string | any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const allTranslations = {
  FR: {
    // Navigation
    home: 'Accueil',
    buy: 'Acheter',
    rent: 'Louer',
    shortStay: 'Court séjour',
    findDreamProperty: 'Trouvez la Propriété de Vos Rêves',
    buyHeroDescription: "Découvrez des propriétés exceptionnelles à vendre à travers l'Algérie avec nos conseils d'experts.",
    findPerfectRental: 'Trouvez Votre Location Parfaite',
    rentHeroDescription: 'Explorez des propriétés locatives de qualité qui correspondent à votre style de vie et budget.',
    findPerfectStay: 'Trouvez Votre Séjour Parfait',
    shortStayHeroDescription: "Réservez des hébergements uniques pour des séjours courts mémorables à travers l'Algérie.",
    about: 'À propos',
    blog: 'Blog',
    login: 'Se connecter',
    publishProperty: 'Publier une annonce',
    myProfile: 'Mon profil',
    myBookings: 'Mes réservations',
    wishlist: 'Liste de souhaits',
    myWishlist: 'Ma liste de souhaits',
    wishlistEmpty: 'Votre liste de souhaits est vide',
    startBrowsing: 'Commencez à parcourir les propriétés et ajoutez vos favoris',
    browseProperties: 'Parcourir les propriétés',
    loginToViewWishlist: 'Veuillez vous connecter pour voir votre liste de souhaits',
    adults: 'Adultes',
    children: 'Enfants',
    infants: 'Bébés',
    pets: 'Animaux',
    ages13OrAbove: '13 ans ou plus',
    ages2to12: '2 à 12 ans',
    under2: 'Moins de 2 ans',
    bringingServiceAnimal: 'Amenez-vous un animal de service ?',
    who: 'Qui',
    addGuests: 'Ajouter des invités',
    guest: 'invité',
    guests: 'invités',
    logout: 'Se déconnecter',

    // Additional translations can be added here
  },
  EN: {
    // Navigation
    home: 'Home',
    buy: 'Buy',
    rent: 'Rent',
    shortStay: 'Short Stay',
    findDreamProperty: 'Find Your Dream Property',
    buyHeroDescription: 'Discover exceptional properties for sale across Algeria with our expert advice.',
    findPerfectRental: 'Find Your Perfect Rental',
    rentHeroDescription: 'Explore quality rental properties that match your lifestyle and budget.',
    findPerfectStay: 'Find Your Perfect Stay',
    shortStayHeroDescription: 'Book unique accommodations for memorable short stays across Algeria.',
    about: 'About',
    blog: 'Blog',
    login: 'Log In',
    publishProperty: 'Publish a Listing',
    myProfile: 'My Profile',
    myBookings: 'My Bookings',
    wishlist: 'Wishlist',
    myWishlist: 'My Wishlist',
    wishlistEmpty: 'Your wishlist is empty',
    startBrowsing: 'Start browsing properties and add your favorites',
    browseProperties: 'Browse Properties',
    loginToViewWishlist: 'Please log in to view your wishlist',
    adults: 'Adults',
    children: 'Children',
    infants: 'Infants',
    pets: 'Pets',
    ages13OrAbove: '13 years or older',
    ages2to12: '2 to 12 years',
    under2: 'Under 2 years',
    bringingServiceAnimal: 'Bringing a service animal?',
    who: 'Who',
    addGuests: 'Add Guests',
    guest: 'guest',
    guests: 'guests',
    logout: 'Log Out',

    // Additional translations can be added here
  },
  AR: {
    // Navigation
    home: 'الرئيسية',
    buy: 'شراء',
    rent: 'إيجار',
    shortStay: 'إقامة قصيرة',
    findDreamProperty: 'ابحث عن عقارك المثالي',
    buyHeroDescription: 'اكتشف عقارات استثنائية للبيع في جميع أنحاء الجزائر مع نصائح خبرائنا.',
    findPerfectRental: 'ابحث عن إيجارك المثالي',
    rentHeroDescription: 'استكشف عقارات إيجار عالية الجودة تناسب أسلوب حياتك وميزانيتك.',
    findPerfectStay: 'ابحث عن إقامتك المثالية',
    shortStayHeroDescription: 'احجز أماكن إقامة فريدة لإقامات قصيرة لا تُنسى في جميع أنحاء الجزائر.',
    about: 'حول',
    blog: 'مدونة',
    login: 'تسجيل الدخول',
    publishProperty: 'نشر إعلان',
    myProfile: 'ملفي',
    myBookings: 'حجوزاتي',
    wishlist: 'قائمة الرغبات',
    myWishlist: 'قائمة رغباتي',
    wishlistEmpty: 'قائمة الرغبات الخاصة بك فارغة',
    startBrowsing: 'ابدأ بتصفح العقارات وأضف المفضلة لديك',
    browseProperties: 'تصفح العقارات',
    loginToViewWishlist: 'يرجى تسجيل الدخول لعرض قائمة الرغبات الخاصة بك',
    adults: 'البالغون',
    children: 'الأطفال',
    infants: 'الرضع',
    pets: 'الحيوانات الأليفة',
    ages13OrAbove: '13 سنة أو أكثر',
    ages2to12: 'من 2 إلى 12 سنة',
    under2: 'أقل من سنتين',
    bringingServiceAnimal: 'هل تحضر حيوان خدمة؟',
    who: 'من',
    addGuests: 'إضافة ضيوف',
    guest: 'ضيف',
    guests: 'ضيوف',
    logout: 'تسجيل الخروج',

    // Additional translations can be added here
  }
};

const translations = allTranslations;

function detectInitialLang(): Language {
  try {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && (savedLang === 'EN' || savedLang === 'FR' || savedLang === 'AR')) {
      return savedLang as Language;
    }
    
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (urlLang) {
      const up = urlLang.toUpperCase();
      if (up === 'EN' || up === 'FR' || up === 'AR') return up as Language;
    }
    
    return 'EN';
  } catch {
    return 'EN';
  }
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLang, setCurrentLang] = useState<Language>(detectInitialLang);

  useEffect(() => {
    try {
      localStorage.setItem('lang', currentLang);
      document.documentElement.lang = currentLang === 'AR' ? 'ar' : currentLang.toLowerCase();
      document.documentElement.dir = currentLang === 'AR' ? 'rtl' : 'ltr';
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }, [currentLang]);

  const t = useMemo(() => {
    return (key: string): string | any => {
      try {
        const keys = key.split('.');
        let result: any = translations[currentLang];
        
        for (const k of keys) {
          if (result && typeof result === 'object' && k in result) {
            result = result[k];
          } else {
            return import.meta.env.DEV ? key : '';
          }
        }
        
        return result;
      } catch {
        return key;
      }
    };
  }, [currentLang]);

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
