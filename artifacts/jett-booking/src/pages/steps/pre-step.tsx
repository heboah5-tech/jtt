import { BookingData } from '@/lib/booking-data';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, Info, ArrowLeft, CalendarDays, Luggage, Zap, Clock, ShieldCheck, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
};

export function PreStep({ updateData, onNext }: Props) {
  const handleSelect = (type: 'arab' | 'luggage') => {
    updateData({ bookingType: type });
    onNext();
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      <div className="pt-2 text-center">
        <p className="text-xs font-bold text-secondary mb-2">رحلتك تبدأ من هنا</p>
        <h1 className="text-2xl font-black leading-tight text-primary">
          حجز تذاكر جسر الملك حسين
        </h1>
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-3">
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex gap-4 shadow-sm">
          <div className="text-amber-600 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900">تنبيه أمني هام</h3>
            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
              احذروا المواقع المزيفة. نود تذكيركم بعدم إدخال أي معلومات شخصية أو مالية إلا عبر موقع جت الرسمي لحمايتكم.
            </p>
          </div>
        </div>

        <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-4 flex gap-4 shadow-sm">
          <div className="text-blue-600 shrink-0 mt-0.5">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-blue-900">شراء الأمتعة الإضافية</h3>
            <p className="text-xs text-blue-700/80 mt-1 leading-relaxed">
              يرجى العلم بأن خيار شراء الأمتعة الإضافية متاح حصرياً وفقط عبر موقعنا الإلكتروني. لا تتوفر أي أجهزة دفع إلكتروني (POS) أو مكاتب مبيعات في جسر الملك حسين.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mt-4 mb-2 text-muted-foreground">
        <span className="text-xs mb-2 font-medium">اسحب للأسفل لبدء الحجز</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </div>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">ابدأ رحلتك</h2>
        <p className="text-sm text-muted-foreground mt-1">حدد خيار الحجز الذي يناسب احتياجاتك للمتابعة</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Card 1 */}
        <Card
          className="group relative overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-3xl"
          onClick={() => handleSelect('arab')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="bg-primary/5 p-4 rounded-2xl shrink-0 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">حجز تذكرة رحلة</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">احجز تذكرتك للمغادرة براحة وأمان عبر الجسر</p>
            </div>
            <div className="text-gray-300 group-hover:text-primary transition-colors group-hover:-translate-x-1 duration-300">
              <ArrowLeft className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card
          className="group relative overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-3xl"
          onClick={() => handleSelect('luggage')}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-6 flex items-center gap-5">
            <div className="bg-primary/5 p-4 rounded-2xl shrink-0 text-primary group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Luggage className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">إضافة أمتعة</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-tight">أضف أمتعة إضافية لحجزك الحالي المسبق بسهولة</p>
            </div>
            <div className="text-gray-300 group-hover:text-primary transition-colors group-hover:-translate-x-1 duration-300">
              <ArrowLeft className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why book with us */}
      <div className="mt-8">
        <h3 className="font-bold text-foreground text-sm mb-4 text-center">لماذا تحجز عبر منصتنا</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-gray-100 shadow-sm">
            <div className="bg-primary/5 p-3 rounded-full text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">حجز سريع</h4>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-gray-100 shadow-sm">
            <div className="bg-primary/5 p-3 rounded-full text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">وقتك أثمن</h4>
          </div>

          <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-gray-100 shadow-sm">
            <div className="bg-primary/5 p-3 rounded-full text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-xs text-foreground">دفع آمن</h4>
          </div>
        </div>
      </div>

    </div>
  );
}