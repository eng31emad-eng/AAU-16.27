'use client'

import { useEffect, useState } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createAdminProject, deleteAdminProject, getAdminProjects, type AdminProjectItem, updateAdminProject } from '@/services/data/admin-content'

const emptyForm: AdminProjectItem = {
  id: '',
  slug: '',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
  detailsAr: '',
  detailsEn: '',
  startDate: '',
  endDate: '',
  year: new Date().getFullYear(),
  progress: 0,
  status: 'planned',
  isPublished: true,
  displayOrder: 0,
}

export default function ProjectsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminProjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminProjectItem>(emptyForm)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminProjects())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل المشاريع', 'Failed to load projects'))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setIsDialogOpen(true) }
  const openEdit = (item: AdminProjectItem) => { setEditingId(item.id); setFormData(item); setIsDialogOpen(true) }
  const handleChange = (field: keyof AdminProjectItem, value: string | boolean | number) => setFormData((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    if (!formData.titleAr || !formData.slug) {
      toast.error(t('العنوان والرابط المختصر مطلوبان', 'Title and slug are required'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        slug: formData.slug,
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descAr: formData.descAr,
        descEn: formData.descEn,
        detailsAr: formData.detailsAr,
        detailsEn: formData.detailsEn,
        startDate: formData.startDate,
        endDate: formData.endDate,
        year: formData.year,
        progress: formData.progress,
        status: formData.status,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }
      if (editingId) {
        await updateAdminProject(editingId, payload)
        toast.success(t('تم تحديث المشروع', 'Project updated'))
      } else {
        await createAdminProject(payload)
        toast.success(t('تمت إضافة المشروع', 'Project created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ المشروع', 'Failed to save project'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذا المشروع؟', 'Delete this project?'))) return
    try {
      await deleteAdminProject(id)
      toast.success(t('تم حذف المشروع', 'Project deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف المشروع', 'Failed to delete project'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('إدارة المشاريع', 'Projects Management')}</h1>
          <p className="text-muted-foreground">{t('إدارة مشاريع الواجهة والمشاريع الطلابية من الباكند', 'Manage live project records from backend')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('إضافة مشروع', 'Add Project')}</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('المشروع', 'Project')}</TableHead>
              <TableHead>{t('السنة', 'Year')}</TableHead>
              <TableHead>{t('التقدم', 'Progress')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('جاري التحميل...', 'Loading...')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('لا توجد مشاريع', 'No projects found')}</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.titleAr || item.titleEn}</TableCell>
                <TableCell>{item.year || '-'}</TableCell>
                <TableCell>{item.progress}%</TableCell>
                <TableCell className="space-x-2">
                  <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>{item.status}</Badge>
                  <Badge variant={item.isPublished ? 'outline' : 'secondary'}>{item.isPublished ? t('منشور', 'Published') : t('مسودة', 'Draft')}</Badge>
                </TableCell>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? t('تعديل مشروع', 'Edit Project') : t('إضافة مشروع', 'Add Project')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('العنوان العربي', 'Arabic Title')}</Label><Input dir="rtl" value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('العنوان الإنجليزي', 'English Title')}</Label><Input value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Slug</Label><Input dir="ltr" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('السنة', 'Year')}</Label><Input type="number" value={formData.year} onChange={(e) => handleChange('year', Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>{t('التقدم', 'Progress')}</Label><Input type="number" min="0" max="100" value={formData.progress} onChange={(e) => handleChange('progress', Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>{t('ترتيب العرض', 'Display Order')}</Label><Input type="number" value={formData.displayOrder} onChange={(e) => handleChange('displayOrder', Number(e.target.value))} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('الحالة', 'Status')}</Label><Select value={formData.status} onValueChange={(value) => handleChange('status', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">planned</SelectItem><SelectItem value="current">current</SelectItem><SelectItem value="completed">completed</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{t('تاريخ البداية', 'Start Date')}</Label><Input type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('تاريخ النهاية', 'End Date')}</Label><Input type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('وصف مختصر عربي', 'Arabic Summary')}</Label><Textarea dir="rtl" rows={3} value={formData.descAr} onChange={(e) => handleChange('descAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('وصف مختصر إنجليزي', 'English Summary')}</Label><Textarea rows={3} value={formData.descEn} onChange={(e) => handleChange('descEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('تفاصيل عربية', 'Arabic Details')}</Label><Textarea dir="rtl" rows={6} value={formData.detailsAr} onChange={(e) => handleChange('detailsAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('تفاصيل إنجليزية', 'English Details')}</Label><Textarea rows={6} value={formData.detailsEn} onChange={(e) => handleChange('detailsEn', e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div><p className="font-medium">{t('منشور', 'Published')}</p></div>
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
