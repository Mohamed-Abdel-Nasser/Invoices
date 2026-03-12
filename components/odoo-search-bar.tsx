"use client"

import * as React from "react"
import { Search, X, ChevronDown, Filter, Layers, Star, Plus, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

export type FilterTag = {
  id: string
  label: string
  type: "filter" | "groupby"
}

export type SavedSearch = {
  id: string
  name: string
  query: string
  filters: FilterTag[]
}

interface OdooSearchBarProps {
  query: string
  setQuery: (query: string) => void
  activeFilters: FilterTag[]
  setActiveFilters: React.Dispatch<React.SetStateAction<FilterTag[]>>
}

export function OdooSearchBar({ query, setQuery, activeFilters, setActiveFilters }: OdooSearchBarProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const [savedSearches, setSavedSearches] = React.useState<SavedSearch[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [newSearchName, setNewSearchName] = React.useState("")

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const removeFilter = (id: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== id))
  }

  const addFilter = (label: string, type: "filter" | "groupby") => {
    setActiveFilters(prev => {
      if (prev.some(f => f.label === label && f.type === type)) return prev
      return [...prev, { id: crypto.randomUUID(), label, type }]
    })
  }

  const handleSaveSearch = () => {
    if (!newSearchName.trim()) return
    setSavedSearches(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newSearchName,
        query,
        filters: activeFilters
      }
    ])
    setIsSaving(false)
    setNewSearchName("")
  }

  const applySavedSearch = (search: SavedSearch) => {
    setQuery(search.query)
    setActiveFilters(search.filters)
    setIsOpen(false)
  }

  const removeSavedSearch = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSavedSearches(prev => prev.filter(s => s.id !== id))
  }

  const handleMenuItemKeyDown = (e: React.KeyboardEvent<HTMLElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const items = Array.from(containerRef.current?.querySelectorAll('[role="menuitem"]') || []) as HTMLElement[]
      const currentIndex = items.indexOf(e.currentTarget)
      let nextIndex = e.key === 'ArrowDown' ? currentIndex + 1 : currentIndex - 1
      if (nextIndex >= items.length) nextIndex = 0
      if (nextIndex < 0) nextIndex = items.length - 1
      items[nextIndex]?.focus()
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      const input = containerRef.current?.querySelector('input[type="text"]') as HTMLElement
      input?.focus()
    }
  }

  return (
    <div className="relative w-full z-50" ref={containerRef}>
      {/* Search Input Bar */}
      <div 
        className={cn(
          "flex items-center min-h-[44px] w-full bg-white border rounded-md transition-all duration-200",
          isOpen ? "border-purple-500 ring-1 ring-purple-500" : "border-gray-300 hover:border-gray-400"
        )}
        onClick={() => setIsOpen(true)}
      >
        <div className="ps-3 pe-2 text-gray-400">
          <Search className="w-5 h-5" />
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1 py-1.5">
          {activeFilters.map(filter => (
            <span 
              key={filter.id}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium animate-in fade-in zoom-in duration-200",
                filter.type === "groupby" 
                  ? "bg-[#1F2937] text-white" 
                  : "bg-indigo-100 text-indigo-800"
              )}
            >
              {filter.type === "groupby" && <Layers className="w-3.5 h-3.5 me-1.5 opacity-70" />}
              {t(filter.label as any)}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFilter(filter.id)
                }}
                className={cn(
                  "ms-1.5 rounded-full p-0.5 transition-colors",
                  filter.type === "groupby" ? "hover:bg-white/20" : "hover:bg-black/5"
                )}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setIsOpen(true)
                setTimeout(() => {
                  const firstItem = containerRef.current?.querySelector('[role="menuitem"]') as HTMLElement
                  firstItem?.focus()
                }, 50)
              }
              if (e.key === 'Escape') {
                setIsOpen(false)
              }
            }}
            placeholder={t("Search...")}
            className="flex-1 min-w-[120px] outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent h-7"
          />
        </div>

        <button 
          className="p-2 m-1 rounded-md text-gray-400 hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(!isOpen)
          }}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full start-0 end-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[300px]"
          >
            {/* Filters Column */}
            <div className="flex-1 p-2 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center px-3 py-2 text-gray-500 font-bold text-xs tracking-wider uppercase mb-1">
                <Filter className="w-3 h-3 me-2" />
                {t("Filters")}
              </div>
              <div className="space-y-0.5">
                {["Fully Paid", "Unpaid", "Partially Paid", "High Value (> 100 SAR)"].map((item) => (
                  <button
                    key={item}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => addFilter(item, "filter")}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, () => addFilter(item, "filter"))}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none rounded-md transition-colors"
                  >
                    {t(item as any)}
                  </button>
                ))}
              </div>
            </div>

            {/* Group By Column */}
            <div className="flex-1 p-2 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center px-3 py-2 text-gray-500 font-bold text-xs tracking-wider uppercase mb-1">
                <Layers className="w-3 h-3 me-2" />
                {t("Group By")}
              </div>
              <div className="space-y-0.5">
                {["Invoice Type", "Date", "Period", "Status"].map((item) => (
                  <button
                    key={item}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => addFilter(item, "groupby")}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, () => addFilter(item, "groupby"))}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none rounded-md transition-colors"
                  >
                    {t(item as any)}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorites Column */}
            <div className="flex-1 p-2">
              <div className="flex items-center px-3 py-2 text-gray-500 font-bold text-xs tracking-wider uppercase mb-1">
                <Star className="w-3 h-3 me-2" />
                {t("Favorites")}
              </div>
              <div className="space-y-0.5">
                {savedSearches.map((search) => (
                  <button
                    key={search.id}
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => applySavedSearch(search)}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, () => applySavedSearch(search))}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none rounded-md transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{search.name}</span>
                    <div 
                      onClick={(e) => removeSavedSearch(e, search.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-gray-500" />
                    </div>
                  </button>
                ))}

                {savedSearches.length > 0 && <div className="h-px bg-gray-100 my-1" />}

                {isSaving ? (
                  <div className="p-2 space-y-2 bg-gray-50 rounded-md border border-gray-200">
                    <input
                      type="text"
                      value={newSearchName}
                      onChange={(e) => setNewSearchName(e.target.value)}
                      placeholder={t("Search name...")}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveSearch()
                        if (e.key === "Escape") setIsSaving(false)
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleSaveSearch}
                        disabled={!newSearchName.trim()}
                        className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {t("Save")}
                      </button>
                      <button 
                        onClick={() => setIsSaving(false)}
                        className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                      >
                        {t("Cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => setIsSaving(true)}
                    onKeyDown={(e) => handleMenuItemKeyDown(e, () => setIsSaving(true))}
                    className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none rounded-md transition-colors flex items-center justify-between group"
                  >
                    {t("Save current search")}
                    <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
