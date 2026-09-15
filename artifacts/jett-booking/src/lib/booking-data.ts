export type BookingData = {
  bookingType: 'arab' | 'luggage';
  origin: string;
  destination: string;
  tripType: 'economy' | 'vip';
  date: Date | undefined;
  scheduleId: string;
  passengers: number;
  luggage: number;
  contact: {
    fullName: string;
    email: string;
    phone: string;
    phoneCode: string;
  };
};

export const defaultBookingData: BookingData = {
  bookingType: 'arab',
  origin: 'عمان',
  destination: 'جسر الملك حسين',
  tripType: 'economy',
  date: undefined,
  scheduleId: '',
  passengers: 1,
  luggage: 0,
  contact: {
    fullName: '',
    email: '',
    phone: '',
    phoneCode: '+962',
  },
};

export const FARES = {
  economy: 10,
  vip: 90,
  luggage: 2,
} as const;

export const SCHEDULES = [
  { id: 'JET1', time: '8:00 - 10:00', seats: 213, type: 'economy' },
  { id: 'JET3', time: '9:00 - 11:00', seats: 191, type: 'economy' },
  { id: 'JET2', time: '11:00 - 13:00', seats: 219, type: 'economy' },
  { id: 'JET4', time: '12:00 - 14:00', seats: 150, type: 'vip' },
  { id: 'JET5', time: '14:00 - 16:00', seats: 180, type: 'vip' },
];

export const CITIES = [
  'عمان (العبدلي)',
  'عمان (الدوار السابع)',
  'إربد',
  'العقبة',
  'الزرقاء',
  'جسر الملك حسين',
];

export const PHONE_CODES = [
  { code: '+962', name: 'الأردن' },
  { code: '+970', name: 'فلسطين' },
  { code: '+966', name: 'السعودية' },
  { code: '+971', name: 'الإمارات' },
  { code: '+20', name: 'مصر' },
  { code: '+965', name: 'الكويت' },
  { code: '+974', name: 'قطر' },
  { code: '+973', name: 'البحرين' },
  { code: '+1', name: 'الولايات المتحدة' },
];
