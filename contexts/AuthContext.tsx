'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCurrentAccess, loginWithFrappe, logoutFromFrappe, mapAccessToUser, type AuthUser, type AccessRole } from '@/services/data/auth-api';

type UserRole = AccessRole;

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (credentials: { username: string; password: string; expectedRole?: Exclude<UserRole, null> | null }) => Promise<AuthUser>;
    logout: () => Promise<void>;
    refreshAccess: () => Promise<AuthUser | null>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const syncRoleStorage = (nextUser: AuthUser | null) => {
        if (typeof window === 'undefined') {
            return;
        }
        if (nextUser?.role) {
            localStorage.setItem('userRole', nextUser.role === 'doctor' ? 'teacher' : nextUser.role);
        } else {
            localStorage.removeItem('userRole');
        }
    };

    const applyAccess = async () => {
        const access = await fetchCurrentAccess();
        const nextUser = mapAccessToUser(access);
        setUser(nextUser);
        syncRoleStorage(nextUser);
        return nextUser;
    };

    const applyAccessWithRetry = async (attempts = 3, delayMs = 250) => {
        let lastUser: AuthUser | null = null;
        for (let i = 0; i < attempts; i++) {
            lastUser = await applyAccess();
            if (lastUser) {
                return lastUser;
            }
            if (i < attempts - 1) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        }
        return lastUser;
    };

    useEffect(() => {
        applyAccess()
            .catch(() => {
                setUser(null);
                syncRoleStorage(null);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const login = async ({
        username,
        password,
        expectedRole,
    }: {
        username: string;
        password: string;
        expectedRole?: Exclude<UserRole, null> | null;
    }) => {
        setIsLoading(true);
        try {
            await loginWithFrappe(username, password);
            const nextUser = await applyAccessWithRetry();

            if (!nextUser) {
                throw new Error('لم يتم إنشاء جلسة صالحة بعد تسجيل الدخول');
            }

            if (expectedRole && nextUser.role !== expectedRole) {
                await logoutFromFrappe();
                setUser(null);
                syncRoleStorage(null);
                throw new Error(
                    expectedRole === 'student'
                        ? 'هذا الحساب لا يملك صلاحية بوابة الطالب'
                        : expectedRole === 'doctor'
                            ? 'هذا الحساب لا يملك صلاحية بوابة عضو هيئة التدريس'
                            : 'هذا الحساب لا يملك الصلاحية المطلوبة'
                );
            }

            return nextUser;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await logoutFromFrappe();
        setUser(null);
        syncRoleStorage(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshAccess: applyAccess, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
