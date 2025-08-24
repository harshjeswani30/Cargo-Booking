"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Plane, Search, FileText, Download, Settings, BarChart3, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useNotifications } from "@/components/notifications/notification-provider"

interface DashboardStats {
  totalBookings: number
  activeBookings: number
  completedBookings: number
  totalFlights: number
}

export function QuickActions() {
  const [quickSearchId, setQuickSearchId] = useState("")
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addNotification } = useNotifications()

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch bookings to get statistics
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const bookings = await response.json()
      
      const totalBookings = bookings.length
      const activeBookings = bookings.filter((b: any) => 
        ['BOOKED', 'IN_TRANSIT', 'DEPARTED'].includes(b.status)
      ).length
      const completedBookings = bookings.filter((b: any) => 
        b.status === 'DELIVERED'
      ).length

      // Fetch flights to get real flight count
      const flightsResponse = await fetch('/api/flights')
      let totalFlights = 0
      if (flightsResponse.ok) {
        const flights = await flightsResponse.json()
        totalFlights = flights.length
      }
      
      setStats({
        totalBookings,
        activeBookings,
        completedBookings,
        totalFlights
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (quickSearchId.trim()) {
      router.push(`/?search=${quickSearchId.trim()}`)
      addNotification({
        type: "info",
        title: "Search Initiated",
        message: `Searching for booking: ${quickSearchId.trim()}`,
      })
    }
  }

  const handleExportData = async () => {
    try {
      addNotification({
        type: "info",
        title: "Export Started",
        message: "Preparing your data export...",
      })
      
      // Fetch all bookings for export
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const bookings = await response.json()
        
        // Create CSV content
        const csvContent = [
          ['Reference ID', 'Origin', 'Destination', 'Status', 'Pieces', 'Weight (kg)', 'Created', 'Updated'],
          ...bookings.map((b: any) => [
            b.refId,
            b.origin,
            b.destination,
            b.status,
            b.pieces,
            b.weightKg,
            new Date(b.createdAt).toLocaleDateString(),
            new Date(b.updatedAt).toLocaleDateString()
          ])
        ].map(row => row.join(',')).join('\n')
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cargo-bookings-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        
        addNotification({
          type: "success",
          title: "Export Complete",
          message: `Downloaded ${bookings.length} bookings`,
        })
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Export Failed",
        message: "Failed to export data. Please try again.",
      })
    }
  }

  const handleGenerateReport = async () => {
    try {
      addNotification({
        type: "info",
        title: "Report Generation",
        message: "Generating monthly performance report...",
      })
      
      // Fetch dashboard metrics for report
      const response = await fetch('/api/monitoring')
      if (response.ok) {
        const data = await response.json()
        
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        addNotification({
          type: "success",
          title: "Report Ready",
          message: `Report generated with ${data.bookings.byStatus ? Object.keys(data.bookings.byStatus).length : 0} status categories`,
        })
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Report Failed",
        message: "Failed to generate report. Please try again.",
      })
    }
  }

  const quickActions = [
    {
      title: "New Booking",
      description: "Create a new cargo booking",
      icon: Package,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      action: () => router.push("/booking"),
    },
    {
      title: "Flight Status",
      description: "Check real-time flight information",
      icon: Plane,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
      action: () => router.push("/flights"),
    },
    {
      title: "Generate Report",
      description: "Create performance reports",
      icon: FileText,
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      action: handleGenerateReport,
    },
    {
      title: "Export Data",
      description: "Download booking data",
      icon: Download,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      action: handleExportData,
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      icon: BarChart3,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400",
      action: () => router.push("/analytics"),
    },
    {
      title: "Settings",
      description: "Configure system settings",
      icon: Settings,
      color: "bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400",
      action: () => router.push("/settings"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Quick Search
          </CardTitle>
          <CardDescription>Search for bookings by reference ID</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuickSearch} className="flex gap-2">
            <Input
              placeholder="Enter booking reference ID"
              value={quickSearchId}
              onChange={(e) => setQuickSearchId(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
          <CardDescription>Current system statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.activeBookings}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.completedBookings}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.totalFlights}</div>
                <div className="text-sm text-muted-foreground">Total Flights</div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex-col gap-2 hover:bg-accent/50"
                onClick={action.action}
              >
                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
