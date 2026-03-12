"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  t: (key: string) => string
}

const translations = {
  en: {
    invoices: "Invoices",
    search: "Search...",
    filters: "Filters",
    groupBy: "Group By",
    favorites: "Favorites",
    fullyPaid: "Fully Paid",
    unpaid: "Unpaid",
    partiallyPaid: "Partially Paid",
    highValue: "High Value (> 100 SAR)",
    invoiceType: "Invoice Type",
    date: "Date",
    period: "Period",
    status: "Status",
    saveCurrentSearch: "Save current search",
    save: "Save",
    cancel: "Cancel",
    searchName: "Search name...",
    invoiceNumber: "Invoice Number",
    amount: "Amount",
    actions: "Actions",
    paySelected: "Pay Selected",
    pay: "Pay",
    noInvoicesFound: "No invoices found matching your criteria.",
    paymentDetails: "Payment Details",
    back: "Back",
    payInvoices: "Pay Invoices",
    choosePaymentMethod: "Choose a payment method and pay your invoices here.",
    creditDebitCard: "Credit / Debit Card",
    allFieldsRequired: "All fields are required unless otherwise noted.",
    cardNumber: "Card Number",
    expiryDate: "Expiry Date",
    securityCode: "Security Code",
    nameOnCard: "Name on Card",
    saveForNextPayment: "Save for my next payment",
    invoiceSummary: "Invoice Summary",
    totalAmount: "Total Amount",
    sar: "SAR",
    frontOfCard: "Front of card MM/YY",
    backOfCard: "3 digits on back of card",
  },
  ar: {
    invoices: "الفواتير",
    search: "بحث...",
    filters: "تصفية",
    groupBy: "تجميع حسب",
    favorites: "المفضلة",
    fullyPaid: "مدفوعة بالكامل",
    unpaid: "غير مدفوعة",
    partiallyPaid: "مدفوعة جزئياً",
    highValue: "قيمة عالية (> 100 ريال)",
    invoiceType: "نوع الفاتورة",
    date: "التاريخ",
    period: "الفترة",
    status: "الحالة",
    saveCurrentSearch: "حفظ البحث الحالي",
    save: "حفظ",
    cancel: "إلغاء",
    searchName: "اسم البحث...",
    invoiceNumber: "رقم الفاتورة",
    amount: "المبلغ",
    actions: "الإجراءات",
    paySelected: "دفع المحدد",
    pay: "دفع",
    noInvoicesFound: "لم يتم العثور على فواتير تطابق معاييرك.",
    paymentDetails: "تفاصيل الدفع",
    back: "رجوع",
    payInvoices: "دفع الفواتير",
    choosePaymentMethod: "اختر طريقة الدفع وادفع فواتيرك هنا.",
    creditDebitCard: "بطاقة ائتمان / خصم",
    allFieldsRequired: "جميع الحقول مطلوبة ما لم يذكر خلاف ذلك.",
    cardNumber: "رقم البطاقة",
    expiryDate: "تاريخ الانتهاء",
    securityCode: "رمز الأمان",
    nameOnCard: "الاسم على البطاقة",
    saveForNextPayment: "حفظ لدفعتي القادمة",
    invoiceSummary: "ملخص الفاتورة",
    totalAmount: "المبلغ الإجمالي",
    sar: "ريال",
    frontOfCard: "واجهة البطاقة شهر/سنة",
    backOfCard: "3 أرقام خلف البطاقة",
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language") as Language
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLanguage(savedLang)
    } else {
      // Check browser language
      const browserLang = navigator.language
      if (browserLang.startsWith("ar")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguage("ar")
      }
    }
  }, [])

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language
    localStorage.setItem("app-language", language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "ar" : "en")
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k]
      } else {
        return key // Fallback to key if translation not found
      }
    }
    return value as string
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
