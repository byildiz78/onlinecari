"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function CardInfoSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-cyan-600 dark:text-cyan-400">
              Kart Bilgileri
            </h3>
            <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80">
              Müşteri kart detayları
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>Müşteri Kartı</Label>
            <Input
              value={customerData.customerCard}
              onChange={(e) => setCustomerData(prev => ({ ...prev, customerCard: e.target.value }))}
              placeholder="Kart numarası"
            />
          </div>
          <div>
            <Label>Kart Tipi</Label>
            <Select
              value={customerData.cardType}
              onValueChange={(value) => setCustomerData(prev => ({ ...prev, cardType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meal">Yemek Kartı</SelectItem>
                <SelectItem value="gift">Hediye Kartı</SelectItem>
                <SelectItem value="corporate">Kurumsal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Proximity Card ID</Label>
            <Input
              value={customerData.proximityCardId}
              onChange={(e) => setCustomerData(prev => ({ ...prev, proximityCardId: e.target.value }))}
              placeholder="Kart ID"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
