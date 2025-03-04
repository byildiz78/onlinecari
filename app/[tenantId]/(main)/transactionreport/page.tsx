"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { TransactionHeader } from './components/TransactionHeader'
import { TransactionSearchFilters } from './components/TransactionSearchFilters'
import { TransactionTable } from './components/TransactionTable'
import { TransactionPagination } from './components/TransactionPagination'

// Veri
import { mockTransactionData } from './data/mock-data'

export default function TransactionReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Verileri filtrele
    const filteredTransactions = mockTransactionData.filter(transaction => {
        const matchesSearch = 
            transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <TransactionHeader 
                filteredTransactions={filteredTransactions} 
            />
            
            <TransactionSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <TransactionTable 
                    paginatedTransactions={paginatedTransactions}
                />
                
                <TransactionPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalTransactions={totalTransactions}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}