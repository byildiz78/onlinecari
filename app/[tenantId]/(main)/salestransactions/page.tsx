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
import React from "react"
import axios from "@/lib/axios"
import { useSalesTransactionsStore } from "@/stores/main/sales-transactions-store"
import { toast } from "@/components/ui/toast/use-toast"

export default function SalesTransactionsPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [isLoading, setIsLoading] = React.useState(true);
    const latestFilter = useTabStore.getState().getTabFilter(activeTab);
    const { salesTransactions, setSalesTransactions, selectedSalesTransaction, setSelectedSalesTransaction } = useSalesTransactionsStore();

    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                  const response = await axios.post(
                    "/api/main/salestransactions/main_salestransactions_customers",
                    {
                        date1: latestFilter?.date?.from,
                        date2: latestFilter?.date?.to,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                )
                setSalesTransactions(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                
                // API'den 404 hatası geldiğinde (veri bulunamadı)
                if (error.response && error.response.status === 404) {
                    toast({
                        title: "Bilgi",
                        description: "Seçilen tarih aralığında herhangi bir satış işlemi bulunamadı. Lütfen farklı bir tarih aralığı seçin.",
                        variant: "default",
                    });
                } else {
                    // Diğer hatalar için
                    toast({
                        title: "Hata!",
                        description: "Satış işlemleri verilerini alırken bir sorun oluştu. Lütfen tekrar deneyin.",
                        variant: "destructive",
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [selectedFilter,setSalesTransactions]);


    // Verileri filtrele
    const filteredTransactions = salesTransactions.filter(transaction => {
        const matchesSearch = 
            transaction?.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction?.CheckNo.toLowerCase().includes(searchTerm.toLowerCase())

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
                    isLoading={isLoading}
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