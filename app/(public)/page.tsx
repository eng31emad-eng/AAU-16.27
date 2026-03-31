import { getHomeData } from '@/services/server/home'
import HomeContent from '@/components/HomeContent'

// ISR Revalidation (e.g. every 5 minutes)
export const revalidate = 300;

export default async function HomePage() {
    // Fetch data from Server Data Layer
    const { home, events, news, colleges, campusLife, projects, faqs } = await getHomeData()

    return (
        <HomeContent
            home={home}
            events={events.slice(0, 4)}
            news={news.slice(0, 4)}
            colleges={colleges}
            campusLife={campusLife.slice(0, 6)}
            projects={projects.slice(0, 3)}
            faqs={faqs.slice(0, 6)}
        />
    )
}
