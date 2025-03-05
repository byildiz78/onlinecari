"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function CreditBalanceSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400">
              Kredi ve Bakiye Bilgileri
            </h3>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">
              Finansal bilgiler
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>Kredi Limiti</Label>
            <Input
              type="number"
              value={customerData.creditLimit}
              onChange={(e) => setCustomerData(prev => ({ ...prev, creditLimit: e.target.value }))}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Kredi Durumu</Label>
            <Select
              value={customerData.creditStatus}
              onValueChange={(value) => setCustomerData(prev => ({ ...prev, creditStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="passive">Pasif</SelectItem>
                <SelectItem value="blocked">Bloke</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>İndirim Yüzdesi (%)</Label>
            <Input
              type="number"
              value={customerData.discount}
              onChange={(e) => setCustomerData(prev => ({ ...prev, discount: e.target.value }))}
              placeholder="0"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
