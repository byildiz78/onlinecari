"use client"

import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"
import { motion } from "framer-motion"
import { SectionProps } from "../types"

export function NotesSection({ customerData, setCustomerData }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <Card className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-violet-600 dark:text-violet-400">
              Müşteri Özel Not
            </h3>
            <p className="text-sm text-violet-600/80 dark:text-violet-400/80">
              Ek notlar ve açıklamalar
            </p>
          </div>
        </div>

        <Textarea
          value={customerData.notes}
          onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Müşteri ile ilgili özel notlarınızı buraya girebilirsiniz..."
          className="min-h-[150px]"
        />
      </Card>
    </motion.div>
  )
}
