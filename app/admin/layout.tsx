import AdminLayoutClient from './layout-client';
import { RouteGuard } from '@/components/RouteGuard';

export const dynamic = "force-dynamic";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RouteGuard allowedRoles={['admin']}>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </RouteGuard>
    );
}
