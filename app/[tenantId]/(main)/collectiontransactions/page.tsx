"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { CollectionHeader } from './components/CollectionHeader'
import { CollectionSearchFilters } from './components/CollectionSearchFilters'
import { CollectionTable } from './components/CollectionTable'
import { CollectionPagination } from './components/CollectionPagination'

// Veri
import { mockCollectionTransactions } from './data/mock-data'

export default function CollectionTransactionsPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Verileri filtrele
    const filteredTransactions = mockCollectionTransactions.filter(transaction => {
        const matchesSearch = 
            transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase())

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
            <CollectionHeader 
                filteredTransactions={filteredTransactions} 
            />
            
            <CollectionSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <CollectionTable 
                    paginatedTransactions={paginatedTransactions}
                />
                
                <CollectionPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalTransactions={totalTransactions}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </div>
    )
}