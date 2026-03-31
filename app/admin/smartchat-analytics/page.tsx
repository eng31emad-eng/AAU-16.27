import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSmartchatAnalytics, parseAnalyticsRange } from '@/services/server/smartchat-analytics'
import { MessageSquare, ThumbsUp, ThumbsDown, MousePointerClick, Gauge, AlertTriangle, Download } from 'lucide-react'

function asPercent(value: number) {
  return `${Math.round((value || 0) * 100)}%`
}

function asDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '-'
  return date.toLocaleString()
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function SmartchatAnalyticsPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const rangeRaw = Array.isArray(params.range) ? params.range[0] : params.range
  const range = parseAnalyticsRange(rangeRaw)
  const analytics = await getSmartchatAnalytics(25, range)
  const rangeItems: Array<{ key: '24h' | '7d' | '30d' | 'all'; label: string }> = [
    { key: '24h', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: 'all', label: 'All' },
  ]

  const summaryCards = [
    {
      title: 'Total Events',
      value: analytics.totalEvents,
      icon: MessageSquare,
    },
    {
      title: 'Helpful Votes',
      value: analytics.positiveFeedback,
      icon: ThumbsUp,
    },
    {
      title: 'Not Helpful Votes',
      value: analytics.negativeFeedback,
      icon: ThumbsDown,
    },
    {
      title: 'Suggestion Clicks',
      value: analytics.totalSuggestionClicks,
      icon: MousePointerClick,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smart Chat Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Feedback quality, intent pain points, and suggestion usage.
        </p>
        <div className="mt-3 text-sm text-muted-foreground">
          Active range: <span className="font-medium text-foreground">{analytics.rangeLabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {rangeItems.map((item) => (
          <Link
            key={item.key}
            href={`/admin/smartchat-analytics?range=${item.key}`}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${analytics.range === item.key
              ? 'border-secondary bg-secondary/15 text-foreground'
              : 'border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href={`/api/smartchat/analytics/export?range=${analytics.range}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>

      {!analytics.exists && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No analytics log found yet. Interact with chat and submit feedback first.
          </CardContent>
        </Card>
      )}

      {analytics.alertLevel !== 'none' && (
        <Card className={analytics.alertLevel === 'critical' ? 'border-red-300 bg-red-50/60' : 'border-amber-300 bg-amber-50/70'}>
          <CardContent className="py-4 flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 ${analytics.alertLevel === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
            <div>
              <div className={`font-semibold ${analytics.alertLevel === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>
                {analytics.alertLevel === 'critical' ? 'Critical Quality Alert' : 'Warning Alert'}
              </div>
              <div className={`text-sm mt-1 ${analytics.alertLevel === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                {analytics.alertMessage}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                <Icon className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-secondary" />
              Satisfaction Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{asPercent(analytics.satisfactionRate)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Based on {analytics.totalFeedback} feedback votes.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{asPercent(analytics.averageConfidence)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Mean confidence score at feedback time.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Split</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Helpful</span>
              <span className="font-semibold">{analytics.positiveFeedback}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Not Helpful</span>
              <span className="font-semibold">{analytics.negativeFeedback}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Negative Rate</span>
              <span className="font-semibold">{asPercent(analytics.negativeRate)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-secondary"
                style={{ width: asPercent(analytics.satisfactionRate) }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Most Negative Intents</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topNegativeIntents.length === 0 ? (
              <div className="text-sm text-muted-foreground">No intent feedback yet.</div>
            ) : (
              <div className="space-y-3">
                {analytics.topNegativeIntents.map((item) => (
                  <div key={item.intent} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div>
                      <div className="font-medium">{item.intent}</div>
                      <div className="text-xs text-muted-foreground">
                        Total: {item.total} | Helpful: {item.positive} | Not helpful: {item.negative}
                      </div>
                    </div>
                    <div className="text-sm font-semibold">{asPercent(item.satisfactionRate)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Suggested Questions Clicked</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topSuggestions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No suggestion clicks yet.</div>
            ) : (
              <div className="space-y-3">
                {analytics.topSuggestions.map((item) => (
                  <div key={item.suggestion} className="flex items-center justify-between border-b pb-3 last:border-0 gap-4">
                    <div className="text-sm leading-6">{item.suggestion}</div>
                    <div className="text-sm font-semibold shrink-0">{item.clicks}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent events.</div>
          ) : (
            <div className="space-y-3">
              {analytics.recentEvents.map((item, index) => (
                <div key={`${item.ts}-${index}`} className="border-b pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{item.type}</div>
                    <div className="text-xs text-muted-foreground">{asDate(item.ts)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    intent: {item.intent || '-'} | value: {item.value || '-'} | trace: {item.traceId || '-'}
                  </div>
                  {item.suggestion ? <div className="text-sm mt-1">{item.suggestion}</div> : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
