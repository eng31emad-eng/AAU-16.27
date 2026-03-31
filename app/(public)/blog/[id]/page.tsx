import { notFound } from 'next/navigation';
import { getBlogList, getBlogById } from '@/services/server/blog';
import BlogDetailsContent from '@/components/BlogDetailsContent';
import { Metadata } from 'next';

export const revalidate = 3600; // 1 hour

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    const posts = await getBlogList();
    return posts.map((post) => ({
        id: post.id,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getBlogById(id);

    if (!post) {
        return {
            title: 'Blog Post Not Found',
        };
    }

    return {
        title: `${post.title.en} | Blog`,
        description: post.content.en.substring(0, 160) + '...',
        openGraph: {
            title: `${post.title.en} | Blog`,
            description: post.content.en.substring(0, 160) + '...',
            images: [post.image],
        },
    };
}

export default async function BlogDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getBlogById(id);

    if (!post) {
        return notFound();
    }

    const allPosts = await getBlogList();

    // Filter related posts (server-side logic to get some related items)
    // We match by English category as a proxy for topic relevance
    const relatedPosts = allPosts
        .filter(p => p.id !== id && p.category.en === post.category.en)
        .slice(0, 3);

    return <BlogDetailsContent post={post} relatedPosts={relatedPosts} />;
}
