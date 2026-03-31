import { Metadata } from 'next';
import { ContactSection } from '@/components/ContactSection';
import { ContactPageHeader } from '@/components/ContactPageHeader';
import { getContactPageData } from '@/services/server/contact';

export const metadata: Metadata = {
  title: 'تواصل معنا | جامعة الجيل الجديد',
  description: 'تواصل مع جامعة الجيل الجديد للاستفسار عن القبول، البرامج الأكاديمية، والخدمات الطلابية. نحن هنا للإجابة على جميع اسئلتكم.',
  openGraph: {
    title: 'تواصل معنا | جامعة الجيل الجديد',
    description: 'تواصل مع جامعة الجيل الجديد للاستفسار عن القبول، البرامج الأكاديمية، والخدمات الطلابية.',
    url: 'https://ngu.edu.iq/contact',
  },
};

export default async function ContactPage() {
  const contact = await getContactPageData();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <ContactPageHeader pageHeader={contact.pageHeader} />
        <ContactSection
          formContent={contact.form}
          socialContent={contact.social}
          siteProfile={contact.siteProfile}
        />
      </div>
    </div>
  );
}
