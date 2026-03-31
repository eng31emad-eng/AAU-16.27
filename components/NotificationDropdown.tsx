'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, Info, AlertCircle, BellOff, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from './ui/button'

export function NotificationDropdown() {
    const { t, language } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(3)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Mock Notifications
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            titleAr: 'تم رصد النتائج',
            titleEn: 'Results Published',
            descAr: 'تم رصد نتائج الفصل الدراسي الأول لكافة التخصصات.',
            descEn: 'First semester results have been published for all majors.',
            type: 'success',
            timeAr: 'منذ ساعتين',
            timeEn: '2 hours ago',
            isRead: false
        },
        {
            id: 2,
            titleAr: 'تنبيه إداري',
            titleEn: 'Administrative Alert',
            descAr: 'غداً عطلة رسمية بمناسبة المولد النبوي الشريف.',
            descEn: 'Tomorrow is an official holiday.',
            type: 'info',
            timeAr: 'منذ 5 ساعات',
            timeEn: '5 hours ago',
            isRead: false
        },
        {
            id: 3,
            titleAr: 'تذكير بالاستبيان',
            titleEn: 'Survey Reminder',
            descAr: 'يرجى استكمال استبيان جودة التعليم قبل نهاية الأسبوع.',
            descEn: 'Please complete the educational quality survey before the weekend.',
            type: 'warning',
            timeAr: 'أمس',
            timeEn: 'Yesterday',
            isRead: false
        }
    ])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
    }

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id))
        if (!notifications.find(n => n.id === id)?.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1))
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-primary shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        className={`absolute top-full mt-4 w-[270px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden 
                            ${language === 'ar'
                                ? '-left-16 sm:left-0'
                                : '-right-16 sm:right-0'}`}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h3 className="font-bold text-lg dark:text-white">
                                {t('الإشعارات', 'Notifications')}
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-secondary hover:underline font-medium"
                                >
                                    {t('تحديد الكل كمقروء', 'Mark all as read')}
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-border/50 flex gap-3 transition-colors hover:bg-muted/20 relative group ${!notif.isRead ? 'bg-secondary/5 dark:bg-secondary/10' : ''}`}
                                    >
                                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                            notif.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' :
                                                'bg-orange-100 text-orange-600 dark:bg-orange-900/30'
                                            }`}>
                                            {notif.type === 'success' ? <Check className="w-5 h-5" /> :
                                                notif.type === 'info' ? <Info className="w-5 h-5" /> :
                                                    <AlertCircle className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold dark:text-gray-100 ${!notif.isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                                                    {t(notif.titleAr, notif.titleEn)}
                                                </h4>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {t(notif.timeAr, notif.timeEn)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                {t(notif.descAr, notif.descEn)}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="absolute top-2 left-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground">
                                    <BellOff className="w-12 h-12 mb-3 opacity-20" />
                                    <p>{t('لا توجد إشعارات حالياً', 'No new notifications')}</p>
                                </div>
                            )}
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
