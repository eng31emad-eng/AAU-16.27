'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'doctor' | 'student')[];
}

function getDefaultRoute(role?: 'admin' | 'doctor' | 'student' | null) {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'doctor') return '/doctor-dashboard';
    if (role === 'student') return '/student-dashboard';
    return '/';
}

/**
 * حارس المسارات (Route Guard)
 * يستخدم لحماية الصفحات بناءً على حالة تسجيل الدخول ودور المستخدم.
 */
export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
            } else if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
                router.push(getDefaultRoute(user.role));
            }
        }
    }, [isAuthenticated, user, isLoading, allowedRoles, router, pathname]);

    // عرض حالة تحميل بسيطة للحفاظ على تجربة مستخدم سلسة أثناء التحقق
    if (isLoading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role as any))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium animate-pulse">
                        جاري التحقق من الصلاحيات...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
