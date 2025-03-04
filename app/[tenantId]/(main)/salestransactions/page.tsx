"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { SalesHeader } from './components/SalesHeader'
import { SalesSearchFilters } from './components/SalesSearchFilters'
import { SalesTable } from './components/SalesTable'
import { SalesPagination } from './components/SalesPagination'

// Veri
import { mockSalesTransactions } from './data/mock-data'

export default function SalesTransactionsPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Verileri filtrele
    const filteredTransactions = mockSalesTransactions.filter(transaction => {
        const matchesSearch = 
            transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.documentNo.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    // Sayfalama
    const totalTransactions = filteredTransactions.length
    const totalPages = Math.ceil(totalTransactions / itemsPerPage)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <SalesHeader 
                filteredTransactions={filteredTransactions} 
            />

            <SalesSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <SalesTable 
                    paginatedTransactions={paginatedTransactions}
                />
                
                <SalesPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalTransactions={totalTransactions}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}