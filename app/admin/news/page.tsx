'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Eye, Edit } from 'lucide-react'
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
import { createAdminNews, deleteAdminNews, getAdminNews, type AdminNewsItem, updateAdminNews } from '@/services/data/admin-content'

const emptyForm: AdminNewsItem = {
  id: '',
  titleAr: '',
  titleEn: '',
  slug: '',
  descriptionAr: '',
  descriptionEn: '',
  contentAr: '',
  contentEn: '',
  image: '',
  publishDate: '',
  displayOrder: 0,
  isPublished: true,
  views: 0,
}

export default function NewsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminNewsItem>(emptyForm)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminNews())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الأخبار', 'Failed to load news'))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  const openEdit = (item: AdminNewsItem) => {
    setEditingId(item.id)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleChange = (field: keyof AdminNewsItem, value: string | boolean | number) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.titleAr) {
      toast.error(t('عنوان الخبر مطلوب', 'News title is required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: formData.titleAr,
        slug: formData.slug,
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        contentAr: formData.contentAr,
        contentEn: formData.contentEn,
        image: formData.image,
        publishDate: formData.publishDate,
        displayOrder: formData.displayOrder,
        isPublished: formData.isPublished ? 1 : 0,
        summary: formData.descriptionAr || formData.descriptionEn,
        content: formData.contentAr || formData.contentEn,
      }
      if (editingId) {
        await updateAdminNews(editingId, payload)
        toast.success(t('تم تحديث الخبر', 'News updated'))
      } else {
        await createAdminNews(payload)
        toast.success(t('تمت إضافة الخبر', 'News created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الخبر', 'Failed to save news'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذا الخبر؟', 'Delete this news item?'))) return
    try {
      await deleteAdminNews(id)
      toast.success(t('تم حذف الخبر', 'News deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف الخبر', 'Failed to delete news'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('إدارة الأخبار', 'News Management')}</h1>
          <p className="text-muted-foreground">{t('تحرير أخبار الموقع من البيانات الحية', 'Manage live website news content')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          {t('إضافة خبر', 'Add News')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('العنوان', 'Title')}</TableHead>
              <TableHead>{t('تاريخ النشر', 'Publish Date')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead>{t('المشاهدات', 'Views')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('جاري التحميل...', 'Loading...')}</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-8 text-center">{t('لا توجد أخبار', 'No news found')}</TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="max-w-md font-medium">{item.titleAr || item.titleEn}</TableCell>
                <TableCell>{item.publishDate || '-'}</TableCell>
                <TableCell>
                  <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                    {item.isPublished ? t('منشور', 'Published') : t('مسودة', 'Draft')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2"><Eye className="w-4 h-4 text-muted-foreground" />{item.views}</span>
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
          <DialogHeader><DialogTitle>{editingId ? t('تعديل خبر', 'Edit News') : t('إضافة خبر', 'Add News')}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('العنوان العربي', 'Arabic Title')}</Label><Input dir="rtl" value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('العنوان الإنجليزي', 'English Title')}</Label><Input value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Slug</Label><Input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} dir="ltr" /></div>
              <div className="space-y-2"><Label>{t('تاريخ النشر', 'Publish Date')}</Label><Input type="date" value={formData.publishDate} onChange={(e) => handleChange('publishDate', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('ترتيب العرض', 'Display Order')}</Label><Input type="number" value={formData.displayOrder} onChange={(e) => handleChange('displayOrder', Number(e.target.value))} /></div>
            </div>
            <div className="space-y-2"><Label>{t('رابط الصورة', 'Image URL')}</Label><Input value={formData.image} onChange={(e) => handleChange('image', e.target.value)} dir="ltr" /></div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('وصف مختصر عربي', 'Arabic Summary')}</Label><Textarea dir="rtl" rows={3} value={formData.descriptionAr} onChange={(e) => handleChange('descriptionAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('وصف مختصر إنجليزي', 'English Summary')}</Label><Textarea rows={3} value={formData.descriptionEn} onChange={(e) => handleChange('descriptionEn', e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{t('المحتوى العربي', 'Arabic Content')}</Label><Textarea dir="rtl" rows={8} value={formData.contentAr} onChange={(e) => handleChange('contentAr', e.target.value)} /></div>
              <div className="space-y-2"><Label>{t('المحتوى الإنجليزي', 'English Content')}</Label><Textarea rows={8} value={formData.contentEn} onChange={(e) => handleChange('contentEn', e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t('نشر الخبر', 'Publish News')}</p>
                <p className="text-sm text-muted-foreground">{t('إخفاء الخبر من الموقع عند إيقافه', 'Hide item from public site when disabled')}</p>
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
