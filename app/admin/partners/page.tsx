'use client'

import { useEffect, useState } from 'react'
import { Building2, Edit, Plus, Trash2 } from 'lucide-react'
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
import { createAdminPartner, deleteAdminPartner, getAdminPartners, type AdminPartnerItem, updateAdminPartner } from '@/services/data/admin-content'

const emptyForm: AdminPartnerItem = { id: '', title: '', content: '', image: '', isPublished: true, displayOrder: 0 }

export default function PartnersPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminPartnerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminPartnerItem>(emptyForm)

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminPartners())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الشركاء', 'Failed to load partners'))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setEditingId(null); setFormData(emptyForm); setIsDialogOpen(true) }
  const openEdit = (item: AdminPartnerItem) => { setEditingId(item.id); setFormData(item); setIsDialogOpen(true) }
  const handleChange = (field: keyof AdminPartnerItem, value: string | boolean | number) => setFormData((current) => ({ ...current, [field]: value }))

  const handleSubmit = async () => {
    if (!formData.title) {
      toast.error(t('اسم الشريك مطلوب', 'Partner title is required'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        image: formData.image,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }
      if (editingId) {
        await updateAdminPartner(editingId, payload)
        toast.success(t('تم تحديث الشريك', 'Partner updated'))
      } else {
        await createAdminPartner(payload)
        toast.success(t('تمت إضافة الشريك', 'Partner created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الشريك', 'Failed to save partner'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذا الشريك؟', 'Delete this partner?'))) return
    try {
      await deleteAdminPartner(id)
      toast.success(t('تم حذف الشريك', 'Partner deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف الشريك', 'Failed to delete partner'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('إدارة الشركاء', 'Partners Management')}</h1>
          <p className="text-muted-foreground">{t('إدارة شركاء الجامعة من بيانات الباكند المباشرة', 'Manage live partner records from backend')}</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('إضافة شريك', 'Add Partner')}</Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('الشريك', 'Partner')}</TableHead>
              <TableHead>{t('الوصف', 'Description')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="py-8 text-center">{t('جاري التحميل...', 'Loading...')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="py-8 text-center">{t('لا يوجد شركاء', 'No partners found')}</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">{item.content || '-'}</TableCell>
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
          <DialogHeader><DialogTitle>{editingId ? t('تعديل شريك', 'Edit Partner') : t('إضافة شريك', 'Add Partner')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2"><Label>{t('اسم الشريك', 'Partner Title')}</Label><Input value={formData.title} onChange={(e) => handleChange('title', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('رابط الصورة', 'Image URL')}</Label><Input dir="ltr" value={formData.image} onChange={(e) => handleChange('image', e.target.value)} /></div>
            <div className="space-y-2"><Label>{t('الوصف', 'Description')}</Label><Textarea rows={6} value={formData.content} onChange={(e) => handleChange('content', e.target.value)} /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('ترتيب العرض', 'Display Order')}</Label><Input type="number" value={formData.displayOrder} onChange={(e) => handleChange('displayOrder', Number(e.target.value))} /></div>
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
