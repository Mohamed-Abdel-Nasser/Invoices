"use client"

import * as React from "react"
import { OdooSearchBar, FilterTag } from "@/components/odoo-search-bar"
import { InvoiceTable } from "@/components/invoice-table"
import { Settings, Bell, HelpCircle, User, Menu, Globe } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function Page() {
  const [query, setQuery] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<FilterTag[]>([])
  const { t, language, toggleLanguage } = useLanguage()

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t("Invoices")}</h1>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        {/* Search Bar Section */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-full max-w-3xl">
            <OdooSearchBar 
              query={query} 
              setQuery={setQuery} 
              activeFilters={activeFilters} 
              setActiveFilters={setActiveFilters} 
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <InvoiceTable query={query} activeFilters={activeFilters} />
        </div>
      </main>
    </div>
  )
}
