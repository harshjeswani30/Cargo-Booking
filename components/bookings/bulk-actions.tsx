"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CheckSquare, Download, Mail, FileText, Edit, Package } from "lucide-react"
import { useNotifications } from "@/components/notifications/notification-provider"

interface BulkActionsProps {
  selectedBookings: string[]
  onClearSelection: () => void
  onBulkAction: (action: string, bookings: string[]) => void
}

export function BulkActions({ selectedBookings, onClearSelection, onBulkAction }: BulkActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedAction, setSelectedAction] = useState("")
  const { addNotification } = useNotifications()

  if (selectedBookings.length === 0) return null

  const handleBulkAction = (action: string) => {
    onBulkAction(action, selectedBookings)

    let message = ""
    switch (action) {
      case "export":
        message = `Exporting ${selectedBookings.length} bookings...`
        break
      case "email":
        message = `Sending notifications for ${selectedBookings.length} bookings...`
        break
      case "status-update":
        message = `Updating status for ${selectedBookings.length} bookings...`
        break
      case "generate-report":
        message = `Generating report for ${selectedBookings.length} bookings...`
        break
      default:
        message = `Processing ${selectedBookings.length} bookings...`
    }

    addNotification({
      type: "info",
      title: "Bulk Action Started",
      message,
    })

    setIsDialogOpen(false)
    onClearSelection()
  }

  const bulkActions = [
    {
      id: "export",
      label: "Export to CSV",
      icon: Download,
      description: "Download selected bookings as CSV file",
    },
    {
      id: "email",
      label: "Send Notifications",
      icon: Mail,
      description: "Send status updates to clients",
    },
    {
      id: "status-update",
      label: "Update Status",
      icon: Edit,
      description: "Change status for all selected bookings",
    },
    {
      id: "generate-report",
      label: "Generate Report",
      icon: FileText,
      description: "Create detailed report for selected bookings",
    },
  ]

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg">
      <div className="flex items-center gap-2">
        <CheckSquare className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedBookings.length} booking{selectedBookings.length !== 1 ? "s" : ""} selected
        </span>
      </div>

      <Separator orientation="vertical" className="h-6" />

      <div className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Package className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Actions</DialogTitle>
              <DialogDescription>
                Choose an action to perform on {selectedBookings.length} selected booking
                {selectedBookings.length !== 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {bulkActions.map((action) => {
                const Icon = action.icon
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleBulkAction(action.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{action.label}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Execute
                    </Button>
                  </div>
                )
              })}
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  )
}
