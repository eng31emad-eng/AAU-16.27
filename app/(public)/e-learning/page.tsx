import { UnderDevelopment } from '@/components/UnderDevelopment';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'التعليم الإلكتروني - جامعة الجيل الجديد',
    description: 'منصة التعليم الإلكتروني لجامعة الجيل الجديد',
};

export default function ELearningPage() {
    return (
        <UnderDevelopment
            titleAr="التعليم الإلكتروني"
            titleEn="E-Learning Portal"
        />
    );
}
