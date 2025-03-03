"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { Button } from "@/components/ui/button"
import { Filter, Search, Phone, Calendar, Wallet, CreditCard } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import { exportToExcel, formatBalanceData } from "@/lib/export-utils"

export default function BalanceReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Mock data - replace with actual API data later
    const balances = [
        {
            id: 1,
            customer: "ADLİYE KENAN BEY",
            phone: "",
            startDate: "-397.8000",
            debt: "45,447.2500",
            credit: "-44,419.4600",
            balance: "1,425.9900",
            lastTransactionDate: "28.02.2025",
            cardType: "Yemek Kartı"
        },
        {
            id: 2,
            customer: "AFRAN TEMİZLİK (NAZIM BEY)", 
            phone: "542-4372797",
            startDate: "0.0000",
            debt: "63,147.6800",
            credit: "-62,472.6800",
            balance: "675.0000",
            lastTransactionDate: "27.02.2025",
            cardType: "Yemek Kartı"
        },
        {
            id: 3,
            customer: "AHMET FARUK KÜTÜKEMER",
            phone: "0(532) 222 53 37",
            startDate: "0.0000",
            debt: "5,000.0000",
            credit: "-5,000.0000",
            balance: "0.0000",
            lastTransactionDate: "07.01.2025",
            cardType: "Yemek Kartı"
        }
    ]

    const filteredBalances = balances.filter(balance => {
        const matchesSearch = 
            balance.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            balance.phone.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const totalBalances = filteredBalances.length
    const totalPages = Math.ceil(totalBalances / itemsPerPage)
    const paginatedBalances = filteredBalances.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Bakiye Raporu
                    </h2>
                    <p className="text-[0.925rem] text-muted-foreground">
                        Müşteri bakiye durumlarını takip edin
                    </p>
                </div>
                <Button
                    onClick={() => exportToExcel(formatBalanceData(filteredBalances), 'bakiye-raporu')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    Excel'e Aktar
                </Button>
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
                        </div>
                    </div>
                </Card>
            </div>

            {/* Balance Table */}
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
                                    <TableHead className="w-[20%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </span>
                                            Müşteri
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </span>
                                            Telefon
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </span>
                                            Başlangıç
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </span>
                                            Borç
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </span>
                                            Alacak
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </span>
                                            Bakiye
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%] text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                            </span>
                                            Son İşlem Zamanı
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[10%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                                                <CreditCard className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                            </span>
                                            Kart Tipi
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBalances.map((balance) => (
                                    <TableRow
                                        key={balance.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    >
                                        <TableCell>
                                            <div className="font-medium">{balance.customer}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{balance.phone}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium">{balance.startDate}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-red-600 dark:text-red-400">
                                                {balance.debt}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-green-600 dark:text-green-400">
                                                {balance.credit}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "font-medium",
                                                parseFloat(balance.balance) < 0 
                                                    ? "text-red-600 dark:text-red-400" 
                                                    : "text-green-600 dark:text-green-400"
                                            )}>
                                                {balance.balance}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="font-medium">
                                                {balance.lastTransactionDate}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{balance.cardType}</div>
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
                                    Toplam {totalBalances} kayıt
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