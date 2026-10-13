import settings from '../data/settings.json';
import programsData from '../data/programs.json';
import servicesData from '../data/services.json';

export type Lang = 'en' | 'ar';
export type L10n = { en: string; ar: string };

export const SITE_NAME = { en: 'Luxury Travel Service', ar: 'لاكشري ترافل سيرفيس' };

/** Localised value with fallback to the other language. */
export const tr = (v: L10n | undefined, lang: Lang) => (v ? v[lang] || v.en || v.ar || '' : '');
export const base = (lang: Lang) => (lang === 'ar' ? '/ar/' : '/');
export const programUrl = (slug: string, lang: Lang) => `${base(lang)}programs/${slug}/`;
/** 640px variant that sits next to every uploaded image. */
export const sm = (src: string) => src.replace(/\.(\w+)$/, '.sm.$1');

export const SECTIONS = [
  {
    id: 'discover_egypt', anchor: 'discover-egypt',
    title: { en: 'Discover Egypt', ar: 'اكتشف مصر' },
    sub: {
      en: "Full multi-day guided tours covering Egypt's greatest historical and cultural highlights.",
      ar: 'برامج متعددة الأيام بصحبة مرشدين، تغطي أبرز معالم مصر التاريخية والثقافية.',
    },
  },
  {
    id: 'romantic_escape', anchor: 'romantic-escape',
    title: { en: 'Romantic Escape', ar: 'عطلات رومانسية' },
    sub: {
      en: 'Intimate experiences designed for couples — from Nile dinner cruises to island retreats.',
      ar: 'تجارب خاصة مصممة للأزواج، من عشاء على النيل إلى منتجعات الجزر الهادئة.',
    },
  },
  {
    id: 'therapeutic_tours', anchor: 'therapeutic-tours',
    title: { en: 'Therapeutic Tours', ar: 'السياحة الاستشفائية' },
    sub: {
      en: 'Wellness, sport and adventure experiences designed to rejuvenate body and spirit.',
      ar: 'تجارب للاستجمام والرياضة والمغامرة، تجدد نشاط الجسد والروح.',
    },
  },
  {
    id: 'spiritual_egypt', anchor: 'spiritual-egypt',
    title: { en: 'Spiritual Egypt', ar: 'مصر الروحانية' },
    sub: {
      en: "Sacred journeys through Egypt's religious heritage — Islamic, Coptic and ancient spiritual sites.",
      ar: 'رحلات إلى تراث مصر الديني: المواقع الإسلامية والقبطية والروحانية القديمة.',
    },
  },
] as const;

export const LOCATIONS = [
  { id: 'cairo', title: { en: 'From Cairo', ar: 'من القاهرة' }, city: { en: 'Cairo', ar: 'القاهرة' } },
  { id: 'hrg', title: { en: 'From Hurghada', ar: 'من الغردقة' }, city: { en: 'Hurghada', ar: 'الغردقة' } },
  { id: 'ssh', title: { en: 'From Sharm El Sheikh', ar: 'من شرم الشيخ' }, city: { en: 'Sharm El Sheikh', ar: 'شرم الشيخ' } },
] as const;

export type Program = (typeof programsData)[number];
export type Service = (typeof servicesData)[number];

const bySort = (a: { sort: number }, b: { sort: number }) => a.sort - b.sort;
export const programs = (programsData as Program[]).filter((p) => p.active !== false).sort(bySort);
export const services = (servicesData as Service[]).filter((s) => s.active !== false).sort(bySort);
export const inSection = (id: string) => programs.filter((p) => p.section === id);
export const excursions = (loc: string) => programs.filter((p) => p.section === 'excursion' && p.location === loc);
export { settings };

