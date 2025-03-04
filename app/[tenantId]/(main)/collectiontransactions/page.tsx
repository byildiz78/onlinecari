"use client"

import { useEffect, useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'

// Bileşenler
import { CollectionHeader } from './components/CollectionHeader'
import { CollectionSearchFilters } from './components/CollectionSearchFilters'
import { CollectionTable } from './components/CollectionTable'
import { CollectionPagination } from './components/CollectionPagination'

// Veri
import { mockCollectionTransactions } from './data/mock-data'
import { useCollectionTransactionsStore } from "@/stores/main/collection-transactions-store"
import axios from "@/lib/axios"
import { toast } from "@/components/ui/toast/use-toast"

export default function CollectionTransactionsPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [isLoading, setIsLoading] = useState(true);
    const latestFilter = useTabStore.getState().getTabFilter(activeTab);
    const { collectionTransactions, setCollectionTransactions, selectedCollectionTransaction, setSelectedCollectionTransaction } = useCollectionTransactionsStore();

    
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                  const response = await axios.post(
                    "/api/main/collectiontransactions/collection_transactions_customers",
                    {
                        date1: latestFilter?.date?.from,
                        date2: latestFilter?.date?.to,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                )
                setCollectionTransactions(response.data);
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
    }, [selectedFilter,setCollectionTransactions]);

    // Verileri filtrele
    const filteredTransactions = collectionTransactions.filter(transaction => {
        const matchesSearch = 
            transaction.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.SaleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.PaymentType.toLowerCase().includes(searchTerm.toLowerCase())
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
                    isLoading={isLoading}
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