"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { BalanceHeader } from './components/BalanceHeader'
import { BalanceSearchFilters } from './components/BalanceSearchFilters'
import { BalanceTable } from './components/BalanceTable'
import { BalancePagination } from './components/BalancePagination'

// Veri
import { mockBalanceData } from './data/mock-data'

export default function BalanceReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Verileri filtrele
    const filteredBalances = mockBalanceData.filter(balance => {
        const matchesSearch = 
            balance.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            balance.phone.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    // Sayfalama
    const totalBalances = filteredBalances.length
    const totalPages = Math.ceil(totalBalances / itemsPerPage)
    const paginatedBalances = filteredBalances.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <BalanceHeader 
                filteredBalances={filteredBalances} 
            />
            
            <BalanceSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <BalanceTable 
                    paginatedBalances={paginatedBalances}
                />
                
                <BalancePagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalBalances={totalBalances}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}