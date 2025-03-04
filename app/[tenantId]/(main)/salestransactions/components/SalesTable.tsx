"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, FileText, User } from "lucide-react"

interface SalesTableProps {
    paginatedTransactions: any[]
}

export function SalesTable({ paginatedTransactions }: SalesTableProps) {
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
                                <TableHead className="w-[15%]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </span>
                                        Tarih
                                    </div>
                                </TableHead>
                                <TableHead className="w-[45%]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </span>
                                        Müşteri Adı
                                    </div>
                                </TableHead>
                                <TableHead className="w-[20%]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                                        </span>
                                        Çek No
                                    </div>
                                </TableHead>
                                <TableHead className="w-[20%] text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </span>
                                        Tutar
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTransactions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                        Gösterilecek işlem bulunamadı
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedTransactions.map((transaction) => (
                                    <TableRow
                                        key={transaction.id}
                                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                                    >
                                        <TableCell>
                                            <div className="font-medium">{transaction.date}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{transaction.customerName}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{transaction.documentNo}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium text-green-600 dark:text-green-400">
                                                {transaction.amount}
                                            </div>
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
