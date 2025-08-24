"use client"

import { Navigation } from "@/components/navigation"
import { AnalyticsWidget } from "@/components/dashboard/analytics-widget"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Package, Search, Clock, MapPin, Plane, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"

interface Booking {
  _id: string
  refId: string
  origin: string
  destination: string
  pieces: number
  weightKg: number
  status: string
  createdAt: string
  updatedAt: string
  timeline?: Array<{
    eventType: string
    location: string
    timestamp: string
    notes: string
  }>
}

export default function Dashboard() {
  const [searchRefId, setSearchRefId] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookingForm, setBookingForm] = useState({
    origin: "",
    destination: "",
    pieces: "",
    weightKg: "",
    flightIds: [] as string[],
  })

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin: bookingForm.origin,
          destination: bookingForm.destination,
          pieces: Number.parseInt(bookingForm.pieces) || 0,
          weightKg: Number.parseFloat(bookingForm.weightKg) || 0,
          flightIds: bookingForm.flightIds || [],
        }),
      })

      if (response.ok) {
        const booking = await response.json()
        alert(`✅ Booking created successfully!\nReference ID: ${booking.refId}`)
        setBookingForm({
          origin: "",
          destination: "",
          pieces: "",
          weightKg: "",
          flightIds: [],
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to create booking")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      setError("Network error. Please check if the backend server is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearchBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchRefId.trim()) return

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/bookings/${searchRefId.trim()}`)

      if (response.ok) {
        const booking = await response.json()
        setSelectedBooking(booking)
      } else if (response.status === 404) {
        setError("Booking not found. Please check the reference ID.")
        setSelectedBooking(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to search booking")
        setSelectedBooking(null)
      }
    } catch (error) {
      console.error("Error searching booking:", error)
      setError("Network error. Please check if the backend server is running.")
      setSelectedBooking(null)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BOOKED":
        return <Clock className="w-4 h-4 text-blue-500" />
      case "DEPARTED":
        return <Plane className="w-4 h-4 text-orange-500" />
      case "ARRIVED":
        return <MapPin className="w-4 h-4 text-purple-500" />
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "DEPARTED":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "ARRIVED":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">Cargo Management Dashboard</h1>
          <p className="text-muted-foreground">Real-time analytics, booking management, and operational insights.</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[800px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create">Create Booking</TabsTrigger>
            <TabsTrigger value="search">Search Booking</TabsTrigger>
            <TabsTrigger value="details">Booking Details</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AnalyticsWidget />
              </div>
              <div className="space-y-6">
                <QuickActions />
                <ActivityFeed />
              </div>
            </div>
          </TabsContent>

          {/* Create Booking Form */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Create New Booking
                </CardTitle>
                <CardDescription>Fill in the cargo details to create a new booking</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBooking} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="origin">Origin</Label>
                      <Input
                        id="origin"
                        placeholder="Enter airport code (e.g., JFK, LAX, LHR)"
                        value={bookingForm.origin}
                        onChange={(e) => setBookingForm({ ...bookingForm, origin: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        placeholder="Enter airport code (e.g., JFK, LAX, LHR)"
                        value={bookingForm.destination}
                        onChange={(e) => setBookingForm({ ...bookingForm, destination: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pieces">Number of Pieces</Label>
                      <Input
                        id="pieces"
                        type="number"
                        min="0"
                        placeholder="Enter number of pieces"
                        value={bookingForm.pieces}
                        onChange={(e) => setBookingForm({ ...bookingForm, pieces: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter the total number of pieces to ship</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Enter weight in kilograms"
                        value={bookingForm.weightKg}
                        onChange={(e) => setBookingForm({ ...bookingForm, weightKg: e.target.value })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Enter the total weight of your shipment</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Package className="w-4 h-4 mr-2" />
                          Create Booking
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Booking */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Search Booking by Reference ID
                </CardTitle>
                <CardDescription>Enter the booking reference ID to find and track your cargo</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearchBooking} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="refId">Booking Reference ID</Label>
                      <Input
                        id="refId"
                        placeholder="e.g., CRG1703123456789"
                        value={searchRefId}
                        onChange={(e) => setSearchRefId(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {selectedBooking && (
                  <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Booking Found</h3>
                      <Badge className={`${getStatusColor(selectedBooking.status)} border`}>
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reference ID:</span>
                        <p className="font-medium">{selectedBooking.refId}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <p className="font-medium">
                          {selectedBooking.origin} → {selectedBooking.destination}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pieces:</span>
                        <p className="font-medium">{selectedBooking.pieces || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <p className="font-medium">{selectedBooking.weightKg || 0} kg</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Details & Timeline */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Booking Details & Timeline
                </CardTitle>
                <CardDescription>Complete booking information with chronological event timeline</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedBooking ? (
                  <div className="space-y-6">
                    {/* Booking Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Reference ID</Label>
                          <p className="text-lg font-mono font-semibold">{selectedBooking.refId}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Origin</Label>
                            <p className="font-medium">{selectedBooking.origin}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Destination</Label>
                            <p className="font-medium">{selectedBooking.destination}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Pieces</Label>
                            <p className="font-medium">{selectedBooking.pieces || 0}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Weight</Label>
                            <p className="font-medium">{selectedBooking.weightKg || 0} kg</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(selectedBooking.status)}
                            <Badge className={`${getStatusColor(selectedBooking.status)} border`}>
                              {selectedBooking.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                          <p className="font-medium">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                          <p className="font-medium">{new Date(selectedBooking.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Event Timeline</h3>
                      {selectedBooking.timeline && selectedBooking.timeline.length > 0 ? (
                        <div className="space-y-4">
                          {selectedBooking.timeline.map((event, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary">
                                  {getStatusIcon(event.eventType)}
                                </div>
                                {index < selectedBooking.timeline!.length - 1 && (
                                  <div className="w-0.5 h-8 bg-border mt-2" />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`${getStatusColor(event.eventType)} border text-xs`}>
                                    {event.eventType}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-medium flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{event.notes}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No timeline events available</p>
                          <p className="text-sm">Timeline will be populated as the booking progresses</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Booking Selected</h3>
                    <p className="text-muted-foreground mb-4">Search for a booking to view its details and timeline</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
