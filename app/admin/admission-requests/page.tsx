'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  listAdmissionRequests,
  type AdmissionRequestItem,
  type AdmissionStatus,
  updateAdmissionRequestStatus,
} from '@/services/data/admission-api'

const STATUSES: AdmissionStatus[] = ['pending', 'reviewed', 'accepted', 'rejected']

function statusBadgeVariant(status: AdmissionStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'accepted') return 'default'
  if (status === 'rejected') return 'destructive'
  if (status === 'reviewed') return 'secondary'
  return 'outline'
}

function statusLabel(status: AdmissionStatus, t: (ar: string, en: string) => string) {
  if (status === 'accepted') return t('مقبول', 'Accepted')
  if (status === 'rejected') return t('مرفوض', 'Rejected')
  if (status === 'reviewed') return t('تمت المراجعة', 'Reviewed')
  return t('قيد الانتظار', 'Pending')
}

export default function AdmissionRequestsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdmissionRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await listAdmissionRequests())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الطلبات', 'Failed to load admission requests'))
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (row: AdmissionRequestItem, status: AdmissionStatus) => {
    setSavingId(row.id)
    try {
      await updateAdmissionRequestStatus(row.id, status)
      toast.success(t('تم تحديث حالة الطلب', 'Request status updated'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحديث حالة الطلب', 'Failed to update request status'))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('طلبات القبول', 'Admission Requests')}</h1>
          <p className="text-muted-foreground">{t('عرض وإدارة جميع الطلبات المرسلة من نموذج القبول', 'Review and manage all requests submitted from admission form')}</p>
        </div>
        <Button variant="outline" onClick={() => void loadData()}>
          {t('تحديث', 'Refresh')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('الاسم', 'Name')}</TableHead>
              <TableHead>{t('بيانات التواصل', 'Contact')}</TableHead>
              <TableHead>{t('التخصص', 'Specialty')}</TableHead>
              <TableHead>{t('تاريخ الإرسال', 'Submitted At')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('تحديث الحالة', 'Update Status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {t('جاري التحميل...', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  {t('لا توجد طلبات حالياً', 'No admission requests found')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.fullName || '-'}</div>
                    <div className="text-xs text-muted-foreground">{row.id}</div>
                  </TableCell>
                  <TableCell>
                    <div>{row.email || '-'}</div>
                    <div className="text-xs text-muted-foreground">{row.phone || '-'}</div>
                  </TableCell>
                  <TableCell>{row.specialty || '-'}</TableCell>
                  <TableCell>{row.createdAt || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(row.status)}>
                      {statusLabel(row.status, t)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={row.status}
                      onValueChange={(value: AdmissionStatus) => {
                        void handleStatusChange(row, value)
                      }}
                      disabled={savingId === row.id}
                    >
                      <SelectTrigger className="w-[170px] ms-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {statusLabel(status, t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
