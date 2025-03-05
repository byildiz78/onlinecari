"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BadgePercent } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function PointsSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
            <BadgePercent className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-rose-600 dark:text-rose-400">
              Para Puan Bilgileri
            </h3>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80">
              Puan ve kazanım bilgileri
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Para Puanı (%)</Label>
            <Input
              type="number"
              value={customerData.pointPercentage}
              onChange={(e) => setCustomerData(prev => ({ ...prev, pointPercentage: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Başlangıç</Label>
            <Input
              type="number"
              value={customerData.pointStartDate}
              onChange={(e) => setCustomerData(prev => ({ ...prev, pointStartDate: e.target.value }))}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
