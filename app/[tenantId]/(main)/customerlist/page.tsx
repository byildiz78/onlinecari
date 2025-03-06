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
import { toast } from '@/components/ui/toast/use-toast'
import axios from '@/lib/axios'
import { useCustomersStore } from '@/stores/main/customers-store'

export default function CustomerListPage() {
    const { selectedFilter } = useFilterStore()
    const { addTab, setActiveTab, tabs } = useTabStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)
    const { customers, setCustomers, selectedCustomer, setSelectedCustomer } = useCustomersStore();
    const [isLoading, setIsLoading] = React.useState(true);
    // Modal state'leri
    const [saleModalOpen, setSaleModalOpen] = useState(false)
    const [collectionModalOpen, setCollectionModalOpen] = useState(false)
    const [statementPreviewOpen, setStatementPreviewOpen] = useState(false)
    const [detailedStatementOpen, setDetailedStatementOpen] = useState(false)
    const [transactionAmount, setTransactionAmount] = useState('')
    const [transactionDescription, setTransactionDescription] = useState('')
    const [transactionDate, setTransactionDate] = useState<string>(new Date().toISOString().split('T')[0]) // YYYY-MM-DD format
    const [startDate, setStartDate] = useState<string>(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    ) // 1 ay öncesi
    const [endDate, setEndDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    ) // Bugün
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Ekstre state'leri
    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/main/customers/main_customers');
                setCustomers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                
                // API'den 404 hatası geldiğinde (veri bulunamadı)
                if (error.response && error.response.status === 404) {
                    toast({
                        title: "Bilgi",
                        description: "Herhangi bir müşteri kaydı bulunamadı.",
                        variant: "default",
                    });
                } else {
                    // Diğer hatalar için
                    toast({
                        title: "Hata!",
                        description: "Müşteri listesi yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.",
                        variant: "destructive",
                    });
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [setCustomers]);

    // Satış işlemi
    const handleSaleSubmit = async () => {
        try {
            if (!selectedCustomer) return;
            
            setIsSubmitting(true);
            
            // API isteği için veriyi hazırla
            const saleData = {
                customerKey: selectedCustomer.CustomerKey?.toString() || '',
                amount: parseFloat(transactionAmount),
                description: transactionDescription,
                date: transactionDate
            };
            
            // Bonus alanlarının yükleme durumunu güncelle
            const { setCustomers, customers } = useCustomersStore.getState();
            const updatedCustomers = customers.map(c => {
                if (c.CustomerKey === selectedCustomer.CustomerKey) {
                    return { ...c, isLoadingBonus: true };
                }
                return c;
            });
            setCustomers(updatedCustomers);
            
            // API isteği gönder
            const response = await axios.post('/api/main/customers/customer-crud/customer-sale', saleData);
            
            // İşlem sonrası güncel müşteri verilerini al
            const customerResponse = await axios.get(`/api/main/customers/customer-crud/customer-get?customerKey=${selectedCustomer.CustomerKey}`);
            
            if (customerResponse.data.success && customerResponse.data.customer) {
                // Müşteri listesini güncelle
                const { updateCustomer } = useCustomersStore.getState();
                const updatedCustomer = { 
                    ...customerResponse.data.customer,
                    isLoadingBonus: false 
                };
                updateCustomer(updatedCustomer);
                
                // Seçili müşteriyi güncelle
                setSelectedCustomer(updatedCustomer);
            } else {
                // API'den veri alınamazsa, loading durumunu kaldır
                const { setCustomers, customers } = useCustomersStore.getState();
                const resetCustomers = customers.map(c => {
                    if (c.CustomerKey === selectedCustomer.CustomerKey) {
                        return { ...c, isLoadingBonus: false };
                    }
                    return c;
                });
                setCustomers(resetCustomers);
            }
            
            // Modalı kapat
            setSaleModalOpen(false);
            
            // Başarı mesajı göster
            toast({
                title: "Başarılı",
                description: response.data.message || "Satış işlemi kaydedildi",
                variant: "default",
            });
            
            // Form alanlarını temizle
            setTransactionAmount('');
            setTransactionDescription('');
        } catch (error) {
            console.error('Satış işlemi kaydedilirken hata oluştu:', error);
            
            // Hata durumunda loading durumunu kaldır
            const { setCustomers, customers } = useCustomersStore.getState();
            const resetCustomers = customers.map(c => {
                if (c.CustomerKey === selectedCustomer?.CustomerKey) {
                    return { ...c, isLoadingBonus: false };
                }
                return c;
            });
            setCustomers(resetCustomers);
            
            toast({
                title: "Hata!",
                description: "Satış işlemi kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Tahsilat işlemi
    const handleCollectionSubmit = async () => {
        try {
            if (!selectedCustomer) return;
            
            setIsSubmitting(true);
            
            // API isteği için veriyi hazırla
            const collectionData = {
                customerKey: selectedCustomer.CustomerKey?.toString() || '',
                amount: parseFloat(transactionAmount),
                description: transactionDescription,
                date: transactionDate
            };
            
            // Bonus alanlarının yükleme durumunu güncelle
            const { setCustomers, customers } = useCustomersStore.getState();
            const updatedCustomers = customers.map(c => {
                if (c.CustomerKey === selectedCustomer.CustomerKey) {
                    return { ...c, isLoadingBonus: true };
                }
                return c;
            });
            setCustomers(updatedCustomers);
            
            // API isteği gönder
            const response = await axios.post('/api/main/customers/customer-crud/customer-collection', collectionData);
            
            // İşlem sonrası güncel müşteri verilerini al
            const customerResponse = await axios.get(`/api/main/customers/customer-crud/customer-get?customerKey=${selectedCustomer.CustomerKey}`);
            
            if (customerResponse.data.success && customerResponse.data.customer) {
                // Müşteri listesini güncelle
                const { updateCustomer } = useCustomersStore.getState();
                const updatedCustomer = { 
                    ...customerResponse.data.customer,
                    isLoadingBonus: false 
                };
                updateCustomer(updatedCustomer);
                
                // Seçili müşteriyi güncelle
                setSelectedCustomer(updatedCustomer);
            } else {
                // API'den veri alınamazsa, loading durumunu kaldır
                const { setCustomers, customers } = useCustomersStore.getState();
                const resetCustomers = customers.map(c => {
                    if (c.CustomerKey === selectedCustomer.CustomerKey) {
                        return { ...c, isLoadingBonus: false };
                    }
                    return c;
                });
                setCustomers(resetCustomers);
            }
            
            // Modalı kapat
            setCollectionModalOpen(false);
            
            // Başarı mesajı göster
            toast({
                title: "Başarılı",
                description: response.data.message || "Tahsilat işlemi kaydedildi",
                variant: "default",
            });
            
            // Form alanlarını temizle
            setTransactionAmount('');
            setTransactionDescription('');
        } catch (error) {
            console.error('Tahsilat işlemi kaydedilirken hata oluştu:', error);
            
            // Hata durumunda loading durumunu kaldır
            const { setCustomers, customers } = useCustomersStore.getState();
            const resetCustomers = customers.map(c => {
                if (c.CustomerKey === selectedCustomer?.CustomerKey) {
                    return { ...c, isLoadingBonus: false };
                }
                return c;
            });
            setCustomers(resetCustomers);
            
            toast({
                title: "Hata!",
                description: "Tahsilat işlemi kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Modal açma fonksiyonları
    const openSaleModal = (customer: any) => {
        setSelectedCustomer({
            ...customer,
            name: customer.CustomerName,
            cardNo: customer.CardNumber,
            balance: customer.TotalBonusRemaing || 0
        });
        setTransactionAmount('');
        setTransactionDescription('');
        setTransactionDate(new Date().toISOString().split('T')[0]); // Bugünün tarihini ayarla
        setSaleModalOpen(true);
    };

    const openCollectionModal = (customer: any) => {
        setSelectedCustomer({
            ...customer,
            name: customer.CustomerName,
            cardNo: customer.CardNumber,
            balance: customer.TotalBonusRemaing || 0
        });
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

    const viewCustomerDetails = (customer: any) => {
        // Müşteri verisini doğrudan kullan, bonus bilgileri zaten store'da var
        setSelectedCustomer(customer);
        const tabId = `edit-customer-${customer.CustomerKey}`;
        
        // Sekme zaten açık mı kontrol et
        const isTabAlreadyOpen = tabs.some(tab => tab.id === tabId);
        
        if (!isTabAlreadyOpen) {
            // Sekme yoksa yeni sekme ekle
            addTab({
                id: tabId,
                title: `${customer.CustomerName}`,
                lazyComponent: () => import('./components/CreateCustomer').then(module => ({
                    default: (props: any) => <module.default customerKey={customer.CustomerKey} {...props} />
                }))
            });
        }
        
        // Her durumda ilgili sekmeyi aktif yap
        setActiveTab(tabId);
    };

    const handleNewCustomer = () => {
        const tabId = "Yeni Müşteri";
        
        // Sekme zaten açık mı kontrol et
        const isTabAlreadyOpen = tabs.some(tab => tab.id === tabId);
        
        if (!isTabAlreadyOpen) {
            // Sekme yoksa yeni sekme ekle
            addTab({
                id: tabId,
                title: "Yeni Kullanıcı",
                lazyComponent: () => import('./components/CreateCustomer').then(module => ({
                    default: (props: any) => <module.default {...props} />
                }))
            });
        }
        
        // Her durumda ilgili sekmeyi aktif yap
        setActiveTab(tabId);
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = 
            (customer?.CustomerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (customer?.CardNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())

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
                        filteredCustomers={filteredCustomers}
                        onViewSaleModal={openSaleModal}
                        onViewCollectionModal={openCollectionModal}
                        onViewStatement={viewStatement}
                        onViewDetailedStatement={viewDetailedStatement}
                        onViewCustomerDetails={viewCustomerDetails}
                        isLoading={isLoading}
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
                isLoading={isSubmitting}
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
                isLoading={isSubmitting}
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