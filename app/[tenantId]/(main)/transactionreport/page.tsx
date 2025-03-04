"use client"

import { useEffect, useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { TransactionHeader } from './components/TransactionHeader'
import { TransactionSearchFilters } from './components/TransactionSearchFilters'
import { TransactionTable } from './components/TransactionTable'
import { TransactionPagination } from './components/TransactionPagination'

// Veri
import { mockTransactionData } from './data/mock-data'
import { useSalesTransactionsStore } from "@/stores/main/sales-transactions-store"
import { toast } from "@/components/ui/toast/use-toast"
import axios from "@/lib/axios"

export default function TransactionReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [isLoading, setIsLoading] = useState(true);
    const latestFilter = useTabStore.getState().getTabFilter(activeTab);
    const { salesTransactions, setSalesTransactions, selectedSalesTransaction, setSelectedSalesTransaction } = useSalesTransactionsStore();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                  const response = await axios.post(
                    "/api/main/transactiontable/transactiontable_customers",
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
                toast({
                    title: "Hata!",
                    description: "Kullanıcılar yüklenirken bir hata oluştu.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [selectedFilter,setSalesTransactions]);


    // Verileri filtrele
    const filteredTransactions = salesTransactions.filter(transaction => {
        const matchesSearch = 
            transaction.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.CheckNo.toLowerCase().includes(searchTerm.toLowerCase())

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
                    isLoading={isLoading}
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