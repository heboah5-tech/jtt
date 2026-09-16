import { useState, useEffect } from 'react';
import { BookingData, defaultBookingData } from '@/lib/booking-data';
import { Globe, Check } from 'lucide-react';
import jettLogo from '@assets/jett_header_1789397361449.png';
import { Footer } from '@/components/footer';
import { PreStep } from './steps/pre-step';
import { Step2 } from './steps/step2';
import { Step3 } from './steps/step3';
import { StepPassengers } from './steps/step-passengers';
import { Step4 } from './steps/step4';
import { Step5 } from './steps/step5';
import { Button } from '@/components/ui/button';

const STEPS = [
  { num: 1, label: 'الرحلة' },
  { num: 2, label: 'الركاب' },
  { num: 3, label: 'المسافرين' },
  { num: 4, label: 'الاتصال' },
  { num: 5, label: 'الدفع' }
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [data, setData] = useState<BookingData>(() => {
    try {
      const saved = localStorage.getItem('jett_booking');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date) {
          parsed.date = new Date(parsed.date);
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return defaultBookingData;
  });

  useEffect(() => {
    localStorage.setItem('jett_booking', JSON.stringify(data));
  }, [data]);

  // Expose current step for tracking
  useEffect(() => {
    let stepName = 'الرئيسية';
    if (currentStep === 0) stepName = 'الرئيسية (اختيار نوع الحجز)';
    else if (currentStep === 1) stepName = 'خطوة 1: اختيار الرحلة';
    else if (currentStep === 2) stepName = 'خطوة 2: عدد الركاب والأمتعة';
    else if (currentStep === 3) stepName = 'خطوة 3: بيانات المسافرين (الجوازات)';
    else if (currentStep === 4) stepName = 'خطوة 4: معلومات الاتصال';
    else if (currentStep === 5) stepName = 'خطوة 5: الدفع المباشر';
    (window as any).currentBookingStep = stepName;
  }, [currentStep]);

  // Scroll to top when moving to next/previous step
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentStep]);

  const updateData = (updates: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setCurrentStep((p) => Math.min(p + 1, 5));
  };
  const prevStep = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setCurrentStep((p) => Math.max(p - 1, 0));
  };

  const resetBooking = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setData(defaultBookingData);
    setCurrentStep(0);
    localStorage.removeItem('jett_booking');
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col mx-auto max-w-md relative shadow-2xl overflow-x-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 text-primary">
          <Globe className="h-5 w-5" />
        </Button>
        <div className="flex items-center justify-center">
          <img
            src={jettLogo}
            alt="JETT"
            className="h-auto w-[80px] object-contain cursor-pointer transition-transform hover:scale-105"
            onClick={currentStep > 0 ? () => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              setCurrentStep(0);
            } : undefined}
          />
        </div>
      </header>

      {/* Progress Indicator */}
      {currentStep > 0 && currentStep <= 5 && (
        <div className="bg-white px-6 pb-4 pt-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-b border-gray-50 relative z-10">
          <div className="flex items-center justify-between relative max-w-xs mx-auto">
            {/* Background track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 rounded-full -translate-y-1/2 z-0" />
            {/* Active track */}
            <div
              className="absolute top-1/2 right-0 h-1 bg-primary rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;

              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                    ${isActive ? 'bg-primary text-white scale-110 shadow-md ring-4 ring-primary/10'
                    : isPast ? 'bg-primary text-white'
                    : 'bg-white text-muted-foreground border-2 border-gray-200'}`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : step.num}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between relative max-w-xs mx-auto mt-2 px-1">
            {STEPS.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <span key={step.num} className={`text-[10px] font-bold transition-colors duration-300 ${isActive ? 'text-primary' : isPast ? 'text-primary/70' : 'text-muted-foreground/60'}`}>
                  {step.label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-0">
        {currentStep === 0 && <PreStep onNext={nextStep} data={data} updateData={updateData} />}
        {currentStep === 1 && <Step2 onNext={nextStep} onPrev={prevStep} data={data} updateData={updateData} />}
        {currentStep === 2 && <Step3 onNext={nextStep} onPrev={prevStep} data={data} updateData={updateData} />}
        {currentStep === 3 && <StepPassengers onNext={nextStep} onPrev={prevStep} data={data} updateData={updateData} />}
        {currentStep === 4 && <Step4 onNext={nextStep} onPrev={prevStep} data={data} updateData={updateData} />}
        {currentStep === 5 && <Step5 onNext={resetBooking} onPrev={prevStep} data={data} updateData={updateData} />}
      </main>

      {/* App Footer */}
      <Footer />
    </div>
  );
}