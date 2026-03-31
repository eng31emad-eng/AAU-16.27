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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createAdminOffer, deleteAdminOffer, getAdminOffers, type AdminOfferItem, updateAdminOffer } from '@/services/data/admin-content'

const emptyForm: AdminOfferItem = {
  id: '',
  titleAr: '',
  titleEn: '',
  descAr: '',
  descEn: '',
  detailsAr: '',
  detailsEn: '',
  category: '',
  image: '',
  validUntil: '',
  requirementsAr: '',
  requirementsEn: '',
  applyLink: '',
  isActive: true,
  isPublished: true,
  displayOrder: 0,
}

export default function OffersPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminOfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminOfferItem>(emptyForm)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminOffers())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل العروض', 'Failed to load offers'))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setIsDialogOpen(true) }
  const openEdit = (item: AdminOfferItem) => { setEditingId(item.id); setFormData(item); setIsDialogOpen(true) }
  const handleChange = (field: keyof AdminOfferItem, value: string | boolean | number) => setFormData((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    if (!formData.titleAr) {
      toast.error(t('عنوان العرض مطلوب', 'Offer title is required'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descAr: formData.descAr,
        descEn: formData.descEn,
        detailsAr: formData.detailsAr,
        detailsEn: formData.detailsEn,
        category: formData.category,
        image: formData.image,
        validUntil: formData.validUntil,
        requirementsAr: formData.requirementsAr,
        requirementsEn: formData.requirementsEn,
        applyLink: formData.applyLink,
        isActive: formData.isActive ? 1 : 0,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }
      if (editingId) {
        await updateAdminOffer(editingId, payload)
        toast.success(t('تم تحديث العرض', 'Offer updated'))
      } else {
        await createAdminOffer(payload)
        toast.success(t('تمت إضافة العرض', 'Offer created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ العرض', 'Failed to save offer'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذا العرض؟', 'Delete this offer?'))) return
    try {
      await deleteAdminOffer(id)
      toast.success(t('تم حذف العرض', 'Offer deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف العرض', 'Failed to delete offer'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('إدارة العروض', 'Offers Management')}</h1>
          <p className="text-muted-foreground">{t('إدارة المنح والخصومات والعروض التسويقية', 'Manage scholarships, discounts, and promotional offers')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('إضافة عرض', 'Add Offer')}</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('العنوان', 'Title')}</TableHead>
              <TableHead>{t('الفئة', 'Category')}</TableHead>
              <TableHead>{t('الصلاحية', 'Valid Until')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('جاري التحميل...', 'Loading...')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('لا توجد عروض', 'No offers found')}</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.titleAr || item.titleEn}</TableCell>
                <TableCell>{item.category || '-'}</TableCell>
                <TableCell>{item.validUntil || '-'}</TableCell>
                <TableCell className="space-x-2">
                  <Badge variant={item.isPublished ? 'default' : 'secondary'}>{item.isPublished ? t('منشور', 'Published') : t('مسودة', 'Draft')}</Badge>
                  <Badge variant={item.isActive ? 'outline' : 'secondary'}>{item.isActive ? t('فعال', 'Active') : t('متوقف', 'Inactive')}</Badge>
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
          <DialogHeader><DialogTitle>{editingId ? t('تعديل عرض', 'Edit Offer') : t('إضافة عرض', 'Add Offer')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('العنوان العربي', 'Arabic Title')}</Label><Input dir="rtl" value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('العنوان الإنجليزي', 'English Title')}</Label><Input value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{t('الفئة', 'Category')}</Label><Input value={formData.category} onChange={(e) => handleChange('category', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('صالح حتى', 'Valid Until')}</Label><Input type="date" value={formData.validUntil} onChange={(e) => handleChange('validUntil', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('ترتيب العرض', 'Display Order')}</Label><Input type="number" value={formData.displayOrder} onChange={(e) => handleChange('displayOrder', Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>{t('رابط الصورة', 'Image URL')}</Label><Input dir="ltr" value={formData.image} onChange={(e) => handleChange('image', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('رابط التقديم', 'Apply Link')}</Label><Input dir="ltr" value={formData.applyLink} onChange={(e) => handleChange('applyLink', e.target.value)} /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('وصف مختصر عربي', 'Arabic Summary')}</Label><Textarea dir="rtl" rows={3} value={formData.descAr} onChange={(e) => handleChange('descAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('وصف مختصر إنجليزي', 'English Summary')}</Label><Textarea rows={3} value={formData.descEn} onChange={(e) => handleChange('descEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('تفاصيل عربية', 'Arabic Details')}</Label><Textarea dir="rtl" rows={5} value={formData.detailsAr} onChange={(e) => handleChange('detailsAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('تفاصيل إنجليزية', 'English Details')}</Label><Textarea rows={5} value={formData.detailsEn} onChange={(e) => handleChange('detailsEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('المتطلبات بالعربية', 'Arabic Requirements')}</Label><Textarea dir="rtl" rows={4} value={formData.requirementsAr} onChange={(e) => handleChange('requirementsAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('المتطلبات بالإنجليزية', 'English Requirements')}</Label><Textarea rows={4} value={formData.requirementsEn} onChange={(e) => handleChange('requirementsEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">{t('فعال', 'Active')}</p></div><Switch checked={formData.isActive} onCheckedChange={(checked) => handleChange('isActive', checked)} /></div>
              <div className="flex items-center justify-between rounded-lg border p-4"><div><p className="font-medium">{t('منشور', 'Published')}</p></div><Switch checked={formData.isPublished} onCheckedChange={(checked) => handleChange('isPublished', checked)} /></div>
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
