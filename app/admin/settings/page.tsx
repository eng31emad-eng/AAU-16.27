'use client'
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAdminSettings, updateAdminSettings, type AdminSettings } from '@/services/data/admin-settings';
import { toast } from 'sonner';

export default function Settings() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AdminSettings>({
    siteName: '',
    siteNameAr: '',
    siteDescriptionAr: '',
    contactPhone: '',
    contactEmail: '',
    addressAr: '',
    mapLocation: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  });

  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      setFormData(await getAdminSettings());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر تحميل الإعدادات', 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AdminSettings, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        siteName: formData.siteNameAr || formData.siteName,
        siteNameAr: formData.siteNameAr || formData.siteName,
        siteDescriptionAr: formData.siteDescriptionAr,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        addressAr: formData.addressAr,
        mapLocation: formData.mapLocation,
        facebook: formData.facebook,
        twitter: formData.twitter,
        instagram: formData.instagram,
        linkedin: formData.linkedin,
        youtube: formData.youtube,
      };
      setFormData(await updateAdminSettings(payload));
      toast.success(t('تم حفظ الإعدادات بنجاح', 'Settings saved successfully'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('تعذر حفظ الإعدادات', 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {t('الإعدادات', 'Settings')}
        </h1>
        <p className="text-muted-foreground">
          {t('إدارة إعدادات النظام العامة', 'Manage general system settings')}
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('جاري تحميل الإعدادات...', 'Loading settings...')}
          </CardContent>
        </Card>
      ) : (
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="general">{t('عام', 'General')}</TabsTrigger>
          <TabsTrigger value="university">{t('بيانات الجامعة', 'University Info')}</TabsTrigger>
          <TabsTrigger value="contact">{t('التواصل', 'Contact')}</TabsTrigger>
          <TabsTrigger value="social">{t('التواصل الاجتماعي', 'Social Media')}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{t('الإعدادات العامة', 'General Settings')}</CardTitle>
              <CardDescription>
                {t('تكوين الإعدادات الأساسية للنظام', 'Configure basic system settings')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-name">
                  {t('اسم الموقع الداخلي', 'Internal Site Name')}
                </Label>
                <Input
                  id="site-name"
                  value={formData.siteName}
                  onChange={(event) => handleChange('siteName', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-email">
                  {t('البريد الإلكتروني', 'Email')}
                </Label>
                <Input
                  id="site-email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(event) => handleChange('contactEmail', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-phone">
                  {t('رقم الهاتف', 'Phone Number')}
                </Label>
                <Input
                  id="site-phone"
                  value={formData.contactPhone}
                  onChange={(event) => handleChange('contactPhone', event.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="university">
          <Card>
            <CardHeader>
              <CardTitle>{t('بيانات الجامعة', 'University Information')}</CardTitle>
              <CardDescription>
                {t('هذه الحقول عربية فقط، والترجمة تتم لاحقاً من شاشة الترجمة', 'Arabic-first content managed here, translations come later from Translation')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="uni-name-ar">
                  {t('اسم الجامعة الظاهر', 'Displayed University Name')}
                </Label>
                <Input
                  id="uni-name-ar"
                  dir="rtl"
                  value={formData.siteNameAr}
                  onChange={(event) => handleChange('siteNameAr', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uni-about">
                  {t('الوصف المختصر', 'Short Description')}
                </Label>
                <Textarea
                  id="uni-about"
                  dir="rtl"
                  rows={5}
                  value={formData.siteDescriptionAr}
                  onChange={(event) => handleChange('siteDescriptionAr', event.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>{t('بيانات التواصل', 'Contact Information')}</CardTitle>
              <CardDescription>
                {t('هذه البيانات تستخدم في صفحات التواصل والفوتر', 'These values feed the contact pages and footer')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="uni-address">
                  {t('العنوان', 'Address')}
                </Label>
                <Textarea
                  id="uni-address"
                  dir="rtl"
                  rows={3}
                  value={formData.addressAr}
                  onChange={(event) => handleChange('addressAr', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="map-location">
                  {t('رابط الخريطة', 'Map Location')}
                </Label>
                <Input
                  id="map-location"
                  value={formData.mapLocation}
                  onChange={(event) => handleChange('mapLocation', event.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>{t('روابط التواصل الاجتماعي', 'Social Media Links')}</CardTitle>
              <CardDescription>
                {t('إدارة روابط وسائل التواصل الاجتماعي', 'Manage social media links')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook">{t('فيسبوك', 'Facebook')}</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/ngu"
                  value={formData.facebook}
                  onChange={(event) => handleChange('facebook', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">{t('تويتر / X', 'Twitter / X')}</Label>
                <Input
                  id="twitter"
                  placeholder="https://twitter.com/ngu"
                  value={formData.twitter}
                  onChange={(event) => handleChange('twitter', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">{t('إنستغرام', 'Instagram')}</Label>
                <Input
                  id="instagram"
                  placeholder="https://instagram.com/ngu"
                  value={formData.instagram}
                  onChange={(event) => handleChange('instagram', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">{t('يوتيوب', 'YouTube')}</Label>
                <Input
                  id="youtube"
                  placeholder="https://youtube.com/ngu"
                  value={formData.youtube}
                  onChange={(event) => handleChange('youtube', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">{t('لينكدإن', 'LinkedIn')}</Label>
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/company/ngu"
                  value={formData.linkedin}
                  onChange={(event) => handleChange('linkedin', event.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغييرات', 'Save Changes')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}


