import DoctorDashboard from './client';
import { RouteGuard } from '@/components/RouteGuard';

export const dynamic = "force-dynamic";

export default function DoctorDashboardPage() {
    return (
        <RouteGuard allowedRoles={['doctor']}>
            <DoctorDashboard />
        </RouteGuard>
    );
}
