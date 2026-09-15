import { BookingData, PHONE_CODES } from '@/lib/booking-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, User, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Step4({ data, updateData, onNext, onPrev }: Props) {
  const isFormValid = data.contact.fullName.trim() !== '' && data.contact.phone.trim() !== '';

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      <div className="text-center mt-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">معلومات الاتصال</h2>
        <p className="text-sm text-muted-foreground mt-1">الرجاء إدخال بيانات الراكب الرئيسي للتواصل</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-6 mt-2">

        {/* Full Name */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
            <User className="w-4 h-4 text-primary/70" />
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="الاسم كما في جواز السفر أو الهوية"
            value={data.contact.fullName}
            onChange={(e) => updateData({ contact: { ...data.contact, fullName: e.target.value } })}
            className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 transition-all text-base shadow-none"
          />
        </div>

        {/* Phone */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
            <Phone className="w-4 h-4 text-primary/70" />
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2" dir="ltr">
            <div className="w-[110px] shrink-0">
              <Select
                value={data.contact.phoneCode}
                onValueChange={(val) => updateData({ contact: { ...data.contact, phoneCode: val } })}
              >
                <SelectTrigger className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-3 shadow-none font-mono text-base">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]" dir="ltr">
                  {PHONE_CODES.map(pc => (
                    <SelectItem key={pc.code} value={pc.code} className="py-3 cursor-pointer">
                      <div className="flex items-center justify-between w-full gap-4">
                        <span className="font-mono text-primary font-bold">{pc.code}</span>
                        <span className="text-xs text-muted-foreground">{pc.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="79X XXX XXX"
              value={data.contact.phone}
              onChange={(e) => updateData({ contact: { ...data.contact, phone: e.target.value } })}
              className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 transition-all text-left font-mono text-lg shadow-none"
              type="tel"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2.5">
          <label className="text-sm font-bold text-foreground flex items-center gap-2 px-1">
            <Mail className="w-4 h-4 text-primary/70" />
            البريد الإلكتروني <span className="text-muted-foreground font-normal text-xs">(اختياري)</span>
          </label>
          <Input
            placeholder="example@mail.com"
            value={data.contact.email}
            onChange={(e) => updateData({ contact: { ...data.contact, email: e.target.value } })}
            className="h-14 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 transition-all text-left shadow-none text-base"
            dir="ltr"
            type="email"
          />
        </div>

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