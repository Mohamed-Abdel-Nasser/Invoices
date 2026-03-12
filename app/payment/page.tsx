"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  CreditCard, 
  Lock, 
  ChevronUp, 
  ChevronDown,
  ArrowLeft,
  Globe
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

// Mock data matching the invoice table
const ALL_INVOICES = [
  { id: "1", number: "1649746076", amount: 5.40 },
  { id: "2", number: "1648733810", amount: 4.95 },
  { id: "3", number: "1647744653", amount: 100.54 },
  { id: "4", number: "1646989626", amount: 29.16 },
  { id: "5", number: "1646964946", amount: 4.46 },
  { id: "6", number: "1646966036", amount: 13.17 },
  { id: "7", number: "1646722611", amount: 242.07 },
  { id: "8", number: "1645301157", amount: 140.95 },
  { id: "9", number: "1645288742", amount: 410.72 },
  { id: "10", number: "1645035048", amount: 3084.55 },
]

export default function PaymentPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-gray-500">Loading payment details...</div>}>
      <PaymentContent />
    </React.Suspense>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(true)
  const { t, language, toggleLanguage } = useLanguage()

  // Get selected invoices from URL
  const selectedIds = React.useMemo(() => {
    const ids = searchParams.get("ids")
    return ids ? new Set(ids.split(",")) : new Set<string>()
  }, [searchParams])

  // Filter invoices based on selection
  const selectedInvoices = React.useMemo(() => {
    if (selectedIds.size === 0) return ALL_INVOICES.slice(0, 3) // Fallback for demo
    return ALL_INVOICES.filter(inv => selectedIds.has(inv.id))
  }, [selectedIds])

  const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-left">
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Page Header */}
        <div className="mb-8 relative">
          <div className="absolute top-0 end-0">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
            >
              <Globe className="w-4 h-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5 me-2" />
            {t("Back")}
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("Pay Invoices")}</h1>
          <p className="text-gray-600">{t("Choose a payment method and pay your invoices here.")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN - Payment Form */}
          <div className="lg:col-span-8 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              
              {/* Payment Method Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-gray-800" />
                  <span className="font-bold text-lg text-gray-900">{t("Credit / Debit Card")}</span>
                </div>
              </div>

              <div className="p-8">
                <p className="text-sm text-gray-500 mb-6">{t("All fields are required unless otherwise noted.")}</p>

                <div className="space-y-6">
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{t("Card Number")}</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full ps-12 pe-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder=""
                      />
                      <div className="absolute start-3 top-1/2 -translate-y-1/2 opacity-50">
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-70" />
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 opacity-70" />
                    </div>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t("Expiry Date")}</label>
                      <div className="relative">
                         <input 
                          type="text" 
                          className="w-full ps-10 pe-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="MM / YY"
                        />
                        <div className="absolute start-3 top-1/2 -translate-y-1/2 opacity-50">
                           <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t("Security Code")}</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full ps-10 pe-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="CVC"
                        />
                        <div className="absolute start-3 top-1/2 -translate-y-1/2 opacity-50">
                           <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{t("Front of card MM/YY")}</p>
                      <p className="text-xs text-gray-500">{t("3 digits on back of card")}</p>
                    </div>
                  </div>

                  {/* Name on Card */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">{t("Name on Card")}</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>

                  {/* Save Card Checkbox */}
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      id="save-card"
                      type="checkbox" 
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="save-card" className="text-sm text-gray-700 cursor-pointer select-none">{t("Save for my next payment")}</label>
                  </div>

                  {/* Pay Button */}
                  <button className="w-full bg-[#0071C2] hover:bg-[#005999] text-white font-bold text-lg py-3 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 mt-4">
                    <Lock className="w-5 h-5" />
                    {t("Pay SAR")} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </button>

                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Summary */}
          <div className="lg:col-span-4 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div 
                className="px-6 py-5 border-b border-gray-100 flex justify-between items-center cursor-pointer lg:cursor-default"
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              >
                <h2 className="text-xl font-bold text-gray-900">{t("Invoice Summary")}</h2>
                <div className="lg:hidden text-gray-500">
                  {isSummaryOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {(isSummaryOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-0">
                      <div className="flex justify-between items-center px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <span className="font-bold text-gray-900">{t("Invoices")} ({selectedInvoices.length})</span>
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {selectedInvoices.map((inv) => (
                          <div key={inv.id} className="flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition-colors">
                            <span className="text-gray-600 font-mono text-sm">#{inv.number}</span>
                            <span className="text-gray-900 font-mono text-sm">{t("SAR")} {inv.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Green Total Bar */}
                      <div className="bg-[#008009] text-white px-6 py-4 flex justify-between items-center mt-2">
                        <span className="font-bold text-lg">{t("Total Amount")}</span>
                        <span className="font-bold text-lg">{t("SAR")} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}



function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
