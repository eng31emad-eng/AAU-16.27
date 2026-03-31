'use client'

import { useEffect, useState } from 'react'
import { Building, Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  createAdminCenter,
  deleteAdminCenter,
  getAdminCenters,
  type AdminCenterItem,
  updateAdminCenter,
} from '@/services/data/admin-content'

const emptyForm: AdminCenterItem = {
  id: '',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
  services: [],
  programs: [],
  image: '',
  location: '',
  phone: '',
  email: '',
  isPublished: true,
  displayOrder: 0,
}

export default function CentersManagementPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminCenterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminCenterItem>(emptyForm)
  const [servicesText, setServicesText] = useState('')
  const [programsText, setProgramsText] = useState('')

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      setItems(await getAdminCenters())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل المراكز', 'Failed to load centers'))
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof AdminCenterItem, value: string | boolean | number | string[]) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setFormData(emptyForm)
    setServicesText('')
    setProgramsText('')
    setIsDialogOpen(true)
  }

  function openEdit(item: AdminCenterItem) {
    setEditingId(item.id)
    setFormData(item)
    setServicesText(item.services.join('\n'))
    setProgramsText(item.programs.join('\n'))
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.titleAr.trim()) {
      toast.error(t('اسم المركز بالعربية مطلوب', 'Arabic center title is required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descAr: formData.descAr,
        descEn: formData.descEn,
        services: servicesText.split('\n').map((item) => item.trim()).filter(Boolean),
        programs: programsText.split('\n').map((item) => item.trim()).filter(Boolean),
        image: formData.image,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }

      if (editingId) {
        await updateAdminCenter(editingId, payload)
        toast.success(t('تم تحديث المركز', 'Center updated'))
      } else {
        await createAdminCenter(payload)
        toast.success(t('تمت إضافة المركز', 'Center created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ المركز', 'Failed to save center'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('هل تريد حذف هذا المركز؟', 'Delete this center?'))) {
      return
    }

    try {
      await deleteAdminCenter(id)
      toast.success(t('تم حذف المركز', 'Center deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف المركز', 'Failed to delete center'))
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('إدارة المراكز', 'Centers Management')}</h1>
          <p className="text-muted-foreground">{t('تحرير مراكز الجامعة من البيانات الحية', 'Manage live university centers')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('إضافة مركز', 'Add Center')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('المركز', 'Center')}</TableHead>
              <TableHead>{t('الوصف', 'Description')}</TableHead>
              <TableHead>{t('الخدمات', 'Services')}</TableHead>
              <TableHead>{t('البرامج', 'Programs')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
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
                  {t('لا توجد مراكز بعد', 'No centers yet')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {item.titleAr || item.titleEn}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm truncate">{item.descAr || item.descEn || '-'}</TableCell>
                  <TableCell><Badge variant="outline">{item.services.length}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{item.programs.length}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                      {item.isPublished ? t('منشور', 'Published') : t('مخفي', 'Hidden')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('تعديل مركز', 'Edit Center') : t('إضافة مركز', 'Add Center')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('اسم المركز بالعربية', 'Arabic Center Title')}</Label>
                <Input dir="rtl" value={formData.titleAr} onChange={(e) => updateField('titleAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('اسم المركز بالإنجليزية', 'English Center Title')}</Label>
                <Input value={formData.titleEn} onChange={(e) => updateField('titleEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('الوصف بالعربية', 'Arabic Description')}</Label>
                <Textarea dir="rtl" rows={5} value={formData.descAr} onChange={(e) => updateField('descAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الوصف بالإنجليزية', 'English Description')}</Label>
                <Textarea rows={5} value={formData.descEn} onChange={(e) => updateField('descEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('الخدمات', 'Services')}</Label>
                <Textarea
                  dir="rtl"
                  rows={6}
                  value={servicesText}
                  onChange={(e) => setServicesText(e.target.value)}
                  placeholder={t('خدمة في كل سطر', 'One service per line')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('البرامج', 'Programs')}</Label>
                <Textarea
                  dir="rtl"
                  rows={6}
                  value={programsText}
                  onChange={(e) => setProgramsText(e.target.value)}
                  placeholder={t('برنامج في كل سطر', 'One program per line')}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('رابط الصورة', 'Image URL')}</Label>
                <Input dir="ltr" value={formData.image} onChange={(e) => updateField('image', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الموقع', 'Location')}</Label>
                <Input dir="rtl" value={formData.location} onChange={(e) => updateField('location', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label>{t('البريد الإلكتروني', 'Email')}</Label>
                <Input dir="ltr" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الهاتف', 'Phone')}</Label>
                <Input dir="ltr" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('ترتيب العرض', 'Display Order')}</Label>
                <Input type="number" value={formData.displayOrder} onChange={(e) => updateField('displayOrder', Number(e.target.value))} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t('نشر المركز', 'Publish Center')}</p>
                <p className="text-sm text-muted-foreground">{t('إظهار المركز في الموقع العام', 'Show center on the public website')}</p>
              </div>
              <Switch checked={formData.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('إلغاء', 'Cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ', 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
