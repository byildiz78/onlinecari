"use client";

import { useEffect, useState } from "react";
import { WebWidget, WebWidgetData } from "@/types/tables";
import { useFilterStore } from "@/stores/filters-store";
import { useSettingsStore } from "@/stores/settings-store";
import NotificationPanel from "@/app/[tenantId]/(main)/dashboard/components/NotificationPanel";
import { ArrowDownRight, ArrowUpRight, ChevronRight, CreditCard, Receipt, Store, TrendingUp, Users, Wallet, } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTabStore } from "@/stores/tab-store";
import { useUserStore } from "@/stores/users-store";
import axios from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { TrendsChart } from "./components/TrendsChart";
import { toast } from "@/components/ui/toast/use-toast";
const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

// Define interfaces for the dashboard data
interface TopDebtor {
    Müşteri: string;
    Borç: number;
}

interface DashboardData {
    topDebtors: TopDebtor[];
    totalCollection: {
        'Toplam Tahsilat': string;
        'Değişim (Bu Ay)': string;
    };
    currentMonthCollection: {
        'Bu Ay Tahsilat': string;
        'Değişim (Bu Ay)': string;
    };
    totalSales: {
        'Toplam Satış': string;
        'Değişim (Bu Ay)': string;
    };
    currentMonthSales: {
        'Bu Ay Satış': string;
        'Değişim (Bu Ay)': string;
    };
    sixMonthStats: {
        'Ay': string;
        'Tahsilat': string;
        'Satış': string;
        'Tahsilat Değişim': string;
        'Satış Değişim': string;
    }[];
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
    const pathname = usePathname();
    const currentDate = new Date().toISOString().split('T')[0];
    const [widgets, setWidgets] = useState<WebWidget[]>([]);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingCards, setLoadingCards] = useState({
        totalCollection: true,
        totalSales: true,
        currentMonthCollection: true,
        currentMonthSales: true,
        trendsChart: true,
        topDebtors: true,
    });

    useEffect(() => {
        if (selectedFilter.branches) {
            setSelectedBranches(selectedFilter.branches.map(item => item.BranchID));
        }
    }, [selectedFilter]);


    useEffect(() => {
        if (activeTab === "dashboard") {
            const fetchDashboardData = async () => {
                try {
                    setLoading(true);
                    const response = await axios.post<DashboardData>("/api/widgetreport", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setDashboardData(response.data);
                    setLoadingCards({
                        totalCollection: false,
                        totalSales: false,
                        currentMonthCollection: false,
                        currentMonthSales: false,
                        trendsChart: false,
                        topDebtors: false,
                    });
                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchDashboardData();

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

    useEffect(() => {
        if (activeTab === "dashboard") {
            const fetchDashboardData = async () => {
                try {
                    setLoading(true);
                    setLoadingCards({
                        totalCollection: true,
                        totalSales: true,
                        currentMonthCollection: true,
                        currentMonthSales: true,
                        trendsChart: true,
                        topDebtors: true,
                    });
                    const response = await axios.post<DashboardData>("/api/widgetreport", {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                    setDashboardData(response.data);
                    setLoadingCards({
                        totalCollection: false,
                        totalSales: false,
                        currentMonthCollection: false,
                        currentMonthSales: false,
                        trendsChart: false,
                        topDebtors: false,
                    });
                } catch (error) {
                    console.error("Error refreshing dashboard data:", error);
                    
                    // API'den 404 hatası geldiğinde (veri bulunamadı)
                    if (error.response && error.response.status === 404) {
                        toast({
                            title: "Bilgi",
                            description: "Dashboard verileri bulunamadı. Lütfen daha sonra tekrar deneyin.",
                            variant: "default",
                        });
                    } else {
                        // Diğer hatalar için
                        toast({
                            title: "Hata!",
                            description: "Dashboard verilerini alırken bir sorun oluştu. Lütfen tekrar deneyin.",
                            variant: "destructive",
                        });
                    }
                    
                    // Yükleme durumlarını sıfırla
                    setLoadingCards({
                        totalCollection: false,
                        totalSales: false,
                        currentMonthCollection: false,
                        currentMonthSales: false,
                        trendsChart: false,
                        topDebtors: false,
                    });
                } finally {
                    setLoading(false);
                }
            };

            if (refreshTrigger > 0) {
                fetchDashboardData();
            }
        }
    }, [refreshTrigger, activeTab]);

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
                                        {loadingCards.totalCollection ? (
                                            <div className="h-8 mt-1 flex items-center">
                                                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-muted-foreground text-sm">Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{dashboardData?.totalCollection['Toplam Tahsilat'] ?? ''}</h3>
                                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600/80 dark:text-green-400/80">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                    <span>{dashboardData?.totalCollection['Değişim (Bu Ay)'] || '0%'}</span>
                                                    <span className="text-gray-600/60 dark:text-gray-400/60">bu ay</span>
                                                </div>
                                            </>
                                        )}
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
                                        {loadingCards.totalSales ? (
                                            <div className="h-8 mt-1 flex items-center">
                                                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-muted-foreground text-sm">Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{dashboardData?.totalSales['Toplam Satış'] ?? ''}</h3>
                                                <div className="flex items-center gap-1 mt-2 text-sm text-red-600/80 dark:text-red-400/80">
                                                    <ArrowDownRight className="h-4 w-4" />
                                                    <span>{dashboardData?.totalSales['Değişim (Bu Ay)'] || '0%'}</span>
                                                    <span className="text-gray-600/60 dark:text-gray-400/60">bu ay</span>
                                                </div>
                                            </>
                                        )}
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
                                        {loadingCards.currentMonthCollection ? (
                                            <div className="h-8 mt-1 flex items-center">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-muted-foreground text-sm">Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{dashboardData?.currentMonthCollection['Bu Ay Tahsilat'] ?? ''}</h3>
                                                <div className="flex items-center gap-1 mt-2 text-sm text-blue-600/80 dark:text-blue-400/80">
                                                    <ArrowUpRight className="h-4 w-4" />
                                                    <span>{dashboardData?.currentMonthCollection['Değişim (Bu Ay)'] || '0%'}</span>
                                                    <span className="text-gray-600/60 dark:text-gray-400/60">geçen aya göre</span>
                                                </div>
                                            </>
                                        )}
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
                                        {loadingCards.currentMonthSales ? (
                                            <div className="h-8 mt-1 flex items-center">
                                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                                                <span className="text-muted-foreground text-sm">Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{dashboardData?.currentMonthSales['Bu Ay Satış'] ?? ''}</h3>
                                                <div className="flex items-center gap-1 mt-2 text-sm text-purple-600/80 dark:text-purple-400/80">
                                                    <ArrowDownRight className="h-4 w-4" />
                                                    <span>{dashboardData?.currentMonthSales['Değişim (Bu Ay)'] || '0%'}</span>
                                                    <span className="text-gray-600/60 dark:text-gray-400/60">geçen aya göre</span>
                                                </div>
                                            </>
                                        )}
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
                            {loadingCards.trendsChart ? (
                                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 h-[400px] flex items-center justify-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-muted-foreground">Grafik yükleniyor...</p>
                                    </div>
                                </Card>
                            ) : (
                                <TrendsChart data={dashboardData?.sixMonthStats ?? []} />
                            )}
                        </div>

                        {/* Top Debtors Card */}
                        <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20" />
                            <div className="absolute inset-0 bg-grid-black/5 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-white/5" />
                            <div className="p-6 relative h-[400px] flex flex-col">
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
                                {loadingCards.topDebtors ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-muted-foreground">Borçlu listesi yükleniyor...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 overflow-y-auto flex-1
                                        [&::-webkit-scrollbar]:w-2
                                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                                        [&::-webkit-scrollbar-thumb]:rounded-full
                                        [&::-webkit-scrollbar-track]:bg-transparent
                                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                                        {dashboardData?.topDebtors.map((debtor, index) => (
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
                                                        {debtor.Müşteri}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(debtor.Borç)}
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </div>
    );
}