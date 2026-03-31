'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Download, FileText, Film, Image as ImageIcon, Music, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getAdminMedia, uploadAdminMedia, deleteAdminMedia, type AdminMediaItem } from '@/services/data/admin-content'

function mediaIcon(type: string) {
  const normalized = type.toLowerCase()
  if (normalized.includes('image')) return ImageIcon
  if (normalized.includes('video')) return Film
  if (normalized.includes('audio')) return Music
  return FileText
}

export default function MediaPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminMediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => { void loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      setItems(await getAdminMedia())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الوسائط', 'Failed to load media'))
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => items.filter((item) => {
    const query = search.toLowerCase()
    return item.title.toLowerCase().includes(query) || item.type.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
  }), [items, search])

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('اختر ملفًا أولًا', 'Choose a file first'))
      return
    }
    setUploading(true)
    try {
      await uploadAdminMedia(selectedFile)
      toast.success(t('تم رفع الملف', 'File uploaded'))
      setSelectedFile(null)
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر رفع الملف', 'Failed to upload file'))
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('هل تريد حذف هذا الملف؟', 'Delete this file?'))) return
    try {
      await deleteAdminMedia(id)
      toast.success(t('تم حذف الملف', 'File deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف الملف', 'Failed to delete file'))
    }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('تم نسخ الرابط', 'Link copied'))
    } catch {
      toast.error(t('تعذر نسخ الرابط', 'Failed to copy link'))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('مكتبة الوسائط', 'Media Library')}</h1>
          <p className="text-muted-foreground">{t('رفع وحذف الملفات المستخدمة في الموقع', 'Upload and delete files used across the site')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />{t('رفع ملف', 'Upload File')}</Button>
      </div>

      <div className="mb-6">
        <Input placeholder={t('بحث في الوسائط...', 'Search media...')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full rounded-lg border bg-card p-8 text-center">{t('جاري التحميل...', 'Loading...')}</div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full rounded-lg border bg-card p-8 text-center">{t('لا توجد ملفات', 'No media found')}</div>
        ) : filteredItems.map((item) => {
          const Icon = mediaIcon(item.type)
          return (
            <div key={item.id} className="rounded-lg border bg-card p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center"><Icon className="w-5 h-5 text-muted-foreground" /></div>
                  <div>
                    <h3 className="font-medium break-all">{item.title}</h3>
                    <Badge variant="outline">{item.type || 'File'}</Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground break-all">{item.description || item.fileUrl || '-'}</p>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyLink(item.fileUrl)}><Copy className="w-4 h-4 mr-2" />{t('نسخ', 'Copy')}</Button>
                  <Button variant="outline" size="sm" asChild><a href={item.fileUrl} target="_blank" rel="noreferrer"><Download className="w-4 h-4 mr-2" />{t('فتح', 'Open')}</a></Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('رفع ملف جديد', 'Upload New File')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('اختر الملف', 'Choose File')}</Label>
              <Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
              <Button onClick={handleUpload} disabled={uploading}>{uploading ? t('جارٍ الرفع...', 'Uploading...') : t('رفع', 'Upload')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
