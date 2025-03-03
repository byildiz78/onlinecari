"use client"

import { useState } from "react"
import { useFilterStore } from "@/stores/filters-store"
import { useTabStore } from '@/stores/tab-store'
import { Button } from "@/components/ui/button"
import { Filter, Search, Calendar, Wallet, User, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import { exportToExcel, formatTransactionData } from "@/lib/export-utils"

export default function TransactionReportPage() {
    const { selectedFilter } = useFilterStore()
    const { activeTab } = useTabStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Mock data - replace with actual API data later
    const transactions = [
        {
            id: 1,
            date: "1.03.2025",
            customer: "PERS-ZİHNİ ERKİCİ",
            credit: "-317.0000",
            debt: "0.0000",
            balance: "-72.2500",
            documentNo: "42904"
        },
        {
            id: 2,
            date: "1.03.2025",
            customer: "AYEDAŞ - CARİ",
            credit: "0.0000",
            debt: "1,881.0000",
            balance: "-1,140.3050",
            documentNo: "42904"
        },
        {
            id: 3,
            date: "1.03.2025",
            customer: "PERS-HATİCE ÖZER",
            credit: "0.0000",
            debt: "5,466.3500",
            balance: "0.0000",
            documentNo: "42039"
        }
    ]

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = 
            transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.documentNo.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const totalTransactions = filteredTransactions.length
    const totalPages = Math.ceil(totalTransactions / itemsPerPage)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-2 pt-2 h-[calc(85vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        İşlem Raporu
                    </h2>
                    <p className="text-[0.925rem] text-muted-foreground">
                        Müşteri işlem hareketlerini takip edin
                    </p>
                </div>
                <Button
                    onClick={() => exportToExcel(formatTransactionData(filteredTransactions), 'islem-raporu')}
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
                                        placeholder="Müşteri veya çek no ara..."
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

            {/* Transactions Table */}
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
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </span>
                                            Tarih
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[25%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                                <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </span>
                                            Cari
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            </span>
                                            Alacak
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            </span>
                                            Borç
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%] text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                                <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </span>
                                            Bakiye
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[15%]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                            </span>
                                            Çek No
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTransactions.map((transaction) => (
                                    <TableRow
                                        key={transaction.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    >
                                        <TableCell>
                                            <div className="font-medium">{transaction.date}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{transaction.customer}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "font-medium",
                                                parseFloat(transaction.credit) < 0 
                                                    ? "text-red-600 dark:text-red-400" 
                                                    : "text-green-600 dark:text-green-400"
                                            )}>
                                                {transaction.credit}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-red-600 dark:text-red-400">
                                                {transaction.debt}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className={cn(
                                                "font-medium",
                                                parseFloat(transaction.balance) < 0 
                                                    ? "text-red-600 dark:text-red-400" 
                                                    : "text-green-600 dark:text-green-400"
                                            )}>
                                                {transaction.balance}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{transaction.documentNo}</div>
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
                                    Toplam {totalTransactions} kayıt
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