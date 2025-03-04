"use client"

import React, { useState } from 'react'
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { Card } from '@/components/ui/card'

// Componentler
import { CustomerHeader } from './components/CustomerHeader'
import { CustomerSearchFilters } from './components/CustomerSearchFilters'
import { CustomerTable } from './components/CustomerTable'
import { CustomerPagination } from './components/CustomerPagination'

// Modallar
import { SaleModal } from './components/modals/SaleModal'
import { CollectionModal } from './components/modals/CollectionModal'
import { StatementModal } from './components/modals/StatementModal'
import { DetailedStatementModal } from './components/modals/DetailedStatementModal'

// Veri
import { customers } from './data/mock-data'

export default function CustomerListPage() {
    const { selectedFilter } = useFilterStore()
    const { addTab,setActiveTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    
    // Modal state'leri
    const [saleModalOpen, setSaleModalOpen] = useState(false)
    const [collectionModalOpen, setCollectionModalOpen] = useState(false)
    const [statementPreviewOpen, setStatementPreviewOpen] = useState(false)
    const [detailedStatementOpen, setDetailedStatementOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [transactionAmount, setTransactionAmount] = useState('')
    const [transactionDescription, setTransactionDescription] = useState('')
    const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format
    
    // Ekstre state'leri
    const [startDate, setStartDate] = useState<string>(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    ) // 1 ay öncesi
    const [endDate, setEndDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    ) // Bugün
    
    // Ekstre filtreleme işlemleri
    const filterStatementByDateRange = (startDate: string, endDate: string, data: any[]) => {
        return data.filter(item => {
            // "DD.MM.YYYY" formatını "YYYY-MM-DD" formatına çevirelim
            const parts = item.date.split('.');
            const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            
            return formattedDate >= startDate && formattedDate <= endDate;
        });
    };

    // Satış işlemi
    const handleSaleSubmit = () => {
        if (!transactionAmount || !selectedCustomer) return;
        
        // Burada gerçek API çağrısı yapılacak
        console.log("Satış kaydedildi:", {
            customerId: selectedCustomer.id,
            amount: parseFloat(transactionAmount),
            description: transactionDescription,
            date: transactionDate
        });
        
        // Modal'ı kapat ve formları temizle
        setSaleModalOpen(false);
        setTransactionAmount('');
        setTransactionDescription('');
    };
    
    // Tahsilat işlemi
    const handleCollectionSubmit = () => {
        if (!transactionAmount || !selectedCustomer) return;
        
        // Burada gerçek API çağrısı yapılacak
        console.log("Tahsilat kaydedildi:", {
            customerId: selectedCustomer.id,
            amount: parseFloat(transactionAmount),
            description: transactionDescription,
            date: transactionDate
        });
        
        // Modal'ı kapat ve formları temizle
        setCollectionModalOpen(false);
        setTransactionAmount('');
        setTransactionDescription('');
    };

    // Modal açma fonksiyonları
    const openSaleModal = (customer: any) => {
        setSelectedCustomer(customer);
        setTransactionAmount('');
        setTransactionDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]); // Bugünün tarihini ayarla
        setSaleModalOpen(true);
    };

    const openCollectionModal = (customer: any) => {
        setSelectedCustomer(customer);
        setTransactionAmount('');
        setTransactionDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]); // Bugünün tarihini ayarla
        setCollectionModalOpen(true);
    };

    const viewStatement = (customer: any) => {
        setSelectedCustomer(customer);
        // Son 1 aylık ekstre için varsayılan tarih aralığını ayarla
        setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setStatementPreviewOpen(true);
    };

    const viewDetailedStatement = (customer: any) => {
        setSelectedCustomer(customer);
        // Son 1 aylık detaylı ekstre için varsayılan tarih aralığını ayarla
        setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setDetailedStatementOpen(true);
    }

    const handleNewCustomer = () => {
        const tabId = "Yeni Müşteri";
        addTab({
            id: tabId,
            title: "Yeni Kullanıcı",
            lazyComponent: () => import('./components/CreateCustomer').then(module => ({
                default: (props: any) => <module.default {...props} />
            }))
        });
        setActiveTab(tabId);
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.cardNo.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const totalCustomers = filteredCustomers.length
    const totalPages = Math.ceil(totalCustomers / 10)
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * 10,
        currentPage * 10
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            {/* Header */}
            <CustomerHeader onNewCustomer={handleNewCustomer} />
            
            {/* Search and Filters */}
            <CustomerSearchFilters 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* Customer List Table */}
            <Card className="border-0 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-1 overflow-hidden rounded-xl">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                    {/* Customer Table */}
                    <CustomerTable 
                        customers={paginatedCustomers}
                        onViewSaleModal={openSaleModal}
                        onViewCollectionModal={openCollectionModal}
                        onViewStatement={viewStatement}
                        onViewDetailedStatement={viewDetailedStatement}
                    />

                    {/* Pagination */}
                    <CustomerPagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalCustomers={totalCustomers}
                        setCurrentPage={setCurrentPage}
                    />
                </div>
            </Card>

            {/* Modals */}
            <SaleModal 
                open={saleModalOpen}
                onOpenChange={setSaleModalOpen}
                customer={selectedCustomer}
                transactionAmount={transactionAmount}
                setTransactionAmount={setTransactionAmount}
                transactionDescription={transactionDescription}
                setTransactionDescription={setTransactionDescription}
                transactionDate={transactionDate}
                setTransactionDate={setTransactionDate}
                onSubmit={handleSaleSubmit}
            />
            
            <CollectionModal 
                open={collectionModalOpen}
                onOpenChange={setCollectionModalOpen}
                customer={selectedCustomer}
                transactionAmount={transactionAmount}
                setTransactionAmount={setTransactionAmount}
                transactionDescription={transactionDescription}
                setTransactionDescription={setTransactionDescription}
                transactionDate={transactionDate}
                setTransactionDate={setTransactionDate}
                onSubmit={handleCollectionSubmit}
            />
            
            <StatementModal 
                open={statementPreviewOpen}
                onOpenChange={setStatementPreviewOpen}
                customer={selectedCustomer}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
            
            <DetailedStatementModal 
                open={detailedStatementOpen}
                onOpenChange={setDetailedStatementOpen}
                customer={selectedCustomer}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
            />
        </div>
    )
}