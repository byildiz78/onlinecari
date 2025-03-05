"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function CustomerCardSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Müşteri Kartı
            </h3>
            <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
              Temel müşteri bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Ad</Label>
            <Input
              value={customerData.name}
              onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Müşteri adı"
            />
          </div>
          <div>
            <Label>Tam Ad/Unvan</Label>
            <Input
              value={customerData.fullName}
              onChange={(e) => setCustomerData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Tam ad veya unvan"
            />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input
              value={customerData.phone}
              onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Telefon numarası"
            />
          </div>
          <div>
            <Label>Vergi No</Label>
            <Input
              value={customerData.taxNumber}
              onChange={(e) => setCustomerData(prev => ({ ...prev, taxNumber: e.target.value }))}
              placeholder="Vergi numarası"
            />
          </div>
          <div>
            <Label>Vergi Dairesi</Label>
            <Input
              value={customerData.taxOffice}
              onChange={(e) => setCustomerData(prev => ({ ...prev, taxOffice: e.target.value }))}
              placeholder="Vergi dairesi"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
