"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Navigation } from "@/components/navigation"
import {
  Plane,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Clock,
  MapPin,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  TrendingUp,
  Info,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

// Flight interface based on backend data
interface Flight {
  _id: string
  flightId: string
  flightNumber: string
  airlineName: string
  departureDateTime: string
  arrivalDateTime: string
  origin: string
  destination: string
  aircraftType?: string
  capacity?: number
  availableSpace?: number
  status?: string
  createdAt: string
  updatedAt: string
}

interface Booking {
  _id: string
  refId: string
  origin: string
  destination: string
  flightIds: string[]
  status: string
  createdAt: string
  pieces?: number // Added for total cargo pieces
}

// Dynamic status configuration based on actual flight data
const getStatusConfig = (status: string) => {
  const statusMap: Record<string, { color: string; textColor: string; icon: any }> = {
    "SCHEDULED": { color: "bg-primary", textColor: "text-primary", icon: Plane },
    "BOARDING": { color: "bg-accent", textColor: "text-accent", icon: Users },
    "DEPARTED": { color: "bg-chart-2", textColor: "text-chart-2", icon: Clock },
    "ARRIVED": { color: "bg-chart-3", textColor: "text-chart-3", icon: CheckCircle },
    "CANCELLED": { color: "bg-chart-4", textColor: "text-chart-4", icon: XCircle },
  }
  
  return statusMap[status.toUpperCase()] || { 
    color: "bg-muted", 
    textColor: "text-muted-foreground", 
    icon: Plane 
  }
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [viewMode, setViewMode] = useState<"my-flights" | "all-flights">("my-flights")

  // Fetch flights and bookings from backend
  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch both flights and bookings
      const [flightsResponse, bookingsResponse] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/bookings')
      ])
      
      if (flightsResponse.ok && bookingsResponse.ok) {
        const flightsData = await flightsResponse.json()
        const bookingsData = await bookingsResponse.json()
        
        setFlights(flightsData)
        setBookings(bookingsData.bookings || bookingsData) // Handle both formats
      } else {
        console.error('Failed to fetch data:', flightsResponse.status, bookingsResponse.status)
        setError('Failed to fetch data from server')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [])

  // Get flights that are relevant to your operations
  const getRelevantFlights = () => {
    if (bookings.length === 0) {
      return [] // No bookings means no relevant flights
    }

    // Get unique flight IDs from all bookings
    const relevantFlightIds = new Set<string>()
    bookings.forEach(booking => {
      if (booking.flightIds && Array.isArray(booking.flightIds)) {
        booking.flightIds.forEach(flightId => relevantFlightIds.add(flightId))
      }
    })

    // Filter flights to only show those with bookings
    // This will show ALL flights that have your cargo, regardless of date
    return flights.filter(flight => relevantFlightIds.has(flight.flightId))
  }

  // Get flights for the selected view mode
  const getDisplayFlights = () => {
    if (viewMode === "my-flights") {
      return getRelevantFlights()
    }
    return flights
  }

  // Use real flight status from database instead of calculating mock status
  const getFlightStatus = (flight: Flight) => {
    if (flight.status) {
      return flight.status.toLowerCase()
    }
    return "scheduled"
  }

  // Calculate capacity and revenue based on real flight data
  const getFlightMetrics = (flight: Flight) => {
    const capacity = flight.capacity || 0
    const availableSpace = flight.availableSpace || 0
    const usedCapacity = capacity > 0 ? Math.round(((capacity - availableSpace) / capacity) * 100) : 0
    
    // Count actual bookings for this flight
    const flightBookings = bookings.filter(booking => 
      booking.flightIds && booking.flightIds.includes(flight.flightId)
    ).length
    
    return { 
      capacity: { used: usedCapacity, total: capacity }, 
      revenue: 0, // Will be enhanced when revenue tracking is implemented
      bookings: flightBookings
    }
  }

  const displayFlights = getDisplayFlights()
  const filteredFlights = displayFlights.filter((flight) => {
    const matchesSearch =
      flight.flightId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || getFlightStatus(flight) === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status)
    const Icon = config.icon
    return (
      <Badge variant="outline" className={`${config.textColor} border-current`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </Badge>
    )
  }

  // Check if user has any bookings
  const hasBookings = bookings.length > 0
  const relevantFlightsCount = getRelevantFlights().length || 0

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">Flight Management</h1>
            <p className="text-muted-foreground">
              {hasBookings 
                ? `Monitor and manage your cargo flights (${relevantFlightsCount} flights with your cargo)`
                : "No cargo bookings yet - flights will appear here when you make bookings"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={fetchData}
              disabled={loading}
              className="border-primary/20 text-primary hover:bg-primary/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            <Link href="/booking">
              <Button className="bg-primary hover:bg-primary/90">
                <Package className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </Link>
          </div>
        </div>

        {/* No Bookings State */}
        {!hasBookings && (
          <Card className="mb-8 border-dashed border-2 border-muted-foreground/30">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Plane className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">No Cargo Flights Available</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                You don't have any cargo bookings yet. Flights will appear here once you create bookings and select flights for your cargo shipments.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/booking">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Package className="w-4 h-4 mr-2" />
                    Create Your First Booking
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => setViewMode("all-flights")}>
                  <Eye className="w-4 h-4 mr-2" />
                  View All Available Flights
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message for New Bookings */}
        {hasBookings && (
          <Card className="mb-6 border-2 border-emerald-600 bg-emerald-900 dark:bg-emerald-950 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-400">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-800 dark:bg-emerald-800 flex items-center justify-center ring-2 ring-emerald-600 dark:ring-emerald-500">
                    <CheckCircle className="w-6 h-6 text-emerald-100 dark:text-emerald-200" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-emerald-50 dark:text-emerald-100 text-lg mb-2">
                    Cargo Bookings Found! 🎉
                  </h3>
                  <p className="text-sm text-emerald-100 dark:text-emerald-200 leading-relaxed">
                    You have <span className="font-semibold text-emerald-50 dark:text-emerald-100">{relevantFlightsCount} flight{relevantFlightsCount !== 1 ? 's' : ''}</span> with your cargo. 
                    All your booking flights are displayed below, regardless of departure date.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        {hasBookings && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">View Mode:</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "my-flights" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("my-flights")}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    My Cargo Flights ({relevantFlightsCount})
                  </Button>
                  <Button
                    variant={viewMode === "all-flights" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("all-flights")}
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    All Available Flights ({flights.length})
                  </Button>
                </div>
              </div>
              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>My Cargo Flights:</strong> Shows ALL flights that contain your cargo shipments, regardless of departure date.
                  <br />
                  <strong>All Available Flights:</strong> Shows all scheduled flights in the system.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats - Only show when there are relevant flights */}
        {hasBookings && relevantFlightsCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">My Flights</p>
                    <p className="text-2xl font-bold text-card-foreground">{relevantFlightsCount}</p>
                  </div>
                  <Plane className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold text-chart-3">
                      {bookings.filter(b => b.status !== "DELIVERED").length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-chart-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Cargo</p>
                    <p className="text-2xl font-bold text-chart-2">
                      {bookings.reduce((acc, b) => acc + (b.pieces || 0), 0)} pieces
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-chart-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Capacity</p>
                    <p className="text-2xl font-bold text-card-foreground">
                      {relevantFlightsCount > 0 
                        ? Math.round(getRelevantFlights().reduce((acc, f) => acc + getFlightMetrics(f).capacity.used, 0) / relevantFlightsCount)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search - Only show when there are flights to display */}
        {filteredFlights.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search flights by ID, origin, or destination..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="boarding">Boarding</SelectItem>
                      <SelectItem value="departed">Departed</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flights Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">
              {viewMode === "my-flights" ? "My Cargo Flights" : "All Available Flights"}
            </CardTitle>
            <CardDescription>
              {viewMode === "my-flights" 
                ? `All ${relevantFlightsCount} flights containing your cargo shipments - displayed regardless of departure date`
                : "All flights in the system (including those without your cargo)"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>My Cargo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="mt-2 text-muted-foreground">Loading flights...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredFlights.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {viewMode === "my-flights" ? (
                        <div className="space-y-2">
                          <Plane className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">No flights with your cargo found.</p>
                          <p className="text-sm text-muted-foreground">Try creating a booking first.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Plane className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">No flights found matching your criteria.</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFlights.map((flight) => {
                    const hasMyCargo = bookings.some(booking => 
                      booking.flightIds && booking.flightIds.includes(flight.flightId)
                    )
                    
                    return (
                      <TableRow key={flight._id} className={`hover:bg-muted/50 ${hasMyCargo ? 'bg-primary/5' : ''}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-card-foreground">{flight.flightId}</div>
                            <div className="text-sm text-muted-foreground">{flight.flightNumber}</div>
                            {hasMyCargo && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                <Package className="w-3 h-3 mr-1" />
                                My Cargo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{flight.origin}</span>
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{flight.destination}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(flight.departureDateTime).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(flight.departureDateTime).toLocaleTimeString()} - {new Date(flight.arrivalDateTime).toLocaleTimeString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(flight.departureDateTime).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(getFlightStatus(flight))}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{getFlightMetrics(flight).capacity.used}%</span>
                              <span className="text-muted-foreground">{getFlightMetrics(flight).capacity.total} total</span>
                            </div>
                            <Progress value={getFlightMetrics(flight).capacity.used} className="h-2" />
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasMyCargo ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  <Package className="w-3 h-3 mr-1" />
                                  {getFlightMetrics(flight).bookings} {getFlightMetrics(flight).bookings === 1 ? 'booking' : 'bookings'}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {bookings.filter(b => b.flightIds && b.flightIds.includes(flight.flightId))
                                  .map(booking => (
                                    <div key={booking._id} className="text-xs bg-primary/10 p-1 rounded">
                                      <div className="font-medium text-primary">{booking.refId}</div>
                                      <div className="text-muted-foreground">
                                        {booking.pieces} pieces
                                      </div>
                                      <div className="text-muted-foreground">
                                        {booking.origin} → {booking.destination}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">No cargo</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedFlight(flight)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="font-serif">Flight Details - {flight.flightId}</DialogTitle>
                                  <DialogDescription>Comprehensive flight information and management</DialogDescription>
                                </DialogHeader>
                                {selectedFlight && (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-card-foreground mb-2">Flight Information</h4>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Flight ID:</span>
                                              <span>{selectedFlight.flightId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Flight Number:</span>
                                              <span>{selectedFlight.flightNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Airline:</span>
                                              <span>{selectedFlight.airlineName}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Status:</span>
                                              {getStatusBadge(getFlightStatus(selectedFlight))}
                                            </div>
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-medium text-card-foreground mb-2">Schedule</h4>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Departure:</span>
                                              <span>{new Date(selectedFlight.departureDateTime).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Arrival:</span>
                                              <span>{new Date(selectedFlight.arrivalDateTime).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-card-foreground mb-2">Performance</h4>
                                          <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Capacity Used:</span>
                                              <span>{getFlightMetrics(selectedFlight).capacity.used}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">My Bookings:</span>
                                              <span>{getFlightMetrics(selectedFlight).bookings}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Total Capacity:</span>
                                              <span>{getFlightMetrics(selectedFlight).capacity.total}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {hasMyCargo && (
                                          <div>
                                            <h4 className="font-medium text-card-foreground mb-2">My Cargo</h4>
                                            <div className="space-y-1 text-sm">
                                              {bookings.filter(b => b.flightIds && b.flightIds.includes(selectedFlight.flightId))
                                                .map(booking => (
                                                  <div key={booking._id} className="flex justify-between">
                                                    <span className="text-muted-foreground">Booking:</span>
                                                    <span className="font-mono">{booking.refId}</span>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="status-update">Update Status</Label>
                                        <Select defaultValue={getFlightStatus(selectedFlight)}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="boarding">Boarding</SelectItem>
                                            <SelectItem value="departed">Departed</SelectItem>
                                            <SelectItem value="arrived">Arrived</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <Label htmlFor="notes-update">Update Notes</Label>
                                        <Textarea
                                          id="notes-update"
                                          defaultValue={""}
                                          placeholder="Add flight notes or updates..."
                                          rows={3}
                                        />
                                      </div>

                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline">Cancel</Button>
                                        <Button>Save Changes</Button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
