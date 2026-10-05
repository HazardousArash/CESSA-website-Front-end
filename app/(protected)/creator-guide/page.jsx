"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, CheckCircle2 } from "lucide-react";

export default function CreatorGuidePage() {
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      q: "چگونه در پست‌ها عکس قرار دهیم؟",
      a: "شما می‌توانید عکس‌ها را در سرویس‌های آپلود عکس رایگان (مثل uupload.ir) آپلود کرده و سپس در فیلد محتوای پست، کد HTML آن را به شکل زیر قرار دهید:\n\n<a href='لینک'><img src='لینک مستقیم عکس' border='0' /></a>"
    },
    {
      q: "چگونه وضعیت ثبت‌نام دانشجویان را بررسی کنم؟",
      a: "در داشبورد خود، در بخش «رویدادهای پیش‌رو»، روی دکمه نارنجی‌رنگ «پنل مدیریت ثبت‌نام‌ها» کلیک کنید. در این بخش می‌توانید رسید پرداخت دانشجو را مشاهده کرده و ثبت‌نام وی را تایید یا رد کنید."
    },
    {
      q: "آیا می‌توانم رویداد یا پستی را که منتشر کرده‌ام ویرایش کنم؟",
      a: "بله. در داشبورد خود در کنار عنوان هر پست یا رویدادی که مالک آن هستید، آیکون ویرایش (قلم) و حذف (سطل زباله) قرار دارد."
    },
    {
      q: "لینک‌های مرتبط پست‌ها چگونه کار می‌کنند؟",
      a: "در زمان ایجاد پست، سه فیلد با نام‌های «لینک پیوست» وجود دارد. می‌توانید لینک اسلایدها، ویدیوهای یوتوب یا فایل‌های تمرینی را در آنجا قرار دهید تا به صورت دکمه در انتهای پست برای دانشجویان نمایش داده شود."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
          <BookOpen className="text-cyber-teal w-8 h-8 md:w-9 md:h-9 shrink-0" />
          <span>راهنمای تولیدکنندگان محتوا</span>
        </h2>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-4 pt-2">
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-panel border-white/10 rounded-2xl overflow-hidden transition-all">
            <button 
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)} 
              className="w-full p-6 text-right flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer gap-4"
            >
              <span className="font-bold text-white text-base md:text-lg flex items-center gap-3">
                <CheckCircle2 size={22} className="text-cyber-teal shrink-0" />
                <span>{faq.q}</span>
              </span>
              <ChevronDown 
                size={22} 
                className={`text-gray-400 shrink-0 transition-transform duration-300 ${
                  openIdx === idx ? 'rotate-180 text-cyber-teal' : ''
                }`} 
              />
            </button>

            {openIdx === idx && (
              <div className="p-6 pt-0 border-t border-white/5 bg-dark-900/50">
                <p className="text-base md:text-lg text-gray-200 leading-9 md:leading-10 whitespace-pre-line mt-4 dir-auto">
                  {faq.a}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}