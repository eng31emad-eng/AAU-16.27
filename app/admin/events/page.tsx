'use client'

import { useEffect, useState } from 'react'
import { Calendar, Edit, MapPin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createAdminEvent, deleteAdminEvent, getAdminEvents, type AdminEventItem, updateAdminEvent } from '@/services/data/admin-content'

const emptyForm: AdminEventItem = {
  id: '',
  eventTitle: '',
  description: '',
  eventDate: '',
  location: '',
  image: '',
  isPublished: true,
  displayOrder: 0,
}

export default function EventsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminEventItem>(emptyForm)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminEvents())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الفعاليات', 'Failed to load events'))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const openEdit = (item: AdminEventItem) => {
    setEditingId(item.id)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleChange = (field: keyof AdminEventItem, value: string | boolean | number) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.eventTitle) {
      toast.error(t('عنوان الفعالية مطلوب', 'Event title is required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        eventTitle: formData.eventTitle,
        description: formData.description,
        eventDate: formData.eventDate,
        location: formData.location,
        image: formData.image,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }
      if (editingId) {
        await updateAdminEvent(editingId, payload)
        toast.success(t('تم تحديث الفعالية', 'Event updated'))
      } else {
        await createAdminEvent(payload)
        toast.success(t('تمت إضافة الفعالية', 'Event created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الفعالية', 'Failed to save event'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذه الفعالية؟', 'Delete this event?'))) return
    try {
      await deleteAdminEvent(id)
      toast.success(t('تم حذف الفعالية', 'Event deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف الفعالية', 'Failed to delete event'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('إدارة الفعاليات', 'Events Management')}</h1>
          <p className="text-muted-foreground">{t('تحرير فعاليات الجامعة من البيانات الحية', 'Manage live university events')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('إضافة فعالية', 'Add Event')}</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('العنوان', 'Title')}</TableHead>
              <TableHead>{t('التاريخ', 'Date')}</TableHead>
              <TableHead>{t('الموقع', 'Location')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('جاري التحميل...', 'Loading...')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('لا توجد فعاليات', 'No events found')}</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.eventTitle}</TableCell>
                <TableCell><span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{item.eventDate || '-'}</span></TableCell>
                <TableCell><span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" />{item.location || '-'}</span></TableCell>
                <TableCell><Badge variant={item.isPublished ? 'default' : 'secondary'}>{item.isPublished ? t('منشور', 'Published') : t('مسودة', 'Draft')}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? t('تعديل فعالية', 'Edit Event') : t('إضافة فعالية', 'Add Event')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2"><Label>{t('عنوان الفعالية', 'Event Title')}</Label><Input value={formData.eventTitle} onChange={(e) => handleChange('eventTitle', e.target.value)} /></div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('التاريخ', 'Date')}</Label><Input type="date" value={formData.eventDate} onChange={(e) => handleChange('eventDate', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('الموقع', 'Location')}</Label><Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('ترتيب العرض', 'Display Order')}</Label><Input type="number" value={formData.displayOrder} onChange={(e) => handleChange('displayOrder', Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>{t('رابط الصورة', 'Image URL')}</Label><Input value={formData.image} onChange={(e) => handleChange('image', e.target.value)} dir="ltr" /></div>
            <div className="space-y-2"><Label>{t('الوصف', 'Description')}</Label><Textarea rows={6} value={formData.description} onChange={(e) => handleChange('description', e.target.value)} /></div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t('نشر الفعالية', 'Publish Event')}</p>
                <p className="text-sm text-muted-foreground">{t('إظهارها في الواجهة العامة', 'Show it on the public site')}</p>
              </div>
              <Switch checked={formData.isPublished} onCheckedChange={(checked) => handleChange('isPublished', checked)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleSubmit} disabled={saving}>{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ', 'Save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
