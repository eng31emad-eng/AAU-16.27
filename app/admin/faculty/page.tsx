'use client'

import { useEffect, useState } from 'react'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useLanguage } from '@/contexts/LanguageContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  createAdminFaculty,
  deleteAdminFaculty,
  getAdminDepartments,
  getAdminFaculty,
  type AdminDepartmentOption,
  type AdminFacultyItem,
  updateAdminFaculty,
} from '@/services/data/admin-content'
import { getAdminColleges } from '@/services/data/admin-colleges'

const emptyForm: AdminFacultyItem = {
  id: '',
  fullName: '',
  academicTitle: '',
  linkedCollege: '',
  department: '',
  biography: '',
  photo: '',
  email: '',
  phone: '',
  isActive: true,
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function FacultyManagementPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<AdminFacultyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collegeOptions, setCollegeOptions] = useState<{ id: string; label: string }[]>([])
  const [departmentOptions, setDepartmentOptions] = useState<AdminDepartmentOption[]>([])
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminFacultyItem>(emptyForm)

  useEffect(() => {
    void loadData()
    void loadColleges()
    void loadDepartments()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      setItems(await getAdminFaculty())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل أعضاء هيئة التدريس', 'Failed to load faculty members'))
    } finally {
      setLoading(false)
    }
  }

  async function loadColleges() {
    try {
      const colleges = await getAdminColleges()
      setCollegeOptions(
        colleges.map((college) => ({
          id: college.id,
          label: college.nameAr || college.nameEn || college.collegeName || college.id,
        })),
      )
    } catch {
      setCollegeOptions([])
    }
  }

  async function loadDepartments() {
    try {
      setDepartmentOptions(await getAdminDepartments())
    } catch {
      setDepartmentOptions([])
    }
  }

  function updateField(field: keyof AdminFacultyItem, value: string | boolean) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditingId(null)
    setFormData(emptyForm)
    setIsDialogOpen(true)
  }

  function openEdit(item: AdminFacultyItem) {
    setEditingId(item.id)
    setFormData(item)
    setIsDialogOpen(true)
  }

  async function handleSubmit() {
    if (!formData.fullName.trim()) {
      toast.error(t('اسم عضو هيئة التدريس مطلوب', 'Faculty member name is required'))
      return
    }

    setSaving(true)
    try {
      const payload = {
        full_name: formData.fullName,
        academic_title: formData.academicTitle,
        linked_college: formData.linkedCollege,
        department: formData.department,
        biography: formData.biography,
        photo: formData.photo,
        is_active: formData.isActive ? 1 : 0,
      }

      if (editingId) {
        await updateAdminFaculty(editingId, payload)
        toast.success(t('تم تحديث العضو', 'Faculty member updated'))
      } else {
        await createAdminFaculty(payload)
        toast.success(t('تمت إضافة العضو', 'Faculty member created'))
      }
      setIsDialogOpen(false)
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ العضو', 'Failed to save faculty member'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('هل تريد حذف هذا العضو؟', 'Delete this faculty member?'))) {
      return
    }

    try {
      await deleteAdminFaculty(id)
      toast.success(t('تم حذف العضو', 'Faculty member deleted'))
      await loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف العضو', 'Failed to delete faculty member'))
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">{t('إدارة الكادر التعليمي', 'Faculty Management')}</h1>
          <p className="text-muted-foreground">{t('تحرير أعضاء هيئة التدريس من البيانات الحية', 'Manage live faculty records')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('إضافة عضو', 'Add Member')}
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('العضو', 'Member')}</TableHead>
              <TableHead>{t('الدرجة العلمية', 'Academic Title')}</TableHead>
              <TableHead>{t('الكلية', 'College')}</TableHead>
              <TableHead>{t('القسم', 'Department')}</TableHead>
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
                  {t('لا يوجد أعضاء بعد', 'No faculty members yet')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={item.photo} alt={item.fullName} />
                        <AvatarFallback>{initials(item.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{item.fullName}</p>
                        {item.email ? <p className="text-sm text-muted-foreground">{item.email}</p> : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.academicTitle || '-'}</Badge>
                  </TableCell>
                  <TableCell>{collegeOptions.find((college) => college.id === item.linkedCollege)?.label || '-'}</TableCell>
                  <TableCell>{item.department || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
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
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? t('تعديل عضو', 'Edit Member') : t('إضافة عضو', 'Add Member')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t('الاسم الكامل', 'Full Name')}</Label>
              <Input dir="rtl" value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('الدرجة العلمية', 'Academic Title')}</Label>
                <Input dir="rtl" value={formData.academicTitle} onChange={(e) => updateField('academicTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('الكلية المرتبطة', 'Linked College')}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.linkedCollege}
                  onChange={(e) => updateField('linkedCollege', e.target.value)}
                >
                  <option value="">{t('اختر الكلية', 'Select college')}</option>
                  {collegeOptions.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('القسم', 'Department')}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.department}
                  onChange={(e) => {
                    const nextDepartment = e.target.value
                    const selectedDepartment = departmentOptions.find((department) => department.id === nextDepartment)
                    updateField('department', nextDepartment)
                    if (selectedDepartment?.college) {
                      updateField('linkedCollege', selectedDepartment.college)
                    }
                  }}
                >
                  <option value="">{t('اختر القسم', 'Select department')}</option>
                  {departmentOptions.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.nameAr} {department.collegeLabel ? `- ${department.collegeLabel}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('نبذة مختصرة', 'Biography')}</Label>
              <Textarea dir="rtl" rows={6} value={formData.biography} onChange={(e) => updateField('biography', e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>{t('رابط الصورة', 'Photo URL')}</Label>
              <Input dir="ltr" value={formData.photo} onChange={(e) => updateField('photo', e.target.value)} />
            </div>

            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              {t(
                'البريد والهاتف إن ظهرا في القائمة فهما للعرض فقط حاليًا، لأن النموذج الفعلي في الباكند لا يحفظهما ضمن هذا المسار.',
                'Email and phone are currently display-only because the live backend schema for this screen does not persist them through this endpoint.',
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">{t('تفعيل العضو', 'Activate Member')}</p>
                <p className="text-sm text-muted-foreground">{t('إظهار العضو ضمن القوائم النشطة', 'Show member in active listings')}</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={(checked) => updateField('isActive', checked)} />
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
