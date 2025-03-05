"use client"

import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Building2 } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function AddressSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
              Adres
            </h3>
            <p className="text-sm text-green-600/80 dark:text-green-400/80">
              Müşteri adres bilgileri
            </p>
          </div>
        </div>

        <div>
          <Textarea
            value={customerData.address}
            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Adres bilgilerini giriniz"
            className="min-h-[100px]"
          />
        </div>
      </Card>
    </motion.div>
  )
}
