import { BookingData, FARES, SCHEDULES } from '@/lib/booking-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CalendarIcon, Users, CheckCircle2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Step2({ data, updateData, onNext, onPrev }: Props) {
  const isFormValid = data.date && data.scheduleId;

  const schedules = SCHEDULES.filter(s => s.type === data.tripType);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      updateData({ date: new Date(e.target.value), scheduleId: '' }); // reset schedule when date changes
    }
  };

  const formattedDate = data.date ? data.date.toISOString().split('T')[0] : '';
  const isEconomy = data.tripType === 'economy';
  const isVip = data.tripType === 'vip';

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      <div className="text-center mt-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">تفاصيل الرحلة</h2>
        <p className="text-sm text-muted-foreground mt-1">اختر الفئة والتاريخ والوقت المناسب لك</p>
      </div>

      <div className="flex flex-col gap-6 mt-2">

        {/* Tabs */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl">
          <button
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 relative flex flex-col items-center justify-center gap-1 ${
              isEconomy ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => updateData({ tripType: 'economy', scheduleId: '' })}
          >
            <span>رحلة اقتصادية</span>
            <span className={`text-[10px] font-sans font-normal ${isEconomy ? 'text-primary/70' : 'text-muted-foreground/60'}`}>{FARES.economy} JOD</span>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 relative flex flex-col items-center justify-center gap-1 ${
              isVip ? 'bg-white text-primary shadow-sm ring-1 ring-black/5' : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => updateData({ tripType: 'vip', scheduleId: '' })}
          >
            <span>رحلة VIP</span>
            <span className={`text-[10px] font-sans font-normal ${isVip ? 'text-primary/70' : 'text-muted-foreground/60'}`}>{FARES.vip} JOD</span>
          </button>
        </div>

        {/* Date Picker */}
        <div className="space-y-3">
          <div className="flex flex-col px-1">
            <label className="text-sm font-bold text-foreground">تاريخ المغادرة</label>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <input
              type="date"
              value={formattedDate}
              onChange={handleDateChange}
              className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-white px-4 pr-12 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all block text-right appearance-none font-medium font-sans"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Time Picker */}
        {data.date && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex flex-col px-1">
              <label className="text-sm font-bold text-foreground block">وقت المغادرة</label>
            </div>

            <RadioGroup
              value={data.scheduleId}
              onValueChange={(val) => updateData({ scheduleId: val })}
              className="grid gap-3"
            >
              {schedules.map((schedule) => {
                const isSelected = data.scheduleId === schedule.id;
                return (
                  <Label
                    key={schedule.id}
                    htmlFor={schedule.id}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                      isSelected
                        ? 'border-primary bg-primary/[0.02] shadow-sm'
                        : 'border-gray-100 bg-white hover:border-primary/30 hover:bg-gray-50'
                    }`}
                  >
                    <RadioGroupItem value={schedule.id} id={schedule.id} className="sr-only" />

                    <div className="flex flex-col gap-1.5">
                      <span className="font-bold text-foreground text-lg tracking-wide" dir="ltr">{schedule.time}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">رحلة {schedule.id}</span>
                        <div className="flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Users className="w-3 h-3 ms-1 opacity-70" />
                          {schedule.seats} مقعد متاح
                        </div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-transparent'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        )}

      </div>

      <div className="flex justify-between items-center mt-6">
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
          disabled={!isFormValid}
          className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 text-base"
        >
          <span>التالي</span>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

    </div>
  );
}