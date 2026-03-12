"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "ar"

const translations = {
  en: {
    "Invoices": "Invoices",
    "Search...": "Search...",
    "Filters": "Filters",
    "Group By": "Group By",
    "Favorites": "Favorites",
    "Invoice Number": "Invoice Number",
    "Invoice Type": "Invoice Type",
    "Date": "Date",
    "Period": "Period",
    "Status": "Status",
    "Amount (SAR)": "Amount (SAR)",
    "Action": "Action",
    "PDF": "PDF",
    "Unpaid": "Unpaid",
    "Fully Paid": "Fully Paid",
    "Partially Paid": "Partially Paid",
    "Commission": "Commission",
    "Incorrect reporting": "Incorrect reporting",
    "Statement totals:": "Statement totals:",
    "invoice selected": "invoice selected",
    "invoices selected": "invoices selected",
    "Total Amount": "Total Amount",
    "Selected Amount": "Selected Amount",
    "Proceed to Pay": "Proceed to Pay",
    "results": "results",
    "Show": "Show",
    "Previous": "Previous",
    "Next": "Next",
    "Page 1": "Page 1",
    "Pay Invoices": "Pay Invoices",
    "Choose a payment method and pay your invoices here.": "Choose a payment method and pay your invoices here.",
    "Back": "Back",
    "Credit / Debit Card": "Credit / Debit Card",
    "All fields are required unless otherwise noted.": "All fields are required unless otherwise noted.",
    "Card Number": "Card Number",
    "Expiry Date": "Expiry Date",
    "Security Code": "Security Code",
    "Front of card MM/YY": "Front of card MM/YY",
    "3 digits on back of card": "3 digits on back of card",
    "Name on Card": "Name on Card",
    "Save for my next payment": "Save for my next payment",
    "Pay SAR": "Pay SAR",
    "Invoice Summary": "Invoice Summary",
    "High Value (> 100 SAR)": "High Value (> 100 SAR)",
    "Other": "Other",
    "Search name...": "Search name...",
    "Save": "Save",
    "Cancel": "Cancel",
    "Save current search": "Save current search",
    "SAR": "SAR"
  },
  ar: {
    "Invoices": "الفواتير",
    "Search...": "بحث...",
    "Filters": "تصفية",
    "Group By": "تجميع حسب",
    "Favorites": "المفضلة",
    "Invoice Number": "رقم الفاتورة",
    "Invoice Type": "نوع الفاتورة",
    "Date": "التاريخ",
    "Period": "الفترة",
    "Status": "الحالة",
    "Amount (SAR)": "المبلغ (ر.س)",
    "Action": "إجراء",
    "PDF": "بي دي إف",
    "Unpaid": "غير مدفوع",
    "Fully Paid": "مدفوع بالكامل",
    "Partially Paid": "مدفوع جزئياً",
    "Commission": "عمولة",
    "Incorrect reporting": "تقرير غير صحيح",
    "Statement totals:": "إجمالي الكشف:",
    "invoice selected": "فاتورة محددة",
    "invoices selected": "فواتير محددة",
    "Total Amount": "المبلغ الإجمالي",
    "Selected Amount": "المبلغ المحدد",
    "Proceed to Pay": "متابعة الدفع",
    "results": "نتائج",
    "Show": "عرض",
    "Previous": "السابق",
    "Next": "التالي",
    "Page 1": "صفحة 1",
    "Pay Invoices": "دفع الفواتير",
    "Choose a payment method and pay your invoices here.": "اختر طريقة الدفع وادفع فواتيرك هنا.",
    "Back": "رجوع",
    "Credit / Debit Card": "بطاقة ائتمان / خصم",
    "All fields are required unless otherwise noted.": "جميع الحقول مطلوبة ما لم يذكر خلاف ذلك.",
    "Card Number": "رقم البطاقة",
    "Expiry Date": "تاريخ الانتهاء",
    "Security Code": "رمز الأمان",
    "Front of card MM/YY": "أمام البطاقة شهر/سنة",
    "3 digits on back of card": "3 أرقام خلف البطاقة",
    "Name on Card": "الاسم على البطاقة",
    "Save for my next payment": "حفظ لدفعتي القادمة",
    "Pay SAR": "دفع ر.س",
    "Invoice Summary": "ملخص الفواتير",
    "High Value (> 100 SAR)": "قيمة عالية (> 100 ر.س)",
    "Other": "أخرى",
    "Search name...": "اسم البحث...",
    "Save": "حفظ",
    "Cancel": "إلغاء",
    "Save current search": "حفظ البحث الحالي",
    "SAR": "ر.س"
  }
}

type LanguageContextType = {
  language: Language
  toggleLanguage: () => void
  t: (key: keyof typeof translations.en) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLang = localStorage.getItem("app-lang") as Language
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(savedLang)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
    localStorage.setItem("app-lang", language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "ar" : "en"))
  }

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
