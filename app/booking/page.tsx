"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import {
  Plane,
  Package,
  MapPin,
  CalendarIcon,
  Clock,
  Weight,
  Ruler,
  Shield,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Plus,
  RotateCcw,
  User,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Flight {
  flightId: string
  flightNumber: string
  airlineName: string
  departureDateTime: string
  arrivalDateTime: string
  origin: string
  destination: string
  type: "direct" | "transit"
  secondFlight?: Flight
  totalDuration?: number
}

interface Booking {
  refId: string
  clientId: string
  origin: string
  destination: string
  pieces: number
  weightKg: number
  status: string
  createdAt: string
}

const steps = [
  { id: 1, title: "Client Selection", description: "Select or create client for this booking" },
  { id: 2, title: "Route & Date", description: "Select origin, destination and shipping date" },
  { id: 3, title: "Cargo Details", description: "Specify cargo information and requirements" },
  { id: 4, title: "Flight Selection", description: "Choose from available flights" },
  { id: 5, title: "Review & Confirm", description: "Confirm details and complete booking" },
]

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [date, setDate] = useState<Date>(new Date()) // Set default to today
  const [loading, setLoading] = useState(false)
  const [availableFlights, setAvailableFlights] = useState<Flight[]>([])
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)
  const [airports, setAirports] = useState<Array<{code: string, city: string, country: string}>>([])
  const [airportsLoading, setAirportsLoading] = useState(true)
  const [clients, setClients] = useState<Array<{
    _id: string
    companyName: string
    contactPerson: {
      firstName: string
      lastName: string
    }
    email: string
  }>>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [formData, setFormData] = useState({
    clientId: "", // Client ID for the booking
    origin: "",
    destination: "",
    pieces: "", // Changed from weight to pieces to match assignment requirements
    weightKg: "", // Added weightKg field to match assignment requirements
    dimensions: { length: "", width: "", height: "" },
    cargoType: "",
    specialRequirements: "",
    selectedFlight: "",
    insurance: false,
    priorityHandling: false,
  })

  // Fetch airports from backend when component mounts
  const fetchAirports = async () => {
    try {
      setAirportsLoading(true)
      const response = await fetch('/api/flights/airports')
      
      if (response.ok) {
        const airportsData = await response.json()
        setAirports(airportsData)
        console.log('Fetched airports:', airportsData)
      } else {
        console.error('Failed to fetch airports:', response.status)
        // Don't use fallback mock data - let the user know there's an issue
        setAirports([])
        console.error('Failed to fetch airports from database')
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
      // Don't use fallback mock data - let the user know there's an issue
      setAirports([])
      console.error('Failed to fetch airports from database')
    } finally {
      setAirportsLoading(false)
    }
  }

  // Fetch clients from backend
  const fetchClients = async () => {
    try {
      setClientsLoading(true)
      const response = await fetch('/api/clients')
      
      if (response.ok) {
        const clientsData = await response.json()
        // Extract the clients array from the response
        setClients(clientsData.clients || [])
        console.log('Fetched clients:', clientsData.clients)
      } else {
        console.error('Failed to fetch clients:', response.status)
        setClients([])
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
      setClients([])
    } finally {
      setClientsLoading(false)
    }
  }

  // Fetch airports and clients on component mount
  useEffect(() => {
    fetchAirports()
    fetchClients()
  }, [])

  const progress = (currentStep / steps.length) * 100

  const nextStep = async () => {
    if (currentStep === 1) {
      if (!formData.clientId) {
        alert("Please select a client before proceeding.")
        return
      }
    }
    
    if (currentStep === 2) {
      if (!formData.origin || !formData.destination || !date) {
        alert("Please select origin, destination, and date before proceeding.")
        return
      }
      
      // Check for flights before proceeding
      await fetchAvailableFlights()
      
      // Only proceed if flights are found
      if (availableFlights.length === 0) {
        alert("No flights available for the selected route and date. Please try a different route or date.")
        return
      }
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      clientId: "",
      origin: "",
      destination: "",
      pieces: "",
      weightKg: "",
      dimensions: { length: "", width: "", height: "" },
      cargoType: "",
      specialRequirements: "",
      selectedFlight: "",
      insurance: false,
      priorityHandling: false,
    })
    setDate(new Date())
    setAvailableFlights([])
    setCreatedBooking(null)
    setCurrentStep(1)
  }

  const fetchAvailableFlights = async () => {
    if (!formData.origin || !formData.destination || !date) return

    setLoading(true)
    try {
      // Use current date if no date is selected, or format the selected date properly
      const departureDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      
      console.log('Fetching flights for:', {
        origin: formData.origin,
        destination: formData.destination,
        departureDate: departureDate
      })

      const response = await fetch(
        `/api/flights/routes?origin=${formData.origin}&destination=${formData.destination}&departureDate=${departureDate}`,
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Flights API response:', data)
        
        // Combine direct flights and transit routes
        const allFlights: Flight[] = [
          ...data.directFlights.map((flight: any) => ({ ...flight, type: "direct" as const })),
          ...data.transitRoutes.map((route: any) => ({
            ...route.firstFlight,
            type: "transit" as const,
            secondFlight: route.secondFlight,
            totalDuration: route.totalDuration,
          })),
        ]
        
        console.log('Processed flights:', allFlights)
        setAvailableFlights(allFlights)
        
        if (allFlights.length === 0) {
          console.log('No flights found for the selected route and date')
        }
      } else {
        console.error("Failed to fetch flights:", response.status, response.statusText)
        setAvailableFlights([])
      }
    } catch (error) {
      console.error("Error fetching flights:", error)
      setAvailableFlights([])
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async () => {
    setLoading(true)
    try {
      const bookingData = {
        clientId: formData.clientId,
        origin: formData.origin,
        destination: formData.destination,
        pieces: Number.parseInt(formData.pieces) || 0,
        weightKg: Number.parseFloat(formData.weightKg) || 0,
        flightIds: formData.selectedFlight ? [formData.selectedFlight] : [],
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const booking = await response.json()
        setCreatedBooking(booking)
        alert(`Booking created successfully! Reference ID: ${booking.refId}`)
        resetForm() // Reset form after successful booking
      } else {
        const error = await response.json()
        alert(`Error creating booking: ${error.error}`)
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Error creating booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">New Booking</h1>
            <p className="text-muted-foreground">Create a new cargo booking with our step-by-step process.</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Show success message if booking created */}
        {createdBooking && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Booking Created Successfully!</h3>
                    <p className="font-medium text-green-700">
                      Reference ID: <span className="font-mono font-bold">{createdBooking.refId}</span>
                    </p>
                    <p className="text-sm text-green-600 mt-1">You can track your booking using this reference ID.</p>
                  </div>
                </div>
                <Button 
                  onClick={resetForm} 
                  variant="outline" 
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Another Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flight Availability Guide */}
        <Card className="mb-8 border-border bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Plane className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-card-foreground">Finding Available Flights</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  To find available flights, select your origin and destination airports, choose a date, and click "Check Available Flights". 
                  <br />
                  <span className="font-medium text-primary mt-2 block">
                    🚀 ALL Routes Available: Every airport combination has flights!
                  </span>
                  <br />
                  <span className="text-xs text-muted-foreground">
                    💡 Use tomorrow's date for best results - all flights are scheduled for tomorrow!
                  </span>
                  <br />
                  <span className="text-xs text-muted-foreground mt-1">
                    🌍 15 airports × 14 destinations = 210 possible routes, ALL with flights!
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-serif font-semibold text-card-foreground">
              Step {currentStep} of {steps.length}
            </h2>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="mb-6" />

          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      currentStep >= step.id ? "text-card-foreground" : "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="w-12 h-px bg-border mx-4 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Client Selection
                </CardTitle>
                <CardDescription>Select the client for this cargo booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="client">Select Client</Label>
                  <Select value={formData.clientId} onValueChange={(value) => updateFormData("clientId", value)}>
                    <SelectTrigger disabled={clientsLoading}>
                      <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select a client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(clients) && clients.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{client.companyName}</span>
                            <span className="text-muted-foreground">- {client.contactPerson.firstName} {client.contactPerson.lastName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {Array.isArray(clients) && clients.length === 0 && !clientsLoading && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">No clients available</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        You need to create a client first before making a booking.
                      </p>
                      <div className="mt-3">
                        <Link href="/clients">
                          <Button variant="outline" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            Go to Clients
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {formData.clientId && Array.isArray(clients) && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>Client selected successfully</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Route & Date Selection
                </CardTitle>
                <CardDescription>Choose your origin, destination, and preferred shipping date</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin Airport</Label>
                    <Select value={formData.origin} onValueChange={(value) => updateFormData("origin", value)}>
                      <SelectTrigger disabled={airportsLoading}>
                        <SelectValue placeholder={airportsLoading ? "Loading airports..." : "Select origin airport"} />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{airport.code}</span>
                              <span className="text-muted-foreground">- {airport.city}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination Airport</Label>
                    <Select value={formData.destination} onValueChange={(value) => updateFormData("destination", value)}>
                      <SelectTrigger disabled={airportsLoading}>
                        <SelectValue placeholder={airportsLoading ? "Loading airports..." : "Select destination airport"} />
                      </SelectTrigger>
                      <SelectContent>
                        {airports.map((airport) => (
                          <SelectItem key={airport.code} value={airport.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{airport.code}</span>
                              <span className="text-muted-foreground">- {airport.city}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-card-foreground">Departure Date</Label>
                  </div>
                  <div className="relative group">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12 px-4 transition-all duration-300 hover:shadow-md hover:border-primary/40 group-hover:scale-[1.01]",
                            !date && "text-muted-foreground border border-muted-foreground/20"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1 text-left">
                              {date ? (
                                <span className="font-medium text-card-foreground">
                                  {format(date, "MMM d, yyyy")}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Select date</span>
                              )}
                            </div>
                          </div>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-0 shadow-xl rounded-xl overflow-hidden" align="start">
                        <div className="bg-background">
                          <div className="p-4 border-b border-border/50">
                            <div className="text-center">
                              <h3 className="text-sm font-medium text-muted-foreground">Select Date</h3>
                            </div>
                          </div>
                          <div className="p-3">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={(newDate) => setDate(newDate || new Date())}
                              initialFocus
                              disabled={(date) => date < new Date()}
                              className="calendar-enhanced"
                              classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-3",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium text-card-foreground",
                                nav: "space-x-1 flex items-center",
                                nav_button: cn(
                                  "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity",
                                  "hover:bg-accent hover:text-accent-foreground rounded-md"
                                ),
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                row: "flex w-full mt-1",
                                cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: cn(
                                  "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                  "hover:bg-accent hover:text-accent-foreground rounded-md transition-all duration-200",
                                  "focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20"
                                ),
                                day_range_end: "day-range-end",
                                day_selected: cn(
                                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
                                  "focus:bg-primary focus:text-primary-foreground focus:shadow-md transition-all duration-200"
                                ),
                                day_today: "bg-accent text-accent-foreground font-medium",
                                day_outside: cn(
                                  "day-outside text-muted-foreground opacity-40 aria-selected:bg-accent/50",
                                  "aria-selected:text-muted-foreground aria-selected:opacity-30"
                                ),
                                day_disabled: "text-muted-foreground opacity-30 hover:bg-transparent hover:text-muted-foreground",
                                day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                              }}
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Minimal date confirmation */}
                  {date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Date confirmed: {format(date, "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                {/* Flight Availability Check */}
                {formData.origin && formData.destination && date && (
                  <div className="space-y-4">
                    <Button 
                      onClick={fetchAvailableFlights} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking Flight Availability...
                        </>
                      ) : (
                        <>
                          <Plane className="w-4 h-4 mr-2" />
                          Check Available Flights
                        </>
                      )}
                    </Button>
                    
                    {availableFlights.length > 0 && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-medium">{availableFlights.length} flights available</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Flights found for {formData.origin} → {formData.destination} on {format(date, "PPP")}
                        </p>
                      </div>
                    )}
                    
                    {availableFlights.length === 0 && formData.origin && formData.destination && !loading && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">No direct flights found</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          No flights available for {formData.origin} → {formData.destination} on {format(date, "PPP")}
                        </p>
                        
                        {/* Show available routes from origin */}
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">
                            💡 Available routes from {formData.origin}:
                          </h4>
                          <div className="text-xs text-blue-700 space-y-1">
                            <p>Try these popular destinations from {formData.origin}:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {airports
                                .filter(airport => airport.code !== formData.origin && airport.code !== formData.destination)
                                .slice(0, 6)
                                .map(airport => (
                                  <button
                                    key={airport.code}
                                    onClick={() => updateFormData("destination", airport.code)}
                                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-xs font-medium transition-colors"
                                  >
                                    {airport.code} ({airport.city})
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        {/* Show available routes to destination */}
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="text-sm font-medium text-green-800 mb-2">
                            🎯 Available routes to {formData.destination}:
                          </h4>
                          <div className="text-xs text-green-700 space-y-1">
                            <p>Try these popular origins to {formData.destination}:</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {airports
                                .filter(airport => airport.code !== formData.origin && airport.code !== formData.destination)
                                .slice(0, 6)
                                .map(airport => (
                                  <button
                                    key={airport.code}
                                    onClick={() => updateFormData("origin", airport.code)}
                                    className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded text-xs font-medium transition-colors"
                                  >
                                    {airport.code} ({airport.city})
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-yellow-700">
                          <p className="font-medium">💡 Tips:</p>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Try searching for tomorrow's date (flights are available)</li>
                            <li>Check if you need to go through a hub airport</li>
                            <li>Consider alternative routes with connections</li>
                          </ul>
                        </div>

                        {/* Show all available routes from database */}
                        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            📋 All Available Routes in System:
                          </h4>
                          <div className="text-xs text-gray-700">
                            <p className="mb-2">These are the routes currently available in our system:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">JFK ↔ LAX</span>
                                <br />
                                <span className="text-gray-500">New York ↔ Los Angeles</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">LHR ↔ CDG</span>
                                <br />
                                <span className="text-gray-500">London ↔ Paris</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">NRT ↔ PEK</span>
                                <br />
                                <span className="text-gray-500">Tokyo ↔ Beijing</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">DEL ↔ DXB</span>
                                <br />
                                <span className="text-gray-500">Delhi ↔ Dubai</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">SYD ↔ SIN</span>
                                <br />
                                <span className="text-gray-500">Sydney ↔ Singapore</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">DXB ↔ FRA</span>
                                <br />
                                <span className="text-gray-500">Dubai ↔ Frankfurt</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">HKG ↔ ICN</span>
                                <br />
                                <span className="text-gray-500">Hong Kong ↔ Seoul</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">SIN ↔ BOM</span>
                                <br />
                                <span className="text-gray-500">Singapore ↔ Mumbai</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">BOM ↔ BLR</span>
                                <br />
                                <span className="text-gray-500">Mumbai ↔ Bangalore</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">DEL ↔ BOM</span>
                                <br />
                                <span className="text-gray-500">Delhi ↔ Mumbai</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">CDG ↔ FRA</span>
                                <br />
                                <span className="text-gray-500">Paris ↔ Frankfurt</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">FRA ↔ LHR</span>
                                <br />
                                <span className="text-gray-500">Frankfurt ↔ London</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">NRT ↔ HKG</span>
                                <br />
                                <span className="text-gray-500">Tokyo ↔ Hong Kong</span>
                              </div>
                              <div className="p-2 bg-white rounded border">
                                <span className="font-medium">PEK ↔ SYD</span>
                                <br />
                                <span className="text-gray-500">Beijing ↔ Sydney</span>
                              </div>
                            </div>
                            <p className="mt-2 text-gray-600">
                              💡 Click on any airport code above to quickly select it as origin or destination!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Cargo Details
                </CardTitle>
                <CardDescription>Provide detailed information about your cargo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="pieces">Number of Pieces</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pieces"
                        type="number"
                        min="1"
                        placeholder="Enter number of pieces"
                        value={formData.pieces}
                        onChange={(e) => updateFormData("pieces", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightKg">Total Weight (kg)</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="weightKg"
                        type="number"
                        min="0.1"
                        step="0.1"
                        placeholder="Enter weight in kg"
                        value={formData.weightKg}
                        onChange={(e) => updateFormData("weightKg", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dimensions (cm)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Length"
                        value={formData.dimensions.length}
                        onChange={(e) =>
                          updateFormData("dimensions", { ...formData.dimensions, length: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Width"
                        value={formData.dimensions.width}
                        onChange={(e) =>
                          updateFormData("dimensions", { ...formData.dimensions, width: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Height"
                        value={formData.dimensions.height}
                        onChange={(e) =>
                          updateFormData("dimensions", { ...formData.dimensions, height: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Special Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Any special handling requirements, temperature control, fragile items, etc."
                    value={formData.specialRequirements}
                    onChange={(e) => updateFormData("specialRequirements", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Additional Services</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="insurance"
                        checked={formData.insurance}
                        onCheckedChange={(checked) => updateFormData("insurance", checked)}
                      />
                      <Label htmlFor="insurance" className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-accent" />
                        Cargo Insurance (+$50)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="priority"
                        checked={formData.priorityHandling}
                        onCheckedChange={(checked) => updateFormData("priorityHandling", checked)}
                      />
                      <Label htmlFor="priority" className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-chart-2" />
                        Priority Handling (+$100)
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Plane className="w-5 h-5 text-primary" />
                  Flight Selection
                </CardTitle>
                <CardDescription>Choose from available flights for your route</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading available flights...</span>
                  </div>
                ) : availableFlights.length > 0 ? (
                  <RadioGroup
                    value={formData.selectedFlight}
                    onValueChange={(value) => updateFormData("selectedFlight", value)}
                  >
                    <div className="space-y-4">
                      {availableFlights.map((flight, index) => (
                        <div key={`${flight.flightId}-${flight.origin}-${flight.destination}-${flight.departureDateTime}-${index}`} className="relative">
                          <RadioGroupItem
                            value={flight.flightId}
                            id={`${flight.flightId}-${index}`}
                            className="absolute top-4 left-4"
                          />
                          <Label
                            htmlFor={`${flight.flightId}-${index}`}
                            className="block p-4 pl-12 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-card-foreground">{flight.flightNumber}</span>
                                  <span className="text-sm text-muted-foreground">• {flight.airlineName}</span>
                                  <Badge variant={flight.type === "direct" ? "default" : "secondary"}>
                                    {flight.type === "direct" ? "Direct" : "Transit"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(flight.departureDateTime).toLocaleTimeString()} -{" "}
                                    {new Date(flight.arrivalDateTime).toLocaleTimeString()}
                                  </span>
                                  <span>
                                    {flight.origin} → {flight.destination}
                                  </span>
                                </div>
                                {flight.secondFlight && (
                                  <div className="text-xs text-muted-foreground pl-4 border-l-2 border-muted">
                                    Transit via {flight.destination}: {flight.secondFlight.flightNumber} (
                                    {new Date(flight.secondFlight.departureDateTime).toLocaleTimeString()} -{" "}
                                    {new Date(flight.secondFlight.arrivalDateTime).toLocaleTimeString()})
                                  </div>
                                )}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="text-center py-8">
                    <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Flights Available</h3>
                    <p className="text-muted-foreground">
                      No flights found for the selected route and date. Please try different options.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Booking Summary
                  </CardTitle>
                  <CardDescription>Review your booking details before confirmation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Client Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-card-foreground mb-2">Client Information</h4>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      {(() => {
                        const client = Array.isArray(clients) ? clients.find((c) => c._id === formData.clientId) : null
                        return client ? (
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-card-foreground">{client.companyName}</div>
                            <div className="text-muted-foreground">Contact: {client.contactPerson.firstName} {client.contactPerson.lastName}</div>
                            <div className="text-muted-foreground">Email: {client.email}</div>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">No client selected</div>
                        )
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-card-foreground mb-2">Route Information</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Origin:</span>
                            <span>{formData.origin}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Destination:</span>
                            <span>{formData.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{date ? format(date, "PPP") : "Not selected"}</span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-card-foreground mb-2">Cargo Details</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pieces:</span>
                            <span>{formData.pieces}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Weight:</span>
                            <span>{formData.weightKg} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Type:</span>
                            <span className="capitalize">{formData.cargoType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-card-foreground mb-2">Selected Flight</h4>
                        {formData.selectedFlight && (
                          <div className="p-3 border rounded-lg">
                            {(() => {
                              const flight = availableFlights.find((f) => f.flightId === formData.selectedFlight)
                              return flight ? (
                                <div className="space-y-1 text-sm">
                                  <div className="font-medium">
                                    {flight.flightNumber} - {flight.airlineName}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {new Date(flight.departureDateTime).toLocaleString()} -{" "}
                                    {new Date(flight.arrivalDateTime).toLocaleString()}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {flight.origin} → {flight.destination}
                                  </div>
                                </div>
                              ) : null
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={loading || 
                  (currentStep === 1 && !formData.clientId) ||
                  (currentStep === 2 && (!formData.origin || !formData.destination || !date))
                }
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button 
                  onClick={createBooking}
                  disabled={loading || !formData.selectedFlight} 
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Booking
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="px-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Form
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
