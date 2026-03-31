import StudentDashboardContent from './client';
import { RouteGuard } from '@/components/RouteGuard';

export const dynamic = "force-dynamic";

export default function StudentDashboardPage() {
  return (
    <RouteGuard allowedRoles={['student']}>
      <StudentDashboardContent />
    </RouteGuard>
  );
}
