'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Edit, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AcademicProgram, College } from '@/types'
import {
  createCollege,
  createProgram,
  deleteCollege,
  deleteProgram,
  getAdminColleges,
  updateCollege,
  updateProgram,
} from '@/services/data/admin-colleges'

const initialCollegeForm = {
  college_name: '',
  slug: '',
  name_ar: '',
  name_en: '',
  description_ar: '',
  description_en: '',
  vision_ar: '',
  vision_en: '',
  mission_ar: '',
  mission_en: '',
  admission_requirements_ar: '',
  admission_requirements_en: '',
  image: '',
  icon: '',
  dean_name: '',
  display_order: 0,
  is_active: 1,
}

const initialProgramForm = {
  program_name: '',
  degree_type: 'Bachelor',
  description: '',
  duration: '',
  is_active: 1,
}

export default function CollegesManagement() {
  const { t, language } = useLanguage()
  const [colleges, setColleges] = useState<College[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollegeDialogOpen, setIsCollegeDialogOpen] = useState(false)
  const [isProgramDialogOpen, setIsProgramDialogOpen] = useState(false)
  const [editingCollege, setEditingCollege] = useState<College | null>(null)
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null)
  const [selectedCollegeId, setSelectedCollegeId] = useState('')
  const [collegeFormData, setCollegeFormData] = useState(initialCollegeForm)
  const [programFormData, setProgramFormData] = useState(initialProgramForm)

  const selectedCollege = useMemo(
    () => colleges.find((college) => college.id === selectedCollegeId) || null,
    [colleges, selectedCollegeId],
  )

  const fetchColleges = async () => {
    setLoading(true)
    try {
      const data = await getAdminColleges()
      setColleges(data)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('حدث خطأ أثناء جلب البيانات', 'Error fetching data'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColleges()
  }, [])

  const handleOpenCollegeDialog = (college?: College) => {
    if (college) {
      setEditingCollege(college)
      setCollegeFormData({
        college_name: college.nameEn || college.nameAr,
        slug: college.slug || '',
        name_ar: college.nameAr || '',
        name_en: college.nameEn || '',
        description_ar: college.descriptionAr || '',
        description_en: college.descriptionEn || '',
        vision_ar: college.visionAr || '',
        vision_en: college.visionEn || '',
        mission_ar: college.missionAr || '',
        mission_en: college.missionEn || '',
        admission_requirements_ar: college.admissionRequirementsAr || '',
        admission_requirements_en: college.admissionRequirementsEn || '',
        image: typeof college.image === 'string' ? college.image : '',
        icon: typeof college.icon === 'string' ? college.icon : '',
        dean_name: '',
        display_order: 0,
        is_active: 1,
      })
    } else {
      setEditingCollege(null)
      setCollegeFormData(initialCollegeForm)
    }
    setIsCollegeDialogOpen(true)
  }

  const handleOpenProgramDialog = (collegeId: string, program?: AcademicProgram) => {
    setSelectedCollegeId(collegeId)
    if (program) {
      setEditingProgram(program)
      setProgramFormData({
        program_name: program.nameEn || program.nameAr,
        degree_type: program.degreeType || 'Bachelor',
        description: program.descriptionEn || program.descriptionAr || '',
        duration: program.studyYears || '',
        is_active: 1,
      })
    } else {
      setEditingProgram(null)
      setProgramFormData(initialProgramForm)
    }
    setIsProgramDialogOpen(true)
  }

  const handleSubmitCollege = async () => {
    if (!collegeFormData.college_name.trim()) {
      toast.error(t('يرجى إدخال اسم الكلية', 'Please enter college name'))
      return
    }

    try {
      if (editingCollege) {
        await updateCollege(editingCollege.id, collegeFormData)
        toast.success(t('تم تحديث الكلية بنجاح', 'College updated successfully'))
      } else {
        await createCollege(collegeFormData)
        toast.success(t('تم إضافة الكلية بنجاح', 'College added successfully'))
      }
      setIsCollegeDialogOpen(false)
      await fetchColleges()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الكلية', 'Failed to save college'))
    }
  }

  const handleSubmitProgram = async () => {
    if (!selectedCollegeId) {
      toast.error(t('يرجى اختيار الكلية أولاً', 'Please choose a college first'))
      return
    }
    if (!programFormData.program_name.trim()) {
      toast.error(t('يرجى إدخال اسم البرنامج', 'Please enter program name'))
      return
    }

    try {
      if (editingProgram) {
        await updateProgram(editingProgram.id, programFormData)
        toast.success(t('تم تحديث البرنامج بنجاح', 'Program updated successfully'))
      } else {
        await createProgram({ ...programFormData, college: selectedCollegeId })
        toast.success(t('تم إضافة البرنامج بنجاح', 'Program added successfully'))
      }
      setIsProgramDialogOpen(false)
      await fetchColleges()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ البرنامج', 'Failed to save program'))
    }
  }

  const handleDeleteCollege = async (id: string) => {
    try {
      await deleteCollege(id)
      toast.success(t('تم حذف الكلية بنجاح', 'College deleted successfully'))
      await fetchColleges()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف الكلية', 'Failed to delete college'))
    }
  }

  const handleDeleteProgram = async (programId: string) => {
    try {
      await deleteProgram(programId)
      toast.success(t('تم حذف البرنامج بنجاح', 'Program deleted successfully'))
      await fetchColleges()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حذف البرنامج', 'Failed to delete program'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t('إدارة الكليات والبرامج', 'Colleges & Programs Management')}
          </h1>
          <p className="text-muted-foreground">
            {t('إدارة الكليات والبرامج وفق الحقول الفعلية المتاحة في النظام', 'Manage colleges and programs using the live backend schema')}
          </p>
        </div>
        <Button onClick={() => handleOpenCollegeDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          {t('إضافة كلية', 'Add College')}
        </Button>
      </div>

      <div className="space-y-4">
        {colleges.map((college) => (
          <Card key={college.id} className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {college.image ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden">
                      <img src={String(college.image)} alt={t(college.nameAr, college.nameEn)} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">{t(college.nameAr || college.nameEn, college.nameEn || college.nameAr)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {college.programs.length} {t('برنامج', 'programs')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenProgramDialog(college.id)}>
                    <Plus className="w-4 h-4 mr-1" />
                    {t('إضافة برنامج', 'Add Program')}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenCollegeDialog(college)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCollege(college.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {college.programs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">{t('م', '#')}</TableHead>
                      <TableHead>{t('البرنامج الأكاديمي', 'Program')}</TableHead>
                      <TableHead>{t('الوصف', 'Description')}</TableHead>
                      <TableHead className="text-center">{t('الدرجة', 'Degree')}</TableHead>
                      <TableHead className="text-center">{t('المدة', 'Duration')}</TableHead>
                      <TableHead className="text-right w-24">{t('الإجراءات', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {college.programs.map((program, index) => (
                      <TableRow key={program.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium">{t(program.nameAr, program.nameEn)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-md truncate">
                          {t(program.descriptionAr || '', program.descriptionEn || '') || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{program.degreeType || '-'}</Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">{program.studyYears || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenProgramDialog(college.id, program)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(program.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('لا توجد برامج أكاديمية مرتبطة بهذه الكلية', 'No academic programs linked to this college')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCollegeDialogOpen} onOpenChange={setIsCollegeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCollege ? t('تعديل الكلية', 'Edit College') : t('إضافة كلية جديدة', 'Add New College')}</DialogTitle>
            <DialogDescription>{t('الحقول هنا مطابقة للنموذج الحالي في الباكند', 'These fields match the current backend schema')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('الاسم الرئيسي', 'Primary Name')}</Label>
                <Input value={collegeFormData.college_name} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, college_name: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الرابط المختصر', 'Slug')}</Label>
                <Input dir="ltr" value={collegeFormData.slug} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, slug: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('الاسم بالعربية', 'Arabic Name')}</Label>
                <Input dir="rtl" value={collegeFormData.name_ar} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, name_ar: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الاسم بالإنجليزية', 'English Name')}</Label>
                <Input dir="ltr" value={collegeFormData.name_en} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, name_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('الوصف بالعربية', 'Arabic Description')}</Label>
                <Textarea dir="rtl" rows={3} value={collegeFormData.description_ar} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, description_ar: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الوصف بالإنجليزية', 'English Description')}</Label>
                <Textarea dir="ltr" rows={3} value={collegeFormData.description_en} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, description_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('الرؤية بالعربية', 'Arabic Vision')}</Label>
                <Textarea dir="rtl" rows={3} value={collegeFormData.vision_ar} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, vision_ar: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الرؤية بالإنجليزية', 'English Vision')}</Label>
                <Textarea dir="ltr" rows={3} value={collegeFormData.vision_en} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, vision_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('الرسالة بالعربية', 'Arabic Mission')}</Label>
                <Textarea dir="rtl" rows={3} value={collegeFormData.mission_ar} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, mission_ar: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الرسالة بالإنجليزية', 'English Mission')}</Label>
                <Textarea dir="ltr" rows={3} value={collegeFormData.mission_en} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, mission_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('شروط القبول بالعربية', 'Arabic Admission Requirements')}</Label>
                <Textarea dir="rtl" rows={2} value={collegeFormData.admission_requirements_ar} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, admission_requirements_ar: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('شروط القبول بالإنجليزية', 'English Admission Requirements')}</Label>
                <Textarea dir="ltr" rows={2} value={collegeFormData.admission_requirements_en} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, admission_requirements_en: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('رابط الصورة', 'Image URL')}</Label>
                <Input dir="ltr" value={collegeFormData.image} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, image: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>{t('الأيقونة', 'Icon')}</Label>
                <Input dir="ltr" value={collegeFormData.icon} onChange={(e) => setCollegeFormData((prev) => ({ ...prev, icon: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCollegeDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button onClick={handleSubmitCollege}>{editingCollege ? t('حفظ التغييرات', 'Save Changes') : t('إضافة', 'Add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isProgramDialogOpen} onOpenChange={setIsProgramDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProgram ? t('تعديل البرنامج', 'Edit Program') : t('إضافة برنامج', 'Add Program')}</DialogTitle>
            <DialogDescription>
              {selectedCollege ? t(`الكلية المحددة: ${selectedCollege.nameAr || selectedCollege.nameEn}`, `Selected college: ${selectedCollege.nameEn || selectedCollege.nameAr}`) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('اسم البرنامج', 'Program Name')}</Label>
              <Input value={programFormData.program_name} onChange={(e) => setProgramFormData((prev) => ({ ...prev, program_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('نوع الدرجة', 'Degree Type')}</Label>
                <Select value={programFormData.degree_type} onValueChange={(value) => setProgramFormData((prev) => ({ ...prev, degree_type: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Bachelor">Bachelor</SelectItem>
                    <SelectItem value="Master">Master</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('المدة', 'Duration')}</Label>
                <Input value={programFormData.duration} onChange={(e) => setProgramFormData((prev) => ({ ...prev, duration: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('الوصف', 'Description')}</Label>
              <Textarea rows={4} value={programFormData.description} onChange={(e) => setProgramFormData((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProgramDialogOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button onClick={handleSubmitProgram}>{editingProgram ? t('حفظ التغييرات', 'Save Changes') : t('إضافة', 'Add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
