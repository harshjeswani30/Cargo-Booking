"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  MessageSquare,
  User,
  Plane,
  Weight,
  Ruler,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BookingDetailsModalProps {
  booking: {
    _id: string
    refId: string
    clientId?: string
    origin: string
    destination: string
    pieces: number
    weightKg: number
    status: string
    flightIds: string[]
    createdAt: string
    updatedAt: string
    timeline?: Array<{
      eventType: string
      location: string
      timestamp: string
      notes: string
      _id: string
    }>
  } | null
  isOpen: boolean
  onClose: () => void
}

export function BookingDetailsModal({ booking, isOpen, onClose }: BookingDetailsModalProps) {
  const [newComment, setNewComment] = useState("")

  if (!booking) return null

  const handleAddComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      console.log("Adding comment:", newComment)
      setNewComment("")
    }
  }

  const handleDocumentUpload = () => {
    // Document upload logic here
    console.log("Uploading document")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Booking Details - {booking.refId}
          </DialogTitle>
          <DialogDescription>Complete booking information and management tools</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 pb-6">
            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Booking ID</Label>
                        <p className="font-mono font-medium text-lg">{booking.refId}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <Badge className="mt-1 capitalize" variant={
                          booking.status === 'BOOKED' ? 'default' :
                          booking.status === 'DEPARTED' ? 'secondary' :
                          booking.status === 'ARRIVED' ? 'outline' :
                          booking.status === 'DELIVERED' ? 'default' :
                          'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Created</Label>
                        <p className="font-medium text-sm">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Last Updated</Label>
                        <p className="font-medium text-sm">
                          {new Date(booking.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Internal ID</Label>
                      <p className="font-mono text-sm text-muted-foreground">{booking._id}</p>
                    </div>
                    {booking.clientId && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Client ID</Label>
                        <p className="font-mono text-sm text-muted-foreground">{booking.clientId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Route & Cargo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Route</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium text-lg">
                          {booking.origin} → {booking.destination}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Weight</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Weight className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">{booking.weightKg} kg</p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Pieces</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">{booking.pieces} pieces</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Cargo Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">General Cargo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Flight Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Flight Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.flightIds && booking.flightIds.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {booking.flightIds.map((flightId, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                            <Plane className="w-5 h-5 text-primary" />
                            <div>
                              <Label className="text-sm text-muted-foreground">Flight ID</Label>
                              <p className="font-mono font-medium">{flightId}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No flights assigned to this booking</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {booking.timeline && booking.timeline.length > 0 ? (
                      <div className="space-y-3">
                        {booking.timeline?.slice(0, 3).map((event, index) => (
                          <div key={event._id} className="flex items-center gap-3 p-2 border rounded">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{event.eventType}</p>
                              <p className="text-xs text-muted-foreground">
                                {event.location} • {new Date(event.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {booking.timeline && booking.timeline.length > 3 && (
                          <p className="text-center text-sm text-muted-foreground">
                            +{booking.timeline.length - 3} more events
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Timeline</CardTitle>
                  <CardDescription>Chronological history of booking events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.timeline && booking.timeline.length > 0 ? (
                      booking.timeline.map((event, index: number) => (
                        <div key={event._id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary">
                              <Clock className="w-4 h-4" />
                            </div>
                            {booking.timeline && index < booking.timeline.length - 1 && <div className="w-0.5 h-8 bg-border mt-2" />}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {event.eventType}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="font-medium text-sm">
                              {event.location}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No timeline events available for this booking.</p>
                        <p className="text-sm mt-1">Timeline will appear here as the booking progresses.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Booking-related documents and files</CardDescription>
                    </div>
                    <Button onClick={handleDocumentUpload}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No documents available for this booking.</p>
                    <p className="text-sm mt-1">Upload documents to track important files.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Communication Log</CardTitle>
                  <CardDescription>Notes and messages related to this booking</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No communication log available for this booking.</p>
                    <p className="text-sm mt-1">Add notes and comments to track important updates.</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Add Note</Label>
                    <Textarea
                      placeholder="Add a note or comment about this booking..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
