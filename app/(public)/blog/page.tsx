import { getBlogCategories, getBlogList } from '@/services/server/blog';
import BlogPageContent from '@/components/BlogPageContent';
import { Metadata } from 'next';

// ISR Revalidation (1 hour)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'المدونة | Blog',
  description: 'مقالات وأخبار جامعة الجيل الجديد - Al-Jeel Al-Jadeed University Blog and News',
};

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getBlogList(),
    getBlogCategories()
  ]);

  return (
    <BlogPageContent initialPosts={posts} initialCategories={categories} />
  );
}





