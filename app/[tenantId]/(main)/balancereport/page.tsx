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
import React from "react"
import axios from "@/lib/axios"
import { toast } from "@/components/ui/toast/use-toast"
import { useBalanceCustomersStore } from "@/stores/main/balance-customers-store"

export default function BalanceReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const [isLoading, setIsLoading] = React.useState(true);
    const { balanceCustomers, setBalanceCustomers, selectedBalanceCustomer, setSelectedBalanceCustomer } = useBalanceCustomersStore();
    const latestFilter = useTabStore.getState().getTabFilter(activeTab);


    // Verileri yükle
    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                  const response = await axios.post(
                    "/api/main/balances/main_balance_customers",
                    {
                        date1: latestFilter?.date?.from,
                        date2: latestFilter?.date?.to,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                )
                console.log('1',latestFilter?.date?.from);
                console.log('2',latestFilter?.date?.to);

                setBalanceCustomers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                
                // API'den 404 hatası geldiğinde (veri bulunamadı)
                if (error.response && error.response.status === 404) {
                    toast({
                        title: "Bilgi",
                        description: "Seçilen tarih aralığında herhangi bir bakiye verisi bulunamadı. Lütfen farklı bir tarih aralığı seçin.",
                        variant: "default",
                    });
                } else {
                    // Diğer hatalar için
                    toast({
                        title: "Hata!",
                        description: "Bakiye raporu verilerini alırken bir sorun oluştu. Lütfen tekrar deneyin.",
                        variant: "destructive",
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [selectedFilter,setBalanceCustomers]);

    // Verileri filtrele
    const filteredBalances = balanceCustomers.filter(balance => {
        const matchesSearch = 
            balance?.CustomerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            balance?.PhoneNumber.toLowerCase().includes(searchTerm.toLowerCase())

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
                    isLoading={isLoading}
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