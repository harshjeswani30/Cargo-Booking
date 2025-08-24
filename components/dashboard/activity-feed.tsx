"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, Plane, User, AlertTriangle, CheckCircle, Clock, MapPin, RefreshCw, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ActivityItem {
  id: string
  type: "booking" | "flight" | "user" | "system"
  action: string
  description: string
  timestamp: Date
  status: "success" | "warning" | "error" | "info"
  metadata?: {
    bookingId?: string
    flightNumber?: string
    userId?: string
    location?: string
  }
}

interface Booking {
  refId: string
  status: string
  origin: string
  destination: string
  createdAt: string
  updatedAt: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch recent bookings to create activity feed
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const bookings: Booking[] = await response.json()
      
      // Transform bookings into activities
      const newActivities: ActivityItem[] = bookings.slice(0, 10).map((booking, index) => {
        const timestamp = new Date(booking.createdAt)
        const isRecent = Date.now() - timestamp.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
        
        let action = "Booking Created"
        let description = `New cargo booking ${booking.refId} created for ${booking.origin} → ${booking.destination}`
        let status: "success" | "warning" | "error" | "info" = "success"
        
        if (booking.status === "DELIVERED") {
          action = "Booking Delivered"
          description = `Booking ${booking.refId} successfully delivered to ${booking.destination}`
          status = "success"
        } else if (booking.status === "IN_TRANSIT") {
          action = "Booking In Transit"
          description = `Booking ${booking.refId} is currently in transit from ${booking.origin} to ${booking.destination}`
          status = "info"
        } else if (booking.status === "DEPARTED") {
          action = "Flight Departed"
          description = `Flight with booking ${booking.refId} departed from ${booking.origin}`
          status = "info"
        }
        
        return {
          id: `booking-${index}`,
          type: "booking" as const,
          action,
          description,
          timestamp,
          status,
          metadata: { 
            bookingId: booking.refId,
            location: isRecent ? booking.origin : undefined
          }
        }
      })
      
      // Add some system activities based on real data
      if (bookings.length > 0) {
        const totalBookings = bookings.length
        const deliveredBookings = bookings.filter(b => b.status === "DELIVERED").length
        const onTimeRate = Math.round((deliveredBookings / totalBookings) * 100)
        
        if (onTimeRate < 90) {
          newActivities.unshift({
            id: "system-warning",
            type: "system",
            action: "Performance Alert",
            description: `On-time delivery rate is ${onTimeRate}%, below target of 90%`,
            timestamp: new Date(),
            status: "warning"
          })
        }
        
        if (totalBookings > 100) {
          newActivities.unshift({
            id: "system-success",
            type: "system",
            action: "High Volume",
            description: `${totalBookings} total bookings processed successfully`,
            timestamp: new Date(),
            status: "success"
          })
        }
      }
      
      // Sort by timestamp (newest first)
      newActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      
      setActivities(newActivities)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      console.error('Error fetching activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const refreshActivities = async () => {
    setIsRefreshing(true)
    await fetchActivities()
    setIsRefreshing(false)
  }

  useEffect(() => {
    fetchActivities()
    
    // Refresh activities every 2 minutes
    const interval = setInterval(fetchActivities, 120000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "info":
        return <Clock className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700"
      case "error":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Loading recent activities...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Error loading activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchActivities} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshActivities}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                      {activity.metadata?.location && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{activity.metadata.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
