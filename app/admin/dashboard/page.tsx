import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Newspaper, FolderKanban, GraduationCap, Activity, Inbox } from 'lucide-react'
import { getAdminDashboardData } from '@/services/server/admin-dashboard'

function formatRelativeTimestamp(timestamp: string) {
  if (!timestamp) {
    return ''
  }

  const target = new Date(timestamp)
  if (Number.isNaN(target.getTime())) {
    return timestamp
  }

  const diffMs = Date.now() - target.getTime()
  const diffMinutes = Math.max(Math.round(diffMs / 60000), 0)

  if (diffMinutes < 1) return 'الآن'
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `منذ ${diffHours} ساعة`

  const diffDays = Math.round(diffHours / 24)
  return `منذ ${diffDays} يوم`
}

function activityTypeLabel(type: string) {
  switch (type) {
    case 'news':
      return { ar: 'خبر', en: 'News' }
    case 'project':
      return { ar: 'مشروع', en: 'Project' }
    case 'contact':
      return { ar: 'رسالة تواصل', en: 'Contact Message' }
    case 'join_request':
      return { ar: 'طلب انضمام', en: 'Join Request' }
    default:
      return { ar: 'نشاط', en: 'Activity' }
  }
}

export default async function Dashboard() {
  const dashboard = await getAdminDashboardData()

  const stats = [
    {
      icon: Users,
      titleAr: 'إجمالي المستخدمين',
      titleEn: 'Total Users',
      value: dashboard.summary.usersTotal,
      color: 'text-blue-500',
    },
    {
      icon: Newspaper,
      titleAr: 'الأخبار المنشورة',
      titleEn: 'Published News',
      value: dashboard.summary.newsTotal,
      color: 'text-green-500',
    },
    {
      icon: FolderKanban,
      titleAr: 'إجمالي المشاريع',
      titleEn: 'Total Projects',
      value: dashboard.summary.projectsTotal,
      color: 'text-purple-500',
    },
    {
      icon: GraduationCap,
      titleAr: 'الطلاب المسجلين',
      titleEn: 'Registered Students',
      value: dashboard.summary.studentsTotal,
      color: 'text-orange-500',
    },
  ]

  const quickStats = [
    { labelAr: 'التسجيلات اليوم', labelEn: 'Today Registrations', value: dashboard.quickStats.dailyRegistrations },
    { labelAr: 'الأخبار المعلقة', labelEn: 'Pending News', value: dashboard.quickStats.pendingNews },
    { labelAr: 'المشاريع قيد المراجعة', labelEn: 'Projects Under Review', value: dashboard.quickStats.projectsUnderReview },
    { labelAr: 'الاستفسارات الجديدة', labelEn: 'New Questions', value: dashboard.quickStats.newQuestions },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على إحصائيات النظام</p>
      </div>

      {dashboard.unauthorized && (
        <Card className="mb-8 border-amber-200 bg-amber-50/70">
          <CardContent className="flex items-start gap-3 p-5">
            <Inbox className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">الجلسة الإدارية غير متاحة للواجهة الحالية</p>
              <p className="text-sm text-amber-700 mt-1">
                لم يتم تمرير جلسة صلاحيات إدارية صالحة إلى الباكند، لذلك تم إخفاء الأرقام الوهمية وعرض حالة فارغة واضحة.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.titleEn}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.titleAr}</CardTitle>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              النشاط الأخير
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard.recentActivity.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">لا توجد أنشطة حديثة متاحة حالياً</div>
            ) : (
              <div className="space-y-4">
                {dashboard.recentActivity.map((activity) => {
                  const label = activityTypeLabel(activity.type)
                  return (
                    <div key={`${activity.type}-${activity.id}`} className="flex items-center gap-4 pb-4 border-b last:border-0">
                      <div className="w-2 h-2 rounded-full bg-secondary shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.titleAr}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <span>{label.ar}</span>
                          <span>•</span>
                          <span>{formatRelativeTimestamp(activity.timestamp)}</span>
                        </div>
                      </div>
                      {activity.link ? (
                        <Link href={activity.link} className="text-xs text-secondary hover:underline shrink-0">
                          فتح
                        </Link>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickStats.map((stat) => (
                <div key={stat.labelEn} className="flex items-center justify-between pb-4 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{stat.labelAr}</span>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

