import { getNewsList } from '@/services/server/news';
import NewsPageContent from '@/components/NewsPageContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأخبار | News',
  description: 'آخر أخبار وإعلانات جامعة الجيل الجديد - Latest News and Announcements from Al-Jeel Al-Jadeed University',
};

export default async function NewsPage() {
  const news = await getNewsList();

  return (
    <NewsPageContent initialNews={news} />
  );
}

