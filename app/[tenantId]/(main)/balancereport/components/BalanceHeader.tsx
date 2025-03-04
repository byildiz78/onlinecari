"use client"

import { Button } from "@/components/ui/button"
import { exportToExcel, formatBalanceData } from "@/lib/export-utils"

interface BalanceHeaderProps {
    filteredBalances: any[]
}

export function BalanceHeader({ filteredBalances }: BalanceHeaderProps) {
    return (
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
    )
}
