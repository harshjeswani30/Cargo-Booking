"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AdvancedFilters } from "@/components/search/advanced-filters"
import { BookingDetailsModal } from "@/components/bookings/booking-details-modal"
import { BulkActions } from "@/components/bookings/bulk-actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Filter, Eye, Edit, Package, MapPin, Calendar, MoreHorizontal, ArrowUpDown, Loader2, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

// Booking interface based on backend data
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
  flightIds: string[]
  timeline?: Array<{
    eventType: string
    location: string
    timestamp: string
    notes: string
  }>
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [sortField, setSortField] = useState("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Fetch real bookings from backend
  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await fetch('/api/bookings')
      
      if (response.ok) {
        const bookingsData = await response.json()
        setBookings(bookingsData)
        console.log('Fetched bookings:', bookingsData)
      } else {
        console.error('Failed to fetch bookings:', response.status)
        setError('Failed to fetch bookings from server')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings()
  }, [])

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      const matchesSearch = 
        booking.refId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter.toLowerCase()
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (!sortField) return 0
      
      let aValue: any = a[sortField as keyof Booking]
      let bValue: any = b[sortField as keyof Booking]
      
      // Handle special cases
      if (sortField === "route") {
        aValue = `${a.origin}${a.destination}`
        bValue = `${b.origin}${b.destination}`
      }
      
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // Calculate real statistics with fallbacks to 0
  const totalBookings = bookings.length || 0
  const confirmedBookings = bookings.filter(b => b.status === "BOOKED").length || 0
  const inTransitBookings = bookings.filter(b => b.status === "DEPARTED").length || 0
  const deliveredBookings = bookings.filter(b => b.status === "DELIVERED").length || 0

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings([...selectedBookings, bookingId])
    } else {
      setSelectedBookings(selectedBookings.filter((id) => id !== bookingId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBookings(filteredBookings.map((b) => b._id))
    } else {
      setSelectedBookings([])
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsModalOpen(true)
  }

  const handleBulkAction = (action: string, bookingIds: string[]) => {
    console.log(`Performing ${action} on bookings:`, bookingIds)
    // Implement bulk action logic here
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking({
      ...booking,
      flightIds: booking.flightIds || []
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string, notes?: string) => {
    try {
      setIsUpdatingStatus(true)
      
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes || `Status updated to ${newStatus}`,
        }),
      })

      if (response.ok) {
        // Refresh bookings after update
        await fetchBookings()
        // Show success message
        alert(`Status updated to ${newStatus} successfully!`)
      } else {
        const errorData = await response.json()
        alert(`Failed to update status: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        // Find the booking to get the refId
        const booking = bookings.find(b => b._id === bookingId);
        if (!booking) {
          alert('Booking not found');
          return;
        }

        const response = await fetch(`/api/bookings?refId=${booking.refId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          // Remove from local state
          setBookings(bookings.filter(b => b._id !== bookingId))
          alert('Booking deleted successfully!')
        } else {
          const errorData = await response.json()
          alert(`Failed to delete booking: ${errorData.error || 'Unknown error'}`)
        }
      } catch (error) {
        console.error('Error deleting booking:', error)
        alert('Failed to delete booking. Please try again.')
      }
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "booked":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "departed":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "arrived":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (weight: number) => {
    // Dynamic priority based on actual weight data
    if (weight > 3000) return "bg-red-100 text-red-800 border-red-200"
    if (weight > 1000) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getPriorityLabel = (weight: number) => {
    // Dynamic priority label based on actual weight data
    if (weight > 3000) return "High"
    if (weight > 1000) return "Medium"
    return "Low"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-card-foreground mb-2">Bookings Management</h1>
            <p className="text-muted-foreground">Comprehensive booking management with advanced features.</p>
          </div>
          <Link href="/booking">
            <Button className="bg-primary hover:bg-primary/90">
              <Package className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-card-foreground">{totalBookings}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-chart-3">{confirmedBookings}</p>
                </div>
                <Calendar className="w-8 h-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                  <p className="text-2xl font-bold text-chart-2">{inTransitBookings}</p>
                </div>
                <MapPin className="w-8 h-8 text-chart-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold text-chart-1">{deliveredBookings}</p>
                </div>
                <Package className="w-8 h-8 text-chart-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="mb-6">
            <BulkActions
              selectedBookings={selectedBookings}
              onClearSelection={() => setSelectedBookings([])}
              onBulkAction={handleBulkAction}
            />
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mb-6">
            <AdvancedFilters onFiltersChange={(filters) => console.log("Filters changed:", filters)} />
          </div>
        )}

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif">All Bookings</CardTitle>
                <CardDescription>Manage and track all cargo bookings</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                {showAdvancedFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by booking ID, origin, or destination..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="departed">Departed</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox checked={selectedBookings.length === filteredBookings.length} onCheckedChange={handleSelectAll} />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("refId")} className="h-auto p-0 font-medium">
                      Booking ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("origin")} className="h-auto p-0 font-medium">
                      Origin
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("destination")} className="h-auto p-0 font-medium">
                      Destination
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("weightKg")} className="h-auto p-0 font-medium">
                      Weight
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort("pieces")} className="h-auto p-0 font-medium">
                      Pieces
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="mt-2 text-muted-foreground">Loading bookings...</p>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBookings.includes(booking._id)}
                          onCheckedChange={(checked) => handleSelectBooking(booking._id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium font-mono">{booking.refId}</TableCell>
                      <TableCell>{booking.origin}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {booking.destination}
                        </div>
                      </TableCell>
                      <TableCell>{booking.weightKg} kg</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(booking.status)} border capitalize`}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getPriorityColor(booking.weightKg)} border capitalize`}>
                          {getPriorityLabel(booking.weightKg)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{booking.pieces}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(booking)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditBooking(booking)}
                            title="Edit Booking"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" title="More Actions">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(booking._id, 'BOOKED')}
                                disabled={isUpdatingStatus}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Booked
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(booking._id, 'DEPARTED')}
                                disabled={isUpdatingStatus}
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mark as Departed
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(booking._id, 'ARRIVED')}
                                disabled={isUpdatingStatus}
                              >
                                <MapPin className="w-4 h-4 mr-2" />
                                Mark as Arrived
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(booking._id, 'DELIVERED')}
                                disabled={isUpdatingStatus}
                              >
                                <Package className="w-4 h-4 mr-2" />
                                Mark as Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(booking._id, 'CANCELLED')}
                                disabled={isUpdatingStatus}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Mark as Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteBooking(booking._id)}
                                className="text-red-600 focus:text-red-600"
                                disabled={isUpdatingStatus}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Booking
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Booking Details Modal */}
        <BookingDetailsModal
          booking={selectedBooking}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
        />

        {/* Edit Booking Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif">Edit Booking - {editingBooking?.refId}</DialogTitle>
              <DialogDescription>Update booking details and status</DialogDescription>
            </DialogHeader>
            
            {editingBooking && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="origin">Origin</Label>
                      <Input 
                        id="origin" 
                        value={editingBooking.origin} 
                        onChange={(e) => setEditingBooking({...editingBooking, origin: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Input 
                        id="destination" 
                        value={editingBooking.destination} 
                        onChange={(e) => setEditingBooking({...editingBooking, destination: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pieces">Pieces</Label>
                      <Input 
                        id="pieces" 
                        type="number"
                        value={editingBooking.pieces} 
                        onChange={(e) => setEditingBooking({...editingBooking, pieces: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input 
                        id="weightKg" 
                        type="number"
                        value={editingBooking.weightKg} 
                        onChange={(e) => setEditingBooking({...editingBooking, weightKg: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editingBooking.status} 
                    onValueChange={(value) => setEditingBooking({...editingBooking, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOOKED">Booked</SelectItem>
                      <SelectItem value="DEPARTED">Departed</SelectItem>
                      <SelectItem value="ARRIVED">Arrived</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/bookings/${editingBooking._id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingBooking),
                        })
                        
                        if (response.ok) {
                          await fetchBookings()
                          setIsEditModalOpen(false)
                          alert('Booking updated successfully!')
                        } else {
                          const errorData = await response.json()
                          alert(`Failed to update: ${errorData.error || 'Unknown error'}`)
                        }
                      } catch (error) {
                        console.error('Error updating booking:', error)
                        alert('Failed to update booking. Please try again.')
                      }
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
