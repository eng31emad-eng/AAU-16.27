'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface RouteGuardProps {
    children: ReactNode;
    allowedRoles?: ('admin' | 'doctor' | 'student')[];
}

function getDefaultRoute(role?: 'admin' | 'doctor' | 'student' | null) {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'doctor') return '/doctor-dashboard';
    if (role === 'student') return '/student-dashboard';
    return '/';
}

export const RouteGuard = ({ children, allowedRoles }: RouteGuardProps) => {
    const { user, isLoading, isAuthenticated } = useAuth();
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
    }, [isLoading, isAuthenticated, user, allowedRoles, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground animate-pulse">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    // If we have a role requirement and it's not met, we don't render children
    // (The useEffect will handle the redirection)
    if (allowedRoles && user && !allowedRoles.includes(user.role as any)) {
        return null;
    }

    return <>{children}</>;
};
