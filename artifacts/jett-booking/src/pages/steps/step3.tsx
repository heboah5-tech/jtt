import { BookingData, FARES, SCHEDULES } from '@/lib/booking-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Calendar, Clock, Minus, Plus, Users, Luggage } from 'lucide-react';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Step3({ data, updateData, onNext, onPrev }: Props) {
  const schedule = SCHEDULES.find(s => s.id === data.scheduleId);

  const formattedDate = data.date ? new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(data.date) : '';

  const passengerTotal = data.passengers * FARES[data.tripType];
  const luggageTotal = data.luggage * FARES.luggage;
  const grandTotal = passengerTotal + luggageTotal;

  const handlePassengerChange = (delta: number) => {
    const newVal = data.passengers + delta;
    if (newVal >= 1 && newVal <= 5) {
      updateData({ passengers: newVal });
    }
  };

  const handleLuggageChange = (delta: number) => {
    const newVal = data.luggage + delta;
    if (newVal >= 0 && newVal <= 10) {
      updateData({ luggage: newVal });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      <div className="text-center mt-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">الركاب والأمتعة</h2>
        <p className="text-sm text-muted-foreground mt-1">حدد عدد المسافرين والحقائب الإضافية</p>
      </div>

      <div className="bg-primary text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col gap-4 mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none" />

        <div className="flex justify-between items-start relative z-10">
          <div>
            <p className="text-primary-foreground/70 text-xs font-medium mb-1.5">تاريخ الرحلة</p>
            <div className="flex items-center gap-2 font-bold text-sm">
              <Calendar className="h-4 w-4 opacity-80" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="text-end">
            <p className="text-primary-foreground/70 text-xs font-medium mb-1.5">وقت المغادرة</p>
            <div className="flex items-center justify-end gap-2 font-bold text-sm">
              <Clock className="h-4 w-4 opacity-80" />
              <span dir="ltr">{schedule?.time.split(' - ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-2">
        {/* Passengers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-3 rounded-2xl text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">عدد الركاب</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">الحد الأقصى 5 ركاب</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl p-1 border border-gray-100">
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm transition-all text-primary"
              onClick={() => handlePassengerChange(1)} disabled={data.passengers >= 5}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-5 text-center">{data.passengers}</span>
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm transition-all text-primary"
              onClick={() => handlePassengerChange(-1)} disabled={data.passengers <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Luggage */}
        <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/5 p-3 rounded-2xl text-primary">
              <Luggage className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">الأمتعة الإضافية</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">حقائب إضافية (اختياري)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50/80 rounded-2xl p-1 border border-gray-100">
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm transition-all text-primary"
              onClick={() => handleLuggageChange(1)} disabled={data.luggage >= 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-5 text-center">{data.luggage}</span>
            <Button
              variant="ghost" size="icon"
              className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm transition-all text-primary"
              onClick={() => handleLuggageChange(-1)} disabled={data.luggage <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
        <p className="text-[11px] text-blue-800/80 leading-relaxed font-medium">
          * الأطفال أقل من سنتين لا يحتاجون إلى تذكرة منفصلة للرحلة.
        </p>
      </div>

      {/* Fares */}
      <div className="mt-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm relative overflow-hidden">
        {/* Perforated edge effect */}
        <div className="absolute top-0 left-4 right-4 h-1 flex justify-between">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-background -mt-1 opacity-50" />
          ))}
        </div>

        <h3 className="font-bold text-sm mb-4 mt-1 text-muted-foreground">تفاصيل الدفع الأولية</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground font-medium">تذاكر الركاب ({data.passengers})</span>
            <span className="font-bold text-primary" dir="ltr">{passengerTotal.toFixed(2)} JOD</span>
          </div>
          {data.luggage > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">الأمتعة الإضافية ({data.luggage})</span>
              <span className="font-bold text-primary" dir="ltr">{luggageTotal.toFixed(2)} JOD</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-200 my-4" />

        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground">المجموع المؤقت</span>
          <span className="text-xl font-black text-primary" dir="ltr">{grandTotal.toFixed(2)} JOD</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="rounded-2xl h-14 px-5 text-muted-foreground hover:text-foreground hover:bg-gray-100/50 font-bold transition-all flex items-center gap-2 text-base"
        >
          <ArrowRight className="h-5 w-5" />
          <span>رجوع</span>
        </Button>
        <Button
          onClick={onNext}
          className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-base"
        >
          <span>التالي</span>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

    </div>
  );
}