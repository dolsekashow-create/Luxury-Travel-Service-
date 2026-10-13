// Booking form schemas. Every label is bilingual; the dialog picks the page language.
type T = { en: string; ar: string };
export type Field = {
  name: string; type: 'text' | 'email' | 'tel' | 'date' | 'time' | 'number' | 'select' | 'textarea';
  label: T; required?: boolean; placeholder?: T; min?: number; value?: number; full?: boolean;
  options?: { v: string; t: T }[];
};
const t = (en: string, ar: string): T => ({ en, ar });

const airports = [
  { v: '', t: t('— Select —', '— اختر —') },
  { v: 'Cairo (CAI)', t: t('Cairo (CAI)', 'القاهرة (CAI)') },
  { v: 'Hurghada (HRG)', t: t('Hurghada (HRG)', 'الغردقة (HRG)') },
  { v: 'Sharm El Sheikh (SSH)', t: t('Sharm El Sheikh (SSH)', 'شرم الشيخ (SSH)') },
  { v: 'Luxor (LXR)', t: t('Luxor (LXR)', 'الأقصر (LXR)') },
  { v: 'Aswan (ASW)', t: t('Aswan (ASW)', 'أسوان (ASW)') },
  { v: 'Alexandria (HBE)', t: t('Alexandria (HBE)', 'الإسكندرية (HBE)') },
];
const vehicles = [
  { v: '', t: t('Any / recommend the best', 'أي نوع / اقترحوا الأنسب') },
  { v: 'Sedan', t: t('Sedan (1–3 passengers)', 'سيدان (1–3 ركاب)') },
  { v: 'SUV', t: t('SUV (1–4 passengers)', 'دفع رباعي (1–4 ركاب)') },
  { v: 'Minivan', t: t('Minivan (5–7 passengers)', 'ميني فان (5–7 ركاب)') },
  { v: 'Minibus', t: t('Minibus (8–14 passengers)', 'ميني باص (8–14 راكباً)') },
  { v: 'Coach', t: t('Coach (15+ passengers)', 'أتوبيس (15 راكباً فأكثر)') },
];

export const common: Field[] = [
  { name: 'fullName', type: 'text', required: true, label: t('Full Name', 'الاسم بالكامل'), placeholder: t('e.g. John Smith', 'مثال: أحمد محمد') },
  { name: 'email', type: 'email', required: true, label: t('Email Address', 'البريد الإلكتروني'), placeholder: t('you@example.com', 'you@example.com') },
  { name: 'phone', type: 'tel', required: true, label: t('Phone / WhatsApp', 'الهاتف / واتساب'), placeholder: t('+1 555 123 4567', '+20 100 000 0000') },
  { name: 'country', type: 'text', label: t('Country / Nationality', 'الدولة / الجنسية'), placeholder: t('e.g. United Kingdom', 'مثال: المملكة المتحدة') },
];

export const notes: Field = {
  name: 'notes', type: 'textarea', full: true,
  label: t('Additional Notes / Special Requests', 'ملاحظات إضافية / طلبات خاصة'),
  placeholder: t('Anything else we should know? Allergies, accessibility, preferences…', 'هل هناك تفاصيل أخرى؟ حساسية، احتياجات خاصة، تفضيلات…'),
};

export const forms: Record<string, Field[]> = {
  'meet-assist': [
    { name: 'arrivalDate', type: 'date', required: true, label: t('Arrival Date', 'تاريخ الوصول') },
    { name: 'arrivalTime', type: 'time', label: t('Arrival Time', 'وقت الوصول') },
    { name: 'airport', type: 'select', required: true, label: t('Airport', 'المطار'), options: airports },
    { name: 'flightNumber', type: 'text', label: t('Flight Number', 'رقم الرحلة'), placeholder: t('e.g. MS786', 'مثال: MS786') },
    { name: 'dropoff', type: 'text', required: true, label: t('Destination / Hotel', 'الوجهة / الفندق'), placeholder: t('e.g. Four Seasons Cairo', 'مثال: فندق فورسيزونز القاهرة') },
    { name: 'passengers', type: 'number', required: true, label: t('Number of Passengers', 'عدد الركاب'), min: 1, value: 2 },
    { name: 'vehicleType', type: 'select', label: t('Vehicle Preference', 'نوع السيارة المفضل'), options: vehicles },
  ],
  visa: [
    { name: 'visaNationality', type: 'text', required: true, label: t('Passport Nationality', 'جنسية جواز السفر'), placeholder: t('e.g. American', 'مثال: أمريكي') },
    { name: 'visaArrival', type: 'date', required: true, label: t('Expected Arrival Date', 'تاريخ الوصول المتوقع') },
    { name: 'visaAirport', type: 'select', required: true, label: t('Arrival Airport', 'مطار الوصول'), options: airports },
    { name: 'visaPassengers', type: 'number', required: true, label: t('Number of Travellers', 'عدد المسافرين'), min: 1, value: 1 },
    {
      name: 'visaType', type: 'select', label: t('Visa Type', 'نوع التأشيرة'),
      options: [
        { v: 'Tourist (Single Entry)', t: t('Tourist (Single Entry)', 'سياحية (دخول واحد)') },
        { v: 'Tourist (Multiple Entry)', t: t('Tourist (Multiple Entry)', 'سياحية (دخول متعدد)') },
        { v: 'Recommend best', t: t('Not sure — recommend the best', 'لست متأكداً — اقترحوا الأنسب') },
      ],
    },
  ],
  transfer: [
    { name: 'transferFrom', type: 'text', required: true, label: t('Pickup Location', 'مكان الانطلاق'), placeholder: t('e.g. Cairo Airport Terminal 3', 'مثال: مطار القاهرة – مبنى 3') },
    { name: 'transferTo', type: 'text', required: true, label: t('Drop-off Location', 'مكان الوصول'), placeholder: t('e.g. Mena House Hotel, Giza', 'مثال: فندق مينا هاوس، الجيزة') },
    { name: 'transferDate', type: 'date', required: true, label: t('Transfer Date', 'تاريخ الانتقال') },
    { name: 'transferTime', type: 'time', label: t('Transfer Time', 'وقت الانتقال') },
    {
      name: 'roundTrip', type: 'select', label: t('Round Trip?', 'ذهاب وعودة؟'),
      options: [
        { v: 'One way', t: t('One way only', 'ذهاب فقط') },
        { v: 'Round trip', t: t('Round trip', 'ذهاب وعودة') },
      ],
    },
    { name: 'transferPax', type: 'number', required: true, label: t('Number of Passengers', 'عدد الركاب'), min: 1, value: 2 },
    { name: 'transferLuggage', type: 'number', label: t('Number of Luggage Pieces', 'عدد الحقائب'), min: 0 },
    { name: 'transferVehicle', type: 'select', label: t('Vehicle Preference', 'نوع السيارة المفضل'), options: vehicles },
  ],
  flight: [
    {
      name: 'bookingType', type: 'select', required: true, label: t('Booking Type', 'نوع الحجز'),
      options: [
        { v: 'Flight', t: t('Flight', 'طيران') },
        { v: 'Train', t: t('Train', 'قطار') },
        { v: 'Both', t: t('Both — combined itinerary', 'الاثنان معاً') },
      ],
    },
    { name: 'flightFrom', type: 'text', required: true, label: t('From (City / Airport)', 'من (المدينة / المطار)'), placeholder: t('e.g. London (LHR)', 'مثال: لندن (LHR)') },
    { name: 'flightTo', type: 'text', required: true, label: t('To (City / Airport)', 'إلى (المدينة / المطار)'), placeholder: t('e.g. Cairo (CAI)', 'مثال: القاهرة (CAI)') },
    { name: 'flightDate', type: 'date', required: true, label: t('Departure Date', 'تاريخ السفر') },
    { name: 'returnDate', type: 'date', label: t('Return Date (if round trip)', 'تاريخ العودة (إن وُجد)') },
    { name: 'flightPax', type: 'number', required: true, label: t('Number of Passengers', 'عدد المسافرين'), min: 1, value: 1 },
    {
      name: 'flightClass', type: 'select', label: t('Class Preference', 'الدرجة المفضلة'),
      options: [
        { v: 'Economy', t: t('Economy', 'السياحية') },
        { v: 'Premium Economy', t: t('Premium Economy', 'السياحية المميزة') },
        { v: 'Business', t: t('Business', 'رجال الأعمال') },
        { v: 'First', t: t('First Class', 'الدرجة الأولى') },
      ],
    },
    { name: 'preferredAirline', type: 'text', label: t('Preferred Airline (optional)', 'شركة الطيران المفضلة (اختياري)'), placeholder: t('e.g. EgyptAir', 'مثال: مصر للطيران') },
  ],
  generic: [
    { name: 'serviceDate', type: 'date', label: t('Preferred Date', 'التاريخ المفضل') },
    { name: 'servicePax', type: 'number', label: t('Number of People', 'عدد الأشخاص'), min: 1, value: 2 },
    { name: 'serviceLocation', type: 'text', label: t('Location / City', 'المدينة / الموقع'), placeholder: t('e.g. Cairo, Luxor…', 'مثال: القاهرة، الأقصر…') },
  ],
  program: [
    { name: 'travelDate', type: 'date', required: true, label: t('Preferred Start Date', 'تاريخ البدء المفضل') },
    { name: 'adults', type: 'number', required: true, label: t('Adults', 'عدد البالغين'), min: 1, value: 2 },
    { name: 'children', type: 'number', label: t('Children (under 12)', 'عدد الأطفال (أقل من 12 سنة)'), min: 0, value: 0 },
    { name: 'pickup', type: 'text', label: t('Hotel / Pickup Point', 'الفندق / نقطة الانطلاق'), placeholder: t('e.g. Hilton Hurghada Plaza', 'مثال: هيلتون الغردقة بلازا') },
  ],
};
