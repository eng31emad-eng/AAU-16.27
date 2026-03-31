import { UnderDevelopment } from '@/components/UnderDevelopment';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'الخريجون - جامعة الجيل الجديد',
    description: 'بوابة خريجي جامعة الجيل الجديد',
};

export default function AlumniPage() {
    return (
        <UnderDevelopment
            titleAr="شؤون الخريجين"
            titleEn="Alumni Affairs"
        />
    );
}
