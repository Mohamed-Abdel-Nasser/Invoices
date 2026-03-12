"use client"

import * as React from "react"
import { Download, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/components/language-provider"

import { FilterTag } from "./odoo-search-bar"

type InvoiceStatus = "Unpaid" | "Fully Paid" | "Partially Paid"

type Invoice = {
  id: string
  documentName: string
  number: string
  date: string
  period: string
  status: InvoiceStatus
  amount: number
  currency: string
}

const invoices: Invoice[] = [
  { id: "1", documentName: "Commission", number: "1649746076", date: "Mar 3 2026", period: "1 Feb 2026 - 28 Feb 2026", status: "Unpaid", amount: 5.40, currency: "SAR" },
  { id: "2", documentName: "Incorrect reporting", number: "1648733810", date: "Feb 7 2026", period: "1 Oct 2025 - 31 Oct 2025", status: "Unpaid", amount: 4.95, currency: "SAR" },
  { id: "3", documentName: "Commission", number: "1647744653", date: "Feb 3 2026", period: "1 Jan 2026 - 31 Jan 2026", status: "Partially Paid", amount: 100.54, currency: "SAR" },
  { id: "4", documentName: "Commission", number: "1646989626", date: "Jan 8 2026", period: "1 Nov 2025 - 30 Nov 2025", status: "Fully Paid", amount: 29.16, currency: "SAR" },
  { id: "5", documentName: "Incorrect reporting", number: "1646964946", date: "Jan 7 2026", period: "1 Oct 2025 - 31 Oct 2025", status: "Fully Paid", amount: 4.46, currency: "SAR" },
  { id: "6", documentName: "Incorrect reporting", number: "1646966036", date: "Jan 7 2026", period: "1 Nov 2025 - 30 Nov 2025", status: "Unpaid", amount: 13.17, currency: "SAR" },
  { id: "7", documentName: "Commission", number: "1646722611", date: "Jan 3 2026", period: "1 Dec 2025 - 31 Dec 2025", status: "Partially Paid", amount: 242.07, currency: "SAR" },
  { id: "8", documentName: "Incorrect reporting", number: "1645301157", date: "Dec 7 2025", period: "1 Nov 2025 - 30 Nov 2025", status: "Fully Paid", amount: 140.95, currency: "SAR" },
  { id: "9", documentName: "Incorrect reporting", number: "1645288742", date: "Dec 7 2025", period: "1 Oct 2025 - 31 Oct 2025", status: "Unpaid", amount: 410.72, currency: "SAR" },
  { id: "10", documentName: "Commission", number: "1645035048", date: "Dec 3 2025", period: "1 Nov 2025 - 30 Nov 2025", status: "Fully Paid", amount: 3084.55, currency: "SAR" },
]

const getStatusStyles = (status: InvoiceStatus) => {
  switch (status) {
    case "Fully Paid":
      return "bg-green-100 text-green-800"
    case "Partially Paid":
      return "bg-amber-100 text-amber-800"
    case "Unpaid":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function InvoiceTable({ query, activeFilters }: { query?: string, activeFilters?: FilterTag[] }) {
  const { t } = useLanguage()
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set())

  const filteredInvoices = React.useMemo(() => {
    let result = invoices

    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(inv => 
        inv.number.toLowerCase().includes(lowerQuery)
      )
    }

    if (activeFilters && activeFilters.length > 0) {
      const filterLabels = activeFilters.filter(f => f.type === "filter").map(f => f.label)
      
      if (filterLabels.length > 0) {
        const statusFilters = filterLabels.filter(l => ["Fully Paid", "Unpaid", "Partially Paid"].includes(l));
        const hasHighValue = filterLabels.includes("High Value (> 100 SAR)");

        result = result.filter(inv => {
          const matchesStatus = statusFilters.length === 0 || statusFilters.includes(inv.status);
          const matchesHighValue = !hasHighValue || inv.amount > 100;
          return matchesStatus && matchesHighValue;
        });
      }

      const groupByFilters = activeFilters.filter(f => f.type === "groupby").map(f => f.label)
      if (groupByFilters.length > 0) {
        result = [...result].sort((a, b) => {
          for (const label of groupByFilters) {
            if (label === "Status") {
              if (a.status !== b.status) return a.status.localeCompare(b.status)
            }
            if (label === "Invoice Type") {
              if (a.documentName !== b.documentName) return a.documentName.localeCompare(b.documentName)
            }
            if (label === "Period") {
              if (a.period !== b.period) return a.period.localeCompare(b.period)
            }
            if (label === "Date") {
              if (a.date !== b.date) return a.date.localeCompare(b.date)
            }
          }
          return 0
        })
      }
    }

    return result
  }, [query, activeFilters])

  const groupByFilters = activeFilters?.filter(f => f.type === "groupby").map(f => f.label) || []

  type GroupNode = {
    id: string;
    label: string;
    level: number;
    invoices: Invoice[];
    children?: GroupNode[];
  };

  const buildGroups = (invoicesToGroup: Invoice[], groupKeys: string[], level: number, parentId: string): GroupNode[] => {
    if (groupKeys.length === 0) return [];
    const currentKey = groupKeys[0];
    const remainingKeys = groupKeys.slice(1);
    
    const groups: Record<string, Invoice[]> = {};
    invoicesToGroup.forEach(inv => {
      let val = "Other";
      if (currentKey === "Status") val = inv.status;
      if (currentKey === "Invoice Type") val = inv.documentName;
      if (currentKey === "Period") val = inv.period;
      if (currentKey === "Date") val = inv.date;
      
      if (!groups[val]) groups[val] = [];
      groups[val].push(inv);
    });

    return Object.entries(groups).map(([val, groupInvoices]) => {
      const id = parentId ? `${parentId}-${val}` : val;
      const node: GroupNode = {
        id,
        label: val,
        level,
        invoices: groupInvoices,
      };
      if (remainingKeys.length > 0) {
        node.children = buildGroups(groupInvoices, remainingKeys, level + 1, id);
      }
      return node;
    });
  };

  const groupedInvoices = React.useMemo(() => {
    if (groupByFilters.length === 0) return null;
    return buildGroups(filteredInvoices, groupByFilters, 0, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInvoices, activeFilters]);

  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    if (groupedInvoices) {
      const allIds = new Set<string>();
      const collectIds = (nodes: GroupNode[]) => {
        nodes.forEach(n => {
          allIds.add(n.id);
          if (n.children) collectIds(n.children);
        });
      };
      collectIds(groupedInvoices);
      setExpandedGroups(allIds);
    } else {
      setExpandedGroups(new Set());
    }
  }, [groupedInvoices])

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedGroups(newExpanded)
  }

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
  }

  const toggleAll = () => {
    if (selectedRows.size === filteredInvoices.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredInvoices.map(i => i.id)))
    }
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const selectedAmount = filteredInvoices
    .filter(inv => selectedRows.has(inv.id))
    .reduce((sum, inv) => sum + inv.amount, 0)

  const paymentUrl = React.useMemo(() => {
    const params = new URLSearchParams()
    if (selectedRows.size > 0) {
      params.set("ids", Array.from(selectedRows).join(","))
      return `/payment?${params.toString()}`
    }
    return "#"
  }, [selectedRows])

  const renderTableHeader = (invoicesToSelect: Invoice[], isGrouped: boolean = false) => {
    const allSelected = invoicesToSelect.length > 0 && invoicesToSelect.every(inv => selectedRows.has(inv.id));
    return (
      <div className={cn(
        "grid grid-cols-[40px_1.2fr_1.5fr_1fr_1.8fr_1.2fr_1fr_0.8fr] gap-4 px-6 py-4 text-sm font-bold text-gray-900",
        isGrouped ? "bg-white border-b border-gray-200" : "bg-gray-50 border-b border-gray-900"
      )}>
        <div className="flex items-center justify-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={allSelected}
            onChange={() => {
              const newSelected = new Set(selectedRows);
              if (allSelected) {
                invoicesToSelect.forEach(inv => newSelected.delete(inv.id));
              } else {
                invoicesToSelect.forEach(inv => newSelected.add(inv.id));
              }
              setSelectedRows(newSelected);
            }}
          />
        </div>
        <div className="flex items-center cursor-pointer hover:text-gray-700">{t("Invoice Number")} <ArrowUpDown className="w-3.5 h-3.5 ms-1" /></div>
        <div className="flex items-center cursor-pointer hover:text-gray-700">{t("Invoice Type")}</div>
        <div className="flex items-center cursor-pointer hover:text-gray-700">{t("Date")}</div>
        <div className="flex items-center cursor-pointer hover:text-gray-700">{t("Period")}</div>
        <div className="flex items-center cursor-pointer hover:text-gray-700">{t("Status")}</div>
        <div className="flex items-center justify-end cursor-pointer hover:text-gray-700">{t("Amount (SAR)")}</div>
        <div className="flex items-center justify-center cursor-pointer hover:text-gray-700">{t("Action")}</div>
      </div>
    );
  }

  const renderTableRow = (invoice: Invoice) => (
    <div 
      key={invoice.id} 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleRow(invoice.id);
        }
      }}
      className={cn(
        "grid grid-cols-[40px_1.2fr_1.5fr_1fr_1.8fr_1.2fr_1fr_0.8fr] gap-4 px-6 py-5 items-center text-base hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
        selectedRows.has(invoice.id) ? "bg-blue-50/50" : "bg-white"
      )}
    >
      <div className="flex items-center justify-center">
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          checked={selectedRows.has(invoice.id)}
          onChange={() => toggleRow(invoice.id)}
        />
      </div>

      <div className="flex items-center text-blue-600 font-medium cursor-pointer hover:underline">
        {invoice.number}
      </div>

      <div className="text-gray-900">{t(invoice.documentName as any)}</div>
      
      <div className="text-gray-900">{invoice.date}</div>
      
      <div className="text-gray-900">{invoice.period}</div>
      
      <div className="flex items-center">
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded text-xs font-medium",
          getStatusStyles(invoice.status)
        )}>
          {t(invoice.status as any)}
        </span>
      </div>
      
      <div className={cn(
        "text-right font-medium",
        invoice.status === "Unpaid" ? "text-red-600" : "text-gray-900"
      )}>
        {t("SAR")} {invoice.amount.toFixed(2)}
      </div>

      <div className="flex items-center justify-center text-sm">
        <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
          {t("PDF")} <Download className="w-4 h-4 ms-1" />
        </button>
      </div>
    </div>
  )

  const renderGroup = (group: GroupNode) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;
    
    return (
      <div key={group.id} className={cn("w-full bg-white overflow-hidden", group.level === 0 ? "border border-gray-400 rounded-md shadow-sm mb-4" : "border-t border-gray-200")}>
        <div 
          className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          style={{ paddingLeft: `${(group.level * 1.5) + 1}rem` }}
          onClick={() => toggleGroup(group.id)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleGroup(group.id);
            }
          }}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500 me-2" /> : <ChevronRight className="w-4 h-4 text-gray-500 me-2" />}
          <span className="font-bold text-gray-900 text-base">{t(group.label as any)}</span>
          <span className="ms-2 text-gray-500 font-medium text-sm">({group.invoices.length})</span>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-300">
            {hasChildren ? (
              <div className="bg-gray-50/50">
                {group.children!.map(child => renderGroup(child))}
              </div>
            ) : (
              <>
                {renderTableHeader(group.invoices, true)}
                <div className="divide-y divide-gray-200">
                  {group.invoices.map(renderTableRow)}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {groupByFilters.length > 0 && groupedInvoices ? (
        <div className="w-full">
          {groupedInvoices.map(group => renderGroup(group))}
        </div>
      ) : (
        <div className="w-full bg-white border border-gray-300 shadow-sm">
          {renderTableHeader(filteredInvoices)}
          <div className="divide-y divide-gray-200">
            {filteredInvoices.map(renderTableRow)}
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600 bg-gray-50">
            <div className="flex items-center gap-6">
              <span>1-{filteredInvoices.length} of {filteredInvoices.length} {t("results")}</span>
              <div className="flex items-center gap-2">
                {t("Show")}
                <button className="px-3 py-1.5 border border-gray-300 rounded flex items-center bg-white hover:bg-gray-50 transition-colors">
                  10 <ChevronDown className="w-4 h-4 ms-1" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white flex items-center disabled:opacity-50 transition-colors" disabled>
                <ChevronLeft className="w-4 h-4 me-1" /> {t("Previous")}
              </button>
              <span className="font-medium text-gray-900 px-2">{t("Page 1")}</span>
              <button className="px-3 py-1.5 border border-gray-300 rounded hover:bg-white flex items-center disabled:opacity-50 transition-colors" disabled>
                {t("Next")} <ChevronRight className="w-4 h-4 ms-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement Totals & Actions Box */}
      <div className="border border-gray-900 p-6 bg-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-gray-900 text-lg">
            {t("Statement totals:")}
          </div>
          {selectedRows.size > 0 && (
            <div className="text-sm text-blue-600 font-medium">
              {selectedRows.size} {selectedRows.size !== 1 ? t("invoices selected") : t("invoice selected")}
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 w-full md:w-auto">
          <div className="flex flex-col items-end gap-1">
            <div className="text-gray-600 text-sm">{t("Total Amount")}</div>
            <div className="font-bold text-gray-900 text-xl">{t("SAR")} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          </div>
          
          {selectedRows.size > 0 && (
            <div className="flex flex-col items-end gap-1 animate-in fade-in slide-in-from-end-4 duration-300">
              <div className="text-blue-600 text-sm font-medium">{t("Selected Amount")}</div>
              <div className="font-bold text-blue-600 text-xl">{t("SAR")} {selectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
          )}

          <Link 
            href={paymentUrl}
            className={cn(
              "px-8 py-3 rounded-md font-bold text-white transition-all shadow-md active:scale-95 min-w-[180px] flex items-center justify-center",
              selectedRows.size > 0 
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" 
                : "bg-gray-300 cursor-not-allowed pointer-events-none"
            )}
            aria-disabled={selectedRows.size === 0}
            onClick={(e) => {
               if (selectedRows.size === 0) e.preventDefault()
            }}
          >
            {t("Proceed to Pay")}
          </Link>
        </div>
      </div>
    </div>
  )
}
