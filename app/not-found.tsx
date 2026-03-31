'use client'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-secondary mb-4">404</h1>
                <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
                <p className="text-muted-foreground mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
                <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
                >
                    العودة للرئيسية
                </button>
            </div>
        </div>
    )
}