export const waNumber = (settings.contact.whatsapp || '').replace(/\D/g, '');
export const waLink = (text: string) => (waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}` : '');
export const mailLink = (subject: string) =>
  settings.contact.email ? `mailto:${settings.contact.email}?subject=${encodeURIComponent(subject)}` : '';

export const ui = {
  en: {
    skip: 'Skip to content',
    nav: { home: 'Home', programs: 'Programs', excursions: 'Day Excursions', services: 'Services', about: 'About Us', contact: 'Contact', menu: 'Menu', other: 'العربية' },
    hero: { explore: 'Explore Programs', whatsapp: 'Chat on WhatsApp' },
    about: {
      eyebrow: 'About Us', mission: 'Our Mission', vision: 'Our Vision',
      features: [
        { icon: 'compass', title: "Guides you'll remember", desc: 'Highly qualified, professional tour guides.' },
        { icon: 'utensils', title: 'Meals that match the trip', desc: 'Premium restaurant selections — curated, not accidental.' },
        { icon: 'route', title: 'Logistics without stress', desc: 'Pickup timing, routing and pacing built to protect your day.' },
        { icon: 'headset', title: 'Support that is always there', desc: "Dedicated representatives, so you're never alone." },
      ],
    },
    services: { eyebrow: 'Our Services', title: 'What We Offer', book: 'Book This Service' },
    programs: { eyebrow: 'Programs', from: 'from', details: 'View details', all: 'All programs' },
    excursions: {
      eyebrow: 'Day Excursions', title: 'Day Excursions',
      sub: 'Day trips and activities from your base city — Cairo, Hurghada or Sharm El Sheikh.',
    },
    program: {
      startingFrom: 'Starting from', perPerson: 'per person', duration: 'Duration', departs: 'Departs',
      book: 'Book Now', ask: 'Ask on WhatsApp', onRequest: 'Price on request', related: 'You may also like',
      gallery: 'Photo gallery', prev: 'Previous photo', next: 'Next photo', back: 'Back to programs',
      interest: "Hello, I'm interested in: ",
    },
    contact: {
      eyebrow: 'Contact Us', title: 'Ready to plan your trip?',
      sub: 'Tell us what you have in mind and our team will reply within 24 hours.',
      whatsapp: 'WhatsApp', email: 'Email', phone: 'Phone',
      hello: 'Hello, I would like to ask about your tours.',
    },
    footer: { tagline: 'Egypt tours agency & incoming tour operator.', links: 'Quick Links', contact: 'Contact', follow: 'Follow Us', rights: 'All rights reserved.', dev: 'Developed by' },
    booking: {
      request: 'Booking Request', close: 'Close',
      intro: "Fill in your details below and we'll get back to you with a personalised quote.",
      email: 'Send Request by Email', whatsapp: 'Send via WhatsApp',
      note: 'Fields marked with * are required. We reply within 24 hours.',
      done: 'Your email app has opened with the request ready — press send to complete your enquiry.',
      subject: 'Booking Request: ', sent: 'Sent from the Luxury Travel Service website',
    },
    notFound: { title: 'Page not found', text: 'The page you are looking for does not exist or has moved.', home: 'Back to home' },
  },
  ar: {
    skip: 'انتقل إلى المحتوى',
    nav: { home: 'الرئيسية', programs: 'البرامج', excursions: 'الرحلات اليومية', services: 'خدماتنا', about: 'من نحن', contact: 'تواصل معنا', menu: 'القائمة', other: 'English' },
    hero: { explore: 'استعرض البرامج', whatsapp: 'تواصل عبر واتساب' },
    about: {
      eyebrow: 'من نحن', mission: 'رسالتنا', vision: 'رؤيتنا',
      features: [
        { icon: 'compass', title: 'مرشدون لا يُنسون', desc: 'مرشدون سياحيون محترفون على أعلى مستوى من التأهيل.' },
        { icon: 'utensils', title: 'وجبات تليق برحلتك', desc: 'مطاعم راقية نختارها بعناية، لا بالمصادفة.' },
        { icon: 'route', title: 'تنظيم بلا عناء', desc: 'مواعيد الانتقال والمسارات وإيقاع اليوم مُعدّة لتحافظ على وقتك.' },
        { icon: 'headset', title: 'دعم حاضر دائماً', desc: 'مندوبون مخصصون لك، فلا تشعر أبداً أنك وحدك.' },
      ],
    },
    services: { eyebrow: 'خدماتنا', title: 'ماذا نقدم', book: 'احجز الخدمة' },
    programs: { eyebrow: 'البرامج', from: 'ابتداءً من', details: 'عرض التفاصيل', all: 'كل البرامج' },
    excursions: {
      eyebrow: 'الرحلات اليومية', title: 'الرحلات اليومية',
      sub: 'رحلات وأنشطة ليوم واحد تنطلق من مدينة إقامتك: القاهرة أو الغردقة أو شرم الشيخ.',
    },
    program: {
      startingFrom: 'ابتداءً من', perPerson: 'للفرد', duration: 'المدة', departs: 'الانطلاق',
      book: 'احجز الآن', ask: 'استفسر عبر واتساب', onRequest: 'السعر عند الطلب', related: 'قد يعجبك أيضاً',
      gallery: 'معرض الصور', prev: 'الصورة السابقة', next: 'الصورة التالية', back: 'العودة إلى البرامج',
      interest: 'مرحباً، أود الاستفسار عن: ',
    },
    contact: {
      eyebrow: 'تواصل معنا', title: 'جاهز لتخطيط رحلتك؟',
      sub: 'أخبرنا بما تفكر فيه، وسيرد عليك فريقنا خلال 24 ساعة.',
      whatsapp: 'واتساب', email: 'البريد الإلكتروني', phone: 'الهاتف',
      hello: 'مرحباً، أود الاستفسار عن رحلاتكم.',
    },
    footer: { tagline: 'وكالة سياحة ومنظم رحلات وافدة في مصر.', links: 'روابط سريعة', contact: 'تواصل معنا', follow: 'تابعنا', rights: 'جميع الحقوق محفوظة.', dev: 'تطوير' },
    booking: {
      request: 'طلب حجز', close: 'إغلاق',
      intro: 'املأ بياناتك وسنعود إليك بعرض سعر مخصص في أقرب وقت.',
      email: 'إرسال الطلب بالبريد', whatsapp: 'إرسال عبر واتساب',
      note: 'الحقول المميزة بعلامة * مطلوبة. نرد خلال 24 ساعة.',
      done: 'تم فتح تطبيق البريد والطلب جاهز — اضغط إرسال لإتمام طلبك.',
      subject: 'طلب حجز: ', sent: 'أُرسل من موقع لاكشري ترافل سيرفيس',
    },
    notFound: { title: 'الصفحة غير موجودة', text: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.', home: 'العودة إلى الرئيسية' },
  },
} as const;
