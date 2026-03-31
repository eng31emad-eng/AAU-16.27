'use client'

import { useEffect, useState } from 'react'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
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
  createAdminBlogPost,
  deleteAdminBlogPost,
  getAdminBlogPosts,
  type AdminBlogItem,
  updateAdminBlogPost,
} from '@/services/data/admin-content'

const emptyForm: AdminBlogItem = {
  id: '',
  slug: '',
  titleAr: '',
  titleEn: '',
  excerptAr: '',
  excerptEn: '',
  contentAr: '',
  contentEn: '',
  authorNameAr: '',
  authorNameEn: '',
  category: '',
  categoryAr: '',
  categoryEn: '',
  image: '',
  publishedAt: '',
  readTime: 0,
  views: 0,
  isPublished: true,
  displayOrder: 0,
}

export default function BlogManagementPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminBlogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminBlogItem>(emptyForm)

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      setItems(await getAdminBlogPosts())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل المقالات', 'Failed to load blog posts'))
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof AdminBlogItem, value: string | number | boolean) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  function openEdit(item: AdminBlogItem) {
    setEditingId(item.id)
    setFormData(item)
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.titleAr.trim()) {
      toast.error(t('عنوان المقال العربي مطلوب', 'Arabic blog title is required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        slug: formData.slug,
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        excerptAr: formData.excerptAr,
        excerptEn: formData.excerptEn,
        contentAr: formData.contentAr,
        contentEn: formData.contentEn,
        authorNameAr: formData.authorNameAr,
        authorNameEn: formData.authorNameEn,
        authorRoleAr: '',
        authorRoleEn: '',
        category: formData.category || formData.categoryAr,
        categoryAr: formData.categoryAr || formData.category,
        categoryEn: formData.categoryEn || formData.category,
        image: formData.image,
        publishedAt: formData.publishedAt,
        readTime: formData.readTime,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }

      if (editingId) {
        await updateAdminBlogPost(editingId, payload)
        toast.success(t('تم تحديث المقال', 'Blog post updated'))
      } else {
        await createAdminBlogPost(payload)
        toast.success(t('تمت إضافة المقال', 'Blog post created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ المقال', 'Failed to save blog post'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('هل تريد حذف هذا المقال؟', 'Delete this blog post?'))) {
      return
    }

    try {
      await deleteAdminBlogPost(id)
      toast.success(t('تم حذف المقال', 'Blog post deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف المقال', 'Failed to delete blog post'))
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('إدارة المدونة', 'Blog Management')}</h1>
          <p className="text-muted-foreground">{t('تحرير مقالات الموقع من البيانات الحية', 'Manage live blog posts')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('إضافة مقال', 'Add Post')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('العنوان', 'Title')}</TableHead>
              <TableHead>{t('الكاتب', 'Author')}</TableHead>
              <TableHead>{t('التصنيف', 'Category')}</TableHead>
              <TableHead>{t('تاريخ النشر', 'Publish Date')}</TableHead>
              <TableHead>{t('الحالة', 'Status')}</TableHead>
              <TableHead>{t('المشاهدات', 'Views')}</TableHead>
              <TableHead className="text-right">{t('الإجراءات', 'Actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {t('جاري التحميل...', 'Loading...')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  {t('لا توجد مقالات بعد', 'No blog posts yet')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-sm font-medium">{item.titleAr || item.titleEn}</TableCell>
                  <TableCell>{item.authorNameAr || item.authorNameEn || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.categoryAr || item.categoryEn || item.category || '-'}</Badge>
                  </TableCell>
                  <TableCell>{item.publishedAt || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                      {item.isPublished ? t('منشور', 'Published') : t('مسودة', 'Draft')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      {item.views}
                    </span>
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
            <DialogTitle>{editingId ? t('تعديل مقال', 'Edit Post') : t('إضافة مقال', 'Add Post')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('العنوان العربي', 'Arabic Title')}</Label>
                <Input dir="rtl" value={formData.titleAr} onChange={(e) => updateField('titleAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('العنوان الإنجليزي', 'English Title')}</Label>
                <Input value={formData.titleEn} onChange={(e) => updateField('titleEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input dir="ltr" value={formData.slug} onChange={(e) => updateField('slug', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('تاريخ النشر', 'Publish Date')}</Label>
                <Input type="date" value={formData.publishedAt} onChange={(e) => updateField('publishedAt', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('مدة القراءة بالدقائق', 'Read Time')}</Label>
                <Input type="number" value={formData.readTime} onChange={(e) => updateField('readTime', Number(e.target.value))} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('اسم الكاتب بالعربية', 'Arabic Author')}</Label>
                <Input dir="rtl" value={formData.authorNameAr} onChange={(e) => updateField('authorNameAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('اسم الكاتب بالإنجليزية', 'English Author')}</Label>
                <Input value={formData.authorNameEn} onChange={(e) => updateField('authorNameEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t('الفئة الأساسية', 'Base Category')}</Label>
                <Input value={formData.category} onChange={(e) => updateField('category', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الفئة بالعربية', 'Arabic Category')}</Label>
                <Input dir="rtl" value={formData.categoryAr} onChange={(e) => updateField('categoryAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الفئة بالإنجليزية', 'English Category')}</Label>
                <Input value={formData.categoryEn} onChange={(e) => updateField('categoryEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('الوصف المختصر بالعربية', 'Arabic Excerpt')}</Label>
                <Textarea dir="rtl" rows={3} value={formData.excerptAr} onChange={(e) => updateField('excerptAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الوصف المختصر بالإنجليزية', 'English Excerpt')}</Label>
                <Textarea rows={3} value={formData.excerptEn} onChange={(e) => updateField('excerptEn', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('رابط الصورة', 'Image URL')}</Label>
              <Input dir="ltr" value={formData.image} onChange={(e) => updateField('image', e.target.value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('المحتوى العربي', 'Arabic Content')}</Label>
                <Textarea dir="rtl" rows={10} value={formData.contentAr} onChange={(e) => updateField('contentAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('المحتوى الإنجليزي', 'English Content')}</Label>
                <Textarea rows={10} value={formData.contentEn} onChange={(e) => updateField('contentEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('ترتيب العرض', 'Display Order')}</Label>
                <Input type="number" value={formData.displayOrder} onChange={(e) => updateField('displayOrder', Number(e.target.value))} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">{t('نشر المقال', 'Publish Post')}</p>
                  <p className="text-sm text-muted-foreground">{t('إظهار المقال في الموقع العام', 'Show the post on the public website')}</p>
                </div>
                <Switch checked={formData.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
              </div>
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
