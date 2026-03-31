'use client'

import { useEffect, useState } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  createAdminFaq,
  deleteAdminFaq,
  getAdminFaqs,
  type AdminFaqItem,
  updateAdminFaq,
} from '@/services/data/admin-content'

const emptyForm: AdminFaqItem = {
  id: '',
  title: '',
  questionAr: '',
  questionEn: '',
  answerAr: '',
  answerEn: '',
  category: '',
  image: '',
  isPublished: true,
  displayOrder: 0,
}

export default function FAQManagementPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminFaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminFaqItem>(emptyForm)

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      setItems(await getAdminFaqs())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('طھط¹ط°ط± طھط­ظ…ظٹظ„ ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط©', 'Failed to load FAQs'))
    } finally {
      setLoading(false)
    }
  }

  function updateField(field: keyof AdminFaqItem, value: string | boolean | number) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  function openEdit(item: AdminFaqItem) {
    setEditingId(item.id)
    setFormData(item)
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    const questionAr = formData.questionAr.trim() || formData.title.trim()
    const answerAr = formData.answerAr.trim()

    if (!questionAr || !answerAr) {
      toast.error(t('ط§ظ„ط³ط¤ط§ظ„ ظˆط§ظ„ط¬ظˆط§ط¨ ط¨ط§ظ„ط¹ط±ط¨ظٹط© ظ…ط·ظ„ظˆط¨ط§ظ†', 'Arabic question and answer are required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: questionAr,
        content: answerAr,
        questionAr,
        questionEn: formData.questionEn,
        answerAr,
        answerEn: formData.answerEn,
        category: formData.category,
        image: formData.image,
        isPublished: formData.isPublished ? 1 : 0,
        displayOrder: formData.displayOrder,
      }

      if (editingId) {
        await updateAdminFaq(editingId, payload)
        toast.success(t('طھظ… طھط­ط¯ظٹط« ط§ظ„ط³ط¤ط§ظ„', 'FAQ updated'))
      } else {
        await createAdminFaq(payload)
        toast.success(t('طھظ…طھ ط¥ط¶ط§ظپط© ط§ظ„ط³ط¤ط§ظ„', 'FAQ created'))
      }
      setIsDialogOpen(false)
      await loadData()
      void triggerSmartchatReindex(editingId ? 'faq_updated' : 'faq_created')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('طھط¹ط°ط± ط­ظپط¸ ط§ظ„ط³ط¤ط§ظ„', 'Failed to save FAQ'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('ظ‡ظ„ طھط±ظٹط¯ ط­ط°ظپ ظ‡ط°ط§ ط§ظ„ط³ط¤ط§ظ„طں', 'Delete this FAQ item?'))) {
      return
    }

    try {
      await deleteAdminFaq(id)
      toast.success(t('طھظ… ط­ط°ظپ ط§ظ„ط³ط¤ط§ظ„', 'FAQ deleted'))
      await loadData()
      void triggerSmartchatReindex('faq_deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('طھط¹ط°ط± ط­ط°ظپ ط§ظ„ط³ط¤ط§ظ„', 'Failed to delete FAQ'))
    }
  }

  async function triggerSmartchatReindex(reason: string) {
    try {
      const response = await fetch('/api/smartchat/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || payload?.ok === false) {
        toast.error(t('تعذر تحديث فهرس الشات الذكي', 'Failed to refresh smart chat index'))
        return
      }
      if (payload?.updated) {
        toast.success(t('تم تحديث فهرس الشات الذكي', 'Smart chat index refreshed'))
      }
    } catch {
      toast.error(t('تعذر تحديث فهرس الشات الذكي', 'Failed to refresh smart chat index'))
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('ط¥ط¯ط§ط±ط© ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط©', 'FAQ Management')}</h1>
          <p className="text-muted-foreground">{t('طھط­ط±ظٹط± ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط´ط§ط¦ط¹ط© ظ…ظ† ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط­ظٹط©', 'Manage live FAQ content')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('ط¥ط¶ط§ظپط© ط³ط¤ط§ظ„', 'Add Question')}
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="py-8 text-center">{t('ط¬ط§ط±ظٹ ط§ظ„طھط­ظ…ظٹظ„...', 'Loading...')}</CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">{t('ظ„ط§ طھظˆط¬ط¯ ط£ط³ط¦ظ„ط© ط¨ط¹ط¯', 'No FAQs yet')}</CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{item.questionAr || item.title || item.questionEn}</CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('ط§ظ„طھطµظ†ظٹظپ', 'Category')}: {item.category || '-'} | {t('ط§ظ„طھط±طھظٹط¨', 'Order')}: {item.displayOrder}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answerAr || item.answerEn}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('طھط¹ط¯ظٹظ„ ط³ط¤ط§ظ„', 'Edit FAQ') : t('ط¥ط¶ط§ظپط© ط³ط¤ط§ظ„', 'Add FAQ')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('ط§ظ„ط³ط¤ط§ظ„ ط¨ط§ظ„ط¹ط±ط¨ظٹط©', 'Arabic Question')}</Label>
                <Input dir="rtl" value={formData.questionAr} onChange={(e) => updateField('questionAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('ط§ظ„ط³ط¤ط§ظ„ ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©', 'English Question')}</Label>
                <Input value={formData.questionEn} onChange={(e) => updateField('questionEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('ط§ظ„ط¥ط¬ط§ط¨ط© ط¨ط§ظ„ط¹ط±ط¨ظٹط©', 'Arabic Answer')}</Label>
                <Textarea dir="rtl" rows={6} value={formData.answerAr} onChange={(e) => updateField('answerAr', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('ط§ظ„ط¥ط¬ط§ط¨ط© ط¨ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©', 'English Answer')}</Label>
                <Textarea rows={6} value={formData.answerEn} onChange={(e) => updateField('answerEn', e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t('ط§ظ„طھطµظ†ظٹظپ', 'Category')}</Label>
                <Input value={formData.category} onChange={(e) => updateField('category', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('طھط±طھظٹط¨ ط§ظ„ط¹ط±ط¶', 'Display Order')}</Label>
                <Input type="number" value={formData.displayOrder} onChange={(e) => updateField('displayOrder', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>{t('ط±ط§ط¨ط· ط§ظ„طµظˆط±ط©', 'Image URL')}</Label>
                <Input dir="ltr" value={formData.image} onChange={(e) => updateField('image', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t('ظ†ط´ط± ط§ظ„ط³ط¤ط§ظ„', 'Publish FAQ')}</p>
                <p className="text-sm text-muted-foreground">{t('ط¥ط¸ظ‡ط§ط± ط§ظ„ط³ط¤ط§ظ„ ظپظٹ ط§ظ„ظ…ظˆظ‚ط¹ ط§ظ„ط¹ط§ظ…', 'Show the FAQ on the public website')}</p>
              </div>
              <Switch checked={formData.isPublished} onCheckedChange={(checked) => updateField('isPublished', checked)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('ط¥ظ„ط؛ط§ط،', 'Cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving ? t('ط¬ط§ط±ظچ ط§ظ„ط­ظپط¸...', 'Saving...') : t('ط­ظپط¸', 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

