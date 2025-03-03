"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { Button } from "@/components/ui/button"
import { AlertCircle, Calendar, Eye, FileText, Filter, Plus, Search, Star, Store, Tag, User, CreditCard, Wallet, Building2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { exportToExcel, formatCustomerData } from "@/lib/export-utils"

export default function CustomerListPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab, addTab, setActiveTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Mock customer data - replace with actual API data later
    const customers = [
        {
            id: "1",
            cardNo: "10000",
            cardType: "Yemek Kartı",
            name: "PERS-AYDIN TANERGİN",
            branch: "MALTEPE",
            balance: 1500.50,
            credit: 2000.00,
            debt: 500.00,
            status: "active"
        },
        {
            id: "2",
            cardNo: "30000",
            cardType: "Yemek Kartı",
            name: "PERS-SÜLEYMAN YENER",
            branch: "MALTEPE",
            balance: -291874.89,
            credit: 290737.00,
            debt: 11499.95,
            status: "active"
        },
        {
            id: "3",
            cardNo: "100000",
            cardType: "Yemek Kartı",
            name: "PERS-SELİM YÜCEL",
            branch: "MALTEPE",
            balance: -11867.14,
            credit: 5802.25,
            debt: 5780.24,
            status: "active"
        }
    ]

    const statusOptions = [
        { value: "all", label: "Tüm Durumlar" },
        { value: "active", label: "Aktif" },
        { value: "passive", label: "Pasif" },
        { value: "blocked", label: "Bloke" }
    ]

    const typeOptions = [
        { value: "all", label: "Tüm Tipler" },
        { value: "meal", label: "Yemek Kartı" },
        { value: "gift", label: "Hediye Kartı" },
        { value: "corporate", label: "Kurumsal" }
    ]

    const handleNewCustomer = () => {
        const tabId = "Yeni Müşteri";
        addTab({
            id: tabId,
            title: "Yeni Müşteri",
            lazyComponent: () => import("./components/CreateCustomer")
        });
        setActiveTab(tabId);
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.cardNo.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = statusFilter === "all" || customer.status === statusFilter
        const matchesType = typeFilter === "all" || customer.cardType === typeFilter

        return matchesSearch && matchesStatus && matchesType
    })

    const totalCustomers = filteredCustomers.length
    const totalPages = Math.ceil(totalCustomers / itemsPerPage)
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Müşteri Listesi
                    </h2>
                    <p className="text-[0.925rem] text-muted-foreground">
                        Müşteri kayıtlarını yönetin ve takip edin
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => exportToExcel(formatCustomerData(filteredCustomers), 'musteri-listesi')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Excel'e Aktar
                    </Button>
                    <Button
                        onClick={handleNewCustomer}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 dark:shadow-blue-900/30 transition-all duration-200 hover:scale-[1.02]"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Müşteri
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <Card className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-2 border-blue-100/50 dark:border-blue-900/20 shadow-lg shadow-blue-500/5">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                                    <Input
                                        placeholder="Müşteri ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4" />
                                            <SelectValue placeholder="Durum Filtrele" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full md:w-[180px] bg-white/80 dark:bg-gray-800/80 border-2 border-blue-100 dark:border-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4" />
                                            <SelectValue placeholder="Tip Filtrele" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {typeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Customer List Table */}
            <Card className="border-0 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-1 overflow-hidden rounded-xl">
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 h-full flex flex-col">
                    <div className="flex-1 overflow-auto
                        [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                        <Table className="relative w-full">
                            <TableHeader className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
                                <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                                    <TableHead className="w-[10%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                                <CreditCard className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                            </span>
                                            Kart No
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </span>
                                            Kart Tipi
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[20%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </span>
                                            Müşteri Adı
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </span>
                                            Şube
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                            </span>
                                            Bakiye
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                                                <Star className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                            </span>
                                            Limit
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </span>
                                            Borç
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[5%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </span>
                                            İşlemler
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCustomers.map((customer) => (
                                    <TableRow
                                        key={customer.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    >
                                        <TableCell>
                                            <div className="font-medium">{customer.cardNo}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                                {customer.cardType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{customer.name}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{customer.branch}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "font-medium",
                                                customer.balance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                                            )}>
                                                {formatCurrency(customer.balance)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(customer.credit)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-red-600 dark:text-red-400">
                                                {formatCurrency(customer.debt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Detayları Görüntüle</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="py-1.5 px-6 bg-white/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    Toplam {totalCustomers} kayıt
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-4"
                                >
                                    Önceki
                                </Button>
                                <div className="flex items-center gap-2 min-w-[5rem] justify-center">
                                    <span className="font-medium">{currentPage}</span>
                                    <span className="text-muted-foreground">/</span>
                                    <span className="text-muted-foreground">{totalPages}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 px-4"
                                >
                                    Sonraki
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}