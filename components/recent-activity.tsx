import {
    IconClock,
    IconCircleCheck,
    IconAlertTriangle,
    IconInfoCircle,
  } from "@tabler/icons-react"
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
  import type { ActivityItem } from "@/lib/types"
  
  interface RecentActivityProps {
    activities: ActivityItem[]
  }
  
  const statusIcons = {
    SUCCESS: { icon: IconCircleCheck, bg: "bg-green-100", text: "text-green-600" },
    INFO: { icon: IconInfoCircle, bg: "bg-blue-100", text: "text-blue-600" },
    WARNING: { icon: IconAlertTriangle, bg: "bg-yellow-100", text: "text-yellow-600" },
    ERROR: { icon: IconAlertTriangle, bg: "bg-red-100", text: "text-red-600" },
  }
  
  function getTimeAgo(date: Date): string {
    const now = new Date()
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const diffMs = now.getTime() - dateObj.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
  
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return "Just now"
  }
  
  export function RecentActivity({ activities }: RecentActivityProps) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {activities.map((activity) => {
              const config = statusIcons[activity.status as keyof typeof statusIcons] 
                ?? statusIcons.INFO
              const Icon = config.icon
  
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`mt-1 ${config.bg} ${config.text} rounded-full p-2`}>
                    <Icon size={16} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.userName}
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">
                      {getTimeAgo(typeof activity.createdAt === 'string' ? new Date(activity.createdAt) : activity.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }