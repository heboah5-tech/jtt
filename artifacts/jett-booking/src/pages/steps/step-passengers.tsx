import { useEffect } from 'react';
import { BookingData, Passenger } from '@/lib/booking-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, User, FileText, CheckCircle2, ShieldAlert, Users } from 'lucide-react';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function StepPassengers({ data, updateData, onNext, onPrev }: Props) {
  const passengerCount = Math.max(1, data.passengers || 1);

  // Ensure passengerDetails has the correct length
  useEffect(() => {
    const current = data.passengerDetails ? [...data.passengerDetails] : [];
    let changed = false;

    if (current.length < passengerCount) {
      while (current.length < passengerCount) {
        current.push({ fullName: '', passportNumber: '' });
      }
      changed = true;
    } else if (current.length > passengerCount) {
      current.splice(passengerCount);
      changed = true;
    }

    if (changed) {
      updateData({ passengerDetails: current });
    }
  }, [passengerCount, data.passengerDetails, updateData]);

  const passengers: Passenger[] = Array.from({ length: passengerCount }).map((_, idx) => {
    return data.passengerDetails?.[idx] || { fullName: '', passportNumber: '' };
  });

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = passengers.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          [field]: field === 'passportNumber' ? value.toUpperCase().trim() : value
        };
      }
      return p;
    });

    // Also synchronize main passenger's name with contact.fullName if not yet customized
    const updates: Partial<BookingData> = { passengerDetails: updated };
    if (index === 0 && field === 'fullName') {
      if (!data.contact.fullName || data.contact.fullName === passengers[0].fullName) {
        updates.contact = {
          ...data.contact,
          fullName: value
        };
      }
    }

    updateData(updates);
  };

  const isPassengerValid = (p: Passenger) => {
    return p.fullName.trim().length >= 3 && p.passportNumber.trim().length >= 4;
  };

  const allValid = passengers.length > 0 && passengers.every(isPassengerValid);
  const completedCount = passengers.filter(isPassengerValid).length;

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
      {/* Header */}
      <div className="text-center mt-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">بيانات المسافرين</h2>
        <p className="text-sm text-muted-foreground mt-1">
          يرجى إدخال الاسم ورقم الجواز لجميع الركاب ({passengerCount} {passengerCount === 1 ? 'راكب' : 'ركاب'})
        </p>
      </div>

      {/* Progress pill */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <Users className="w-4 h-4" />
          <span>المسافرون المكتملون</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-black">
          <span className="text-primary font-mono text-sm">{completedCount}</span>
          <span className="text-muted-foreground font-normal">من</span>
          <span className="text-foreground font-mono text-sm">{passengerCount}</span>
        </div>
      </div>

      {/* Passenger Forms List */}
      <div className="space-y-5">
        {passengers.map((passenger, index) => {
          const isValid = isPassengerValid(passenger);
          const isMain = index === 0;

          return (
            <div
              key={index}
              className={`bg-white rounded-3xl p-5 border-2 transition-all duration-300 shadow-sm ${
                isValid
                  ? 'border-emerald-200 ring-2 ring-emerald-500/10'
                  : 'border-gray-100 hover:border-primary/20'
              }`}
            >
              {/* Passenger Card Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      {isMain ? 'المسافر 1 (الراكب الرئيسي)' : `المسافر ${index + 1}`}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {isMain ? 'صاحب الحجز الأساسي' : 'مرافق في الرحلة'}
                    </p>
                  </div>
                </div>

                {isValid ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    مكتمل
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    مطلوب
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 px-1">
                    <User className="w-3.5 h-3.5 text-primary/70" />
                    الاسم الكامل <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="الاسم كما هو مدون في جواز السفر"
                    value={passenger.fullName}
                    onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                    className="h-13 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 transition-all text-sm shadow-none"
                  />
                </div>

                {/* Passport Number Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 px-1">
                    <FileText className="w-3.5 h-3.5 text-primary/70" />
                    رقم جواز السفر <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="مثال: N01234567"
                    value={passenger.passportNumber}
                    onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                    dir="ltr"
                    className="h-13 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 transition-all text-left font-mono text-sm tracking-wider uppercase shadow-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice box */}
      <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-4 flex gap-3 shadow-sm">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
          يرجى التأكد من صحة أرقام الجوازات والأسماء ومطابقتها التامة للوثائق الرسمية، حيث تُطلب للتأكد عند الصعود ومغادرة الجسر.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-4">
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
          disabled={!allValid}
          className="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 text-base"
        >
          <span>التالي</span>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
