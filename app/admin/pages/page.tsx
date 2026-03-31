'use client'
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, FileText } from 'lucide-react';
import { getManagedPages, saveManagedPage, type ManagedPage } from '@/services/data/admin-pages';
import { toast } from 'sonner';

export default function PagesManagement() {
  const { t } = useLanguage();
  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ManagedPage>({
    id: '',
    docname: '',
    slug: '',
    titleAr: '',
    contentAr: '',
    heroImage: '',
    published: true,
  });

  useEffect(() => {
    void loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const payload = await getManagedPages();
      setPages(payload);
      if (payload.length > 0) {
        setSelectedSlug(payload[0].slug);
        setFormData(payload[0]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الصفحات', 'Failed to load pages'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (page: ManagedPage) => {
    setSelectedSlug(page.slug);
    setFormData(page);
  };

  const handleChange = (field: keyof ManagedPage, value: string | boolean) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.titleAr) {
      toast.error(t('يرجى تعبئة الحقول الأساسية', 'Please fill the required fields'));
      return;
    }

    setSaving(true);
    try {
      const saved = await saveManagedPage(formData.slug, {
        titleAr: formData.titleAr,
        contentAr: formData.contentAr,
        heroImage: formData.heroImage,
        published: formData.published,
      });
      const updatedPages = pages.map((page) => (page.slug === saved.slug ? saved : page));
      setPages(updatedPages);
      setFormData(saved);
      toast.success(t('تم حفظ الصفحة بنجاح', 'Page saved successfully'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الصفحة', 'Failed to save page'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t('إدارة الصفحات التعريفية', 'Pages Management')}
          </h1>
          <p className="text-muted-foreground">
            {t('تعديل محتوى الصفحات الثابتة في الموقع', 'Edit static page content on the website')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{t('الصفحات', 'Pages')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 p-2">
              {loading ? (
                <div className="px-3 py-6 text-sm text-muted-foreground">
                  {t('جاري التحميل...', 'Loading...')}
                </div>
              ) : pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${selectedSlug === page.slug
                      ? 'bg-secondary text-secondary-foreground'
                      : 'hover:bg-muted'
                    }`}
                >
                  <FileText className="w-4 h-4" />
                  {page.titleAr || page.slug}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{formData.titleAr || formData.slug || t('محرر الصفحات', 'Pages Editor')}</CardTitle>
            <CardDescription>
              {t('أدخل النصوص الأساسية بالعربية. الترجمة الإنجليزية لاحقاً من شاشة Translation.', 'Edit Arabic-first page content. English can be refined later from Translation.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center text-muted-foreground">
                {t('جاري تحميل الصفحة...', 'Loading page...')}
              </div>
            ) : !formData.slug ? (
              <div className="py-12 text-center text-muted-foreground">
                {t('لا توجد صفحات متاحة للتحرير', 'No pages available for editing')}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('المعرف', 'Slug')}</Label>
                  <Input value={formData.slug} disabled dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>{t('العنوان (عربي)', 'Title (Arabic)')}</Label>
                  <Input value={formData.titleAr} onChange={(event) => handleChange('titleAr', event.target.value)} dir="rtl" />
                </div>
                <div className="space-y-2">
                  <Label>{t('رابط صورة الصفحة', 'Hero Image URL')}</Label>
                  <Input value={formData.heroImage} onChange={(event) => handleChange('heroImage', event.target.value)} dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>{t('المحتوى (عربي)', 'Content (Arabic)')}</Label>
                  <Textarea
                    value={formData.contentAr}
                    onChange={(event) => handleChange('contentAr', event.target.value)}
                    dir="rtl"
                    rows={10}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{t('نشر الصفحة', 'Publish Page')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('إخفاء الصفحة من الواجهة عند إيقافها', 'Hide the page from the public site when disabled')}
                    </p>
                  </div>
                  <Switch checked={formData.published} onCheckedChange={(checked) => handleChange('published', checked)} />
                </div>

                <div className="pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

