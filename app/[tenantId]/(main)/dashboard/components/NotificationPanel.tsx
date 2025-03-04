import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { Bell, CheckCircle2, Ban, Tag, AlertCircle, Clock, RefreshCw, ClipboardCheck, MapPin, CalendarDays, ReceiptText, CreditCard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { NotificationType } from "@/types/tables";
import { useCallback, useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import axios from "@/lib/axios";

import { SettingsMenu } from "@/app/[tenantId]/(main)/dashboard/components/settings-menu";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useTabStore } from "@/stores/tab-store";
import { mockNotifications } from "../data/mock-data";

interface NotificationStyle {
    icon: typeof CheckCircle2;
    color: string;
    borderColor: string;
    bgColor: string;
}

interface Settings {
    minDiscountAmount: number;
    minCancelAmount: number;
    minSaleAmount: number;
}

interface NotificationPanelProps {
    settings: Settings;
    refreshTrigger: number;
}

const DEFAULT_SETTINGS: Settings = {
    minDiscountAmount: 0,
    minCancelAmount: 0,
    minSaleAmount: 0
};

const NOTIFICATION_STYLES: Record<NotificationType | string, NotificationStyle> = {
    sale: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    discount: {
        icon: Tag,
        color: "text-blue-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    cancel: {
        icon: Ban,
        color: "text-rose-500",
        borderColor: "border-rose-500/30",
        bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    alert: {
        icon: AlertCircle,
        color: "text-amber-500",
        borderColor: "border-amber-500/30",
        bgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
    "Satış İşlemi": {
        icon: ReceiptText,
        color: "text-emerald-500",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    "Tahsilat": {
        icon: CreditCard,
        color: "text-blue-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
};

interface Notification {
    autoId: number;
    branchName: string;
    formName: string;
    orderDateTime: string;
    type: string;
    amount?: number;
    customer?: string;
}

const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const localHours = date.getHours().toString().padStart(2, '0');
    const localMinutes = date.getMinutes().toString().padStart(2, '0');
    return `${localHours}:${localMinutes}`;
};

const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "";
    return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
    }).format(amount);
};

export default function NotificationPanel({
    settings,
    refreshTrigger
}: NotificationPanelProps) {
    const { selectedFilter } = useFilterStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [intervalLoading, setIntervalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);
    const { activeTab } = useTabStore();
    const [tempSettings, setTempSettings] = useState<Settings>(settings);
    const [useMockData, setUseMockData] = useState(false);

    // Update tempSettings when settings prop changes
    useEffect(() => {
        if (settings && JSON.stringify(tempSettings) !== JSON.stringify(settings)) {
            setTempSettings(settings);
        }
    }, [settings]);

    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (!selectedFilter.branches.length) return;

        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIntervalLoading(true);
            }
            setError(null);

            try {
                const { data } = await axios.post('/api/notifications', {
                    branches: selectedFilter.branches.map(item => item.BranchID),
                    ...settings
                });

                setNotifications(Array.isArray(data) ? data : []);
                setHasFetched(true);
                setUseMockData(false);
            } catch (error) {
                console.error('Error fetching notifications, using mock data:', error);
                setNotifications(mockNotifications);
                setHasFetched(true);
                setUseMockData(true);
            }
            
        } catch (err) {
            console.error('Error in fetchNotifications:', err);
            setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
            setNotifications(mockNotifications);
            setUseMockData(true);
        } finally {
            setLoading(false);
            setIntervalLoading(false);
        }
    }, [selectedFilter.branches, settings]);

    // Initial fetch when settings or branches change
    useEffect(() => {
        if (activeTab === "dashboard" && selectedFilter.branches.length > 0 && settings && !hasFetched) {
            fetchNotifications(true);
        }
    }, [activeTab, selectedFilter.branches, settings, fetchNotifications, hasFetched]);

    // Handle refreshes based on refreshTrigger
    useEffect(() => {
        if (activeTab === "dashboard" && selectedFilter.branches.length > 0 && settings && refreshTrigger > 0) {
            fetchNotifications(false);
        }
    }, [refreshTrigger, activeTab, selectedFilter.branches, settings, fetchNotifications]);

    // Eğer hiç veri yoksa mock verileri kullan
    useEffect(() => {
        if (notifications.length === 0 && !loading && !intervalLoading) {
            setNotifications(mockNotifications);
            setUseMockData(true);
        }
    }, [notifications, loading, intervalLoading]);

    const renderNotification = useCallback((notification: Notification, index: number, isLastItem: boolean) => {
        const gradients = {
            0: "from-blue-600 to-indigo-600",
            1: "from-indigo-600 to-purple-600",
            2: "from-purple-600 to-pink-600",
            3: "from-pink-600 to-rose-600",
            4: "from-rose-600 to-orange-600",
            5: "from-orange-600 to-amber-600",
        }

        const bgGradients = {
            0: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
            1: "from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40",
            2: "from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40",
            3: "from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40",
            4: "from-rose-50 to-orange-50 dark:from-rose-950/40 dark:to-orange-950/40",
            5: "from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/40",
        }

        const gradientIndex = index % 6
        const gradient = gradients[gradientIndex as keyof typeof gradients]
        const bgGradient = bgGradients[gradientIndex as keyof typeof bgGradients]

        const NotificationIcon = NOTIFICATION_STYLES[notification.formName]?.icon || AlertCircle;

        return (
            <Card
                key={notification.autoId}
                className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    "hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40",
                    "hover:-translate-y-0.5",
                    "bg-gradient-to-br",
                    bgGradient,
                    "border-0",
                    "mb-4"
                )}
            >


                <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-70"
                        style={{
                            backgroundImage: `linear-gradient(to bottom, var(--${gradient.split(' ')[0]}-color), var(--${gradient.split(' ')[2]}-color))`
                        }} />

                    <div className="pl-3 pr-3 py-3">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-500" />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="font-medium text-[13px] text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                                            {notification.branchName || 'İsimsiz'}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-sm">{notification.branchName}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className={cn(
                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide",
                                    "bg-gradient-to-r",
                                    gradient,
                                    "text-white shadow-sm"
                                )}>
                                    {notification.formName}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Avatar className={cn(
                                "w-8 h-8 text-xs relative transition-all duration-300",
                                "group-hover:scale-110",
                                "bg-gradient-to-br shadow-md",
                                gradient,
                                "text-white flex items-center justify-center"
                            )}>
                                <NotificationIcon className="h-4 w-4" />
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTime(notification.orderDateTime)}</span>
                                        </div>
                                        <span className="mx-1">•</span>
                                        <div className="flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3" />
                                            <span>{new Date(notification.orderDateTime).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long'
                                            })}</span>
                                        </div>
                                    </div>

                                    {useMockData && notification.customer && (
                                        <div className="text-[13px] font-medium text-gray-800 dark:text-gray-200 mb-1">
                                            {notification.customer}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                                            <ClipboardCheck className="w-3 h-3" />
                                            <span>{notification.type === "1" ? 'Form Oluşturuldu' : 'Form Güncellendi'}</span>
                                        </div>
                                        
                                        {useMockData && notification.amount !== undefined && (
                                            <div className={cn(
                                                "text-[13px] font-medium",
                                                notification.formName === "Satış İşlemi" 
                                                    ? "text-emerald-600 dark:text-emerald-400" 
                                                    : "text-blue-600 dark:text-blue-400"
                                            )}>
                                                {formatCurrency(notification.amount)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        )
    }, [useMockData]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-none py-6 px-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Bildirimler</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => fetchNotifications()}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {intervalLoading ? (
                                    <PulseLoader color="currentColor" size={3} />
                                ) : (
                                    <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-sm">Bildirimleri yenile</p>
                        </TooltipContent>
                    </Tooltip>
                    <SettingsMenu settings={tempSettings} setSettings={setTempSettings} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
            >
                {loading ? (
                    <div className="flex justify-center py-10">
                        <PulseLoader color="currentColor" size={8} />
                    </div>
                ) : error ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500" />
                        <p>{error}</p>
                        <button
                            onClick={() => fetchNotifications(true)}
                            className="mt-4 text-sm text-amber-600 dark:text-amber-400 hover:underline"
                        >
                            Yeniden dene
                        </button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        <Bell className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                        <p>Son 24 saat içinde bildirim yok</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {notifications.map((notification, index) => renderNotification(
                            notification,
                            index,
                            index === notifications.length - 1
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}