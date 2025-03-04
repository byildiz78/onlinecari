"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Phone, Calendar, Wallet, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

interface BalanceTableProps {
    paginatedBalances: any[]
}

export function BalanceTable({ paginatedBalances }: BalanceTableProps) {
    return (
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
                            {paginatedBalances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                                        Gösterilecek kayıt bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedBalances.map((balance) => (
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
                                                parseFloat(balance.balance.replace(/,/g, '')) < 0 
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Card>
    )
}
