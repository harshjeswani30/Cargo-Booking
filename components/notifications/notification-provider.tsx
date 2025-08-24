"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { Toast } from "./toast"

export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
  autoClose?: boolean
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  removeNotification: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [toasts, setToasts] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000,
    }

    setNotifications((prev) => [newNotification, ...prev])

    // Add to toasts for immediate display
    setToasts((prev) => [...prev, newNotification])

    // Auto-remove toast after duration
    if (newNotification.autoClose) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newNotification.id))
      }, newNotification.duration)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setToasts([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  // Remove simulated notifications - only show real user-generated notifications
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const randomEvents = [
  //       { type: "info" as const, title: "Flight Update", message: "Flight CX123 is on schedule" },
  //       { type: "success" as const, title: "Booking Confirmed", message: "Booking REF-789 has been confirmed" },
  //       { type: "warning" as const, title: "Weather Alert", message: "Possible delays due to weather conditions" },
  //       { type: "error" as const, title: "System Alert", message: "Temporary service disruption resolved" },
  //     ]

  //     if (Math.random() > 0.7) {
  //       // 30% chance every 30 seconds
  //       const event = randomEvents[Math.floor(Math.random() * randomEvents.length)]
  //       addNotification(event)
  //     }
  //   }, 30000)

  //   return () => clearInterval(interval)
  // }, [addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            notification={toast}
            onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
