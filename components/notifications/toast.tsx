"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Notification } from "./notification-provider"

interface ToastProps {
  notification: Notification
  onClose: () => void
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    iconClassName: "text-green-600 dark:text-green-400",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
    iconClassName: "text-red-600 dark:text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    iconClassName: "text-blue-600 dark:text-blue-400",
  },
}

export function Toast({ notification, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const config = typeConfig[notification.type]
  const Icon = config.icon

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10)

    // Auto close
    if (notification.autoClose) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.autoClose, notification.duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <Card
      className={cn(
        "p-4 shadow-lg transition-all duration-300 transform",
        config.className,
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconClassName)} />

        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>

          {notification.action && (
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={notification.action.onClick}>
              {notification.action.label}
            </Button>
          )}
        </div>

        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background/50" onClick={handleClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
