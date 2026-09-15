import { HelpCircle, Headset, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Link } from 'wouter';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-10 md:pt-14 mt-auto relative overflow-hidden flex-shrink-0" dir="rtl">
      <div className="max-w-md md:max-w-6xl mx-auto px-6 relative z-10 flex flex-col gap-10">
        
        {/* Main Grid */}
        <div className="flex flex-col md:flex-row gap-10 md:justify-between">
          
          {/* Links Section */}
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm font-medium">
              <Link href="#" className="hover:text-secondary transition-colors py-1">الرئيسية</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">الفروع</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">تذاكري</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">تتبع الحافلة</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">الخدمات</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">خارطة الموقع</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">اتصل بنا</Link>
            </div>
            <div className="grid grid-cols-1 gap-y-4 gap-x-2 text-sm font-medium mt-6">
              <Link href="#" className="hover:text-secondary transition-colors py-1">المفقودات والعثور عليها</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">استطلاع</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">ملاحظات</Link>
              <Link href="#" className="hover:text-secondary transition-colors py-1">بورصة عمان - جت</Link>
            </div>
          </div>

          {/* Support Section */}
          <div className="flex flex-col gap-5 min-w-[200px]">
            <a href="#" className="flex items-center gap-3 group w-fit">
              <div className="border border-white/40 p-2 rounded-full group-hover:border-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-medium group-hover:text-secondary transition-colors">الأسئلة الشائعة</span>
            </a>
            <a href="#" className="flex items-center gap-3 group w-fit">
              <div className="border border-white/40 p-2 rounded-full group-hover:border-white transition-colors">
                <Headset className="w-5 h-5" />
              </div>
              <span className="font-medium group-hover:text-secondary transition-colors">المساعدة والدعم</span>
            </a>
          </div>
        </div>

        {/* Social Section */}
        <div className="flex flex-col gap-4 mt-2">
          <span className="font-medium text-sm">زورونا:</span>
          <div className="flex items-center gap-3">
            <a href="#" className="bg-white text-primary p-2 rounded-full hover:bg-secondary hover:text-primary transition-colors shadow-sm">
              <Linkedin className="w-4 h-4 fill-current" />
            </a>
            <a href="#" className="bg-white text-primary p-2 rounded-full hover:bg-secondary hover:text-primary transition-colors shadow-sm">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="bg-white text-primary p-2 rounded-full hover:bg-secondary hover:text-primary transition-colors shadow-sm">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="bg-white text-primary p-2 rounded-full hover:bg-secondary hover:text-primary transition-colors shadow-sm">
              <Facebook className="w-4 h-4 fill-current" />
            </a>
          </div>
        </div>
      </div>

      {/* Landscape Decorative Art */}
      <div className="relative w-full h-48 mt-8 pointer-events-none select-none">
        
        {/* Clouds / Stars */}
        <svg className="absolute top-8 right-[15%] w-20 h-6 text-white/90" viewBox="0 0 100 30" fill="currentColor">
          <path d="M 25 25 C 20 25, 15 20, 20 15 C 25 5, 45 -5, 55 10 C 65 5, 80 10, 85 20 C 90 20, 90 25, 85 25 Z" />
        </svg>
        <div className="absolute top-1/4 left-[25%] w-1 h-1 bg-white/70 rotate-45 shadow-[0_0_4px_2px_rgba(255,255,255,0.3)]" />

        {/* Dune 1 (Back) */}
        <svg className="absolute bottom-0 w-full h-[95%] text-[#1b556e]" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path fill="currentColor" d="M0,100 L1000,100 L1000,50 Q750,10 400,60 T0,70 Z" />
        </svg>
        
        {/* Dune 2 (Middle) */}
        <svg className="absolute bottom-0 w-full h-[70%] text-[#347898]" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path fill="currentColor" d="M0,100 L1000,100 L1000,80 Q800,40 500,65 T0,55 Z" />
        </svg>

        {/* Camel */}
        <div className="absolute bottom-[28%] left-[12%] text-primary w-10 h-10 z-10">
          <svg viewBox="0 0 64 64" fill="currentColor">
             <path d="M47.7,21.1c-1.3-1.6-3.2-2.3-5-1.9c-0.6,0.1-1.3,0.4-1.8,0.8c-1.4-2.8-4-4.5-6.8-4.5c-2.3,0-4.6,1-6.1,2.8 c-1.2-1.3-3.1-2-5-1.6c-2.1,0.4-3.7,2.1-4,4.2c-0.7,0.3-1.6,0.8-2.2,1.6c-0.9,1.1-1.3,2.5-1.3,4v1.8c0,0-1.8-0.3-2.9,0.5 c-1,0.8-0.9,2.4-0.9,2.4s1.7-0.7,2.6-0.3c1,0.4,1.8,1.4,1.8,2.5v11.1c0,0.8,0.7,1.5,1.5,1.5c0.8,0,1.5-0.7,1.5-1.5V36h1.7v8.5 c0,0.8,0.7,1.5,1.5,1.5c0.8,0,1.5-0.7,1.5-1.5V34h4.4v10.5c0,0.8,0.7,1.5,1.5,1.5c0.8,0,1.5-0.7,1.5-1.5v-9.1 c0.8,0.6,1.8,0.9,2.9,0.9h1.5v9.1c0,0.8,0.7,1.5,1.5,1.5c0.8,0,1.5-0.7,1.5-1.5V31.5c0.5-0.6,1-1.4,1.3-2.2l1.9,1.3 c0.7,0.5,1.6,0.3,2.1-0.4c0.3-0.5,0.3-1,0-1.5l-3.3-4.7C48.6,23.1,48.4,22,47.7,21.1z"/>
          </svg>
        </div>

        {/* Dune 3 (Front) */}
        <svg className="absolute bottom-0 w-full h-[45%] text-[#83b4cc]" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <path fill="currentColor" d="M0,100 L1000,100 L1000,70 Q600,30 300,75 T0,65 Z" />
        </svg>

        {/* Copyright Text Layer */}
        <div className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-start px-6 z-20" dir="ltr">
          <div className="flex items-center gap-4 text-primary text-[10px] md:text-xs font-bold">
            <span className="opacity-90">© جت لنقل 2026</span>
            <Link href="#" className="hover:underline opacity-90 hover:opacity-100">إعدادات الكوكيز</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
