import { CreditCard, Landmark, ShieldCheck, Wifi } from "lucide-react";

interface BinCardProps {
  bankName: string;
  cardBrand: string;
  cardType: string;
  country: string;
}

export function BinCard({ bankName, cardBrand, cardType, country }: BinCardProps) {
  if (!bankName && !cardBrand) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
        <CreditCard className="w-5 h-5 text-blue-600" />
        <span>معلومات البطاقة</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500 block text-xs">البنك</span>
          <span className="font-semibold text-slate-800">{bankName || 'غير معروف'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">نوع البطاقة</span>
          <span className="font-semibold text-slate-800 capitalize">{cardType || 'غير معروف'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">العلامة التجارية</span>
          <span className="font-semibold text-slate-800 capitalize">{cardBrand || 'غير معروف'}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-xs">الدولة</span>
          <span className="font-semibold text-slate-800">{country || 'غير معروف'}</span>
        </div>
      </div>
    </div>
  );
}
