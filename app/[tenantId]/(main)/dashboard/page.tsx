"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTabStore } from "@/stores/tab-store";
import { useUserStore } from "@/stores/users-store";
import { motion } from "framer-motion";
import { Bell, Store, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Users, TrendingUp, Receipt, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendsChart } from "./components/TrendsChart";
import NotificationPanel from "@/app/[tenantId]/(main)/dashboard/components/NotificationPanel";

const REFRESH_INTERVAL = 90000; // 90 seconds

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

const DEFAULT_SETTINGS: Settings = {
    minDiscountAmount: 0,
    minCancelAmount: 0,
    minSaleAmount: 0
};

export default function Dashboard() {
    const { activeTab } = useTabStore();
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { settings } = useSettingsStore();
    const { selectedFilter } = useFilterStore();
    const { fetchUsers } = useUserStore();

    // Mock data for financial widgets
    const mockData = {
        totalCollections: "₺174,035.35",
        totalExpenses: "₺162,539.06",
        monthlyCollections: "₺45,447.25",
        monthlyExpenses: "₺44,419.46",
        activeCustomers: "1,245",
        averageTransaction: "₺1,425.99",
        topDebtors: [
            { name: "PERS-HATİCE ÖZER", amount: "₺5,466.35" },
            { name: "AYEDAŞ - CARİ", amount: "₺1,881.00" },
            { name: "ASTRA ZENECA İLAÇ", amount: "₺538.00" }
        ],
        trends: {
            labels: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'],
            collections: [45000, 52000, 49000, 47000, 45000, 48000],
            sales: [42000, 48000, 45000, 43000, 41000, 44000]
        }
    };

    useEffect(() => {
        if (selectedFilter.branches) {
            setSelectedBranches(selectedFilter.branches.map(item => item.BranchID));
        }
    }, [selectedFilter]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (activeTab === "dashboard") {
            const countdownInterval = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        setRefreshTrigger(prev => prev + 1);
                        return REFRESH_INTERVAL / 1000;
                    }
                    return prevCount - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [activeTab]);

    return (
        <div className="h-full flex">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Finansal Özet
                    </h2>
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start flex items-center gap-2 group">
                        <div className="duration-[8000ms] text-blue-500 group-hover:text-blue-600 [animation:spin_6s_linear_infinite]">
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 22h14" />
                                <path d="M5 2h14" />
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                            </svg>
                        </div>
                        <span className="font-medium w-4 text-center">{countdown}</span>
                        <span>saniye</span>
                    </div>
                </div>

                <div className="p-3 space-y-4 md:space-y-6 pb-20">
                    {/* Summary Widgets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Collections */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Tahsilat</p>
                                        <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{mockData.totalCollections}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600/80 dark:text-green-400/80">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>+12.5%</span>
                                            <span className="text-gray-600/60 dark:text-gray-400/60">bu ay</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl shadow-xl shadow-green-500/10">
                                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Total Expenses */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Harcama</p>
                                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{mockData.totalExpenses}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-red-600/80 dark:text-red-400/80">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span>-8.3%</span>
                                            <span className="text-gray-600/60 dark:text-gray-400/60">bu ay</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl shadow-xl shadow-red-500/10">
                                        <Wallet className="w-6 h-6 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Monthly Collections */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Bu Ay Tahsilat</p>
                                        <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{mockData.monthlyCollections}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-blue-600/80 dark:text-blue-400/80">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>+5.2%</span>
                                            <span className="text-gray-600/60 dark:text-gray-400/60">geçen aya göre</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl shadow-xl shadow-blue-500/10">
                                        <Receipt className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Monthly Expenses */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Bu Ay Harcama</p>
                                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{mockData.monthlyExpenses}</h3>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-purple-600/80 dark:text-purple-400/80">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span>-3.1%</span>
                                            <span className="text-gray-600/60 dark:text-gray-400/60">geçen aya göre</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl shadow-xl shadow-purple-500/10">
                                        <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Trends Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2">
                            <TrendsChart data={mockData.trends} />
                        </div>

                        {/* Top Debtors Card */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-pink-700 dark:text-pink-400">En Yüksek Borçlular</h3>
                                        <p className="text-sm text-pink-600/70 dark:text-pink-400/70 mt-1">
                                            Son 30 günlük borç durumu
                                        </p>
                                    </div>
                                    <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl shadow-xl shadow-pink-500/10">
                                        <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {mockData.topDebtors.map((debtor, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 rounded-lg bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-pink-100/20 dark:border-pink-900/20 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                                                    <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {debtor.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                    {debtor.amount}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Notifications Panel */}
            <div className="hidden lg:block w-[300px] border-l border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="h-full p-3 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                    <NotificationPanel
                        settings={settings}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>

            {/* Mobile Notifications Button */}
            <div className="fixed bottom-4 right-4 lg:hidden z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full h-12 w-12">
                            <div className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-[90%] max-w-[400px] p-0 sm:w-[400px]"
                    >
                        <NotificationPanel
                            settings={settings}
                            refreshTrigger={refreshTrigger}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}