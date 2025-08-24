"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Navigation } from "@/components/navigation"
import {
  Moon,
  Sun,
  Monitor,
  Bell,
  Shield,
  Database,
  Palette,
  Volume2,
  Mail,
  Smartphone,
  Save,
  RotateCcw,
} from "lucide-react"

interface UserSettings {
  theme: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    bookingUpdates: boolean
    flightAlerts: boolean
    systemMaintenance: boolean
  }
  display: {
    language: string
    timezone: string
    dateFormat: string
    currency: string
  }
  privacy: {
    analytics: boolean
    marketing: boolean
    dataSharing: boolean
  }
  performance: {
    autoRefresh: boolean
    refreshInterval: number
    cacheEnabled: boolean
  }
}

const defaultSettings: UserSettings = {
  theme: "system",
  notifications: {
    email: true,
    push: true,
    sms: false,
    bookingUpdates: true,
    flightAlerts: true,
    systemMaintenance: true,
  },
  display: {
    language: "en",
    timezone: "UTC",
    dateFormat: "DD/MM/YYYY",
    currency: "USD",
  },
  privacy: {
    analytics: true,
    marketing: false,
    dataSharing: false,
  },
  performance: {
    autoRefresh: true,
    refreshInterval: 30,
    cacheEnabled: true,
  },
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("cargoBookingSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const updateSetting = (path: string, value: any) => {
    setSettings((prev) => {
      const newSettings = { ...prev }
      const keys = path.split(".")
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      return newSettings
    })
    setHasChanges(true)
  }

  const saveSettings = () => {
    localStorage.setItem("cargoBookingSettings", JSON.stringify(settings))
    setHasChanges(false)
    // Show success notification
    console.log("[v0] Settings saved successfully")
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setTheme("system")
    setHasChanges(true)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your cargo booking experience</p>
        </div>

        <div className="grid gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={theme === value ? "default" : "outline"}
                      onClick={() => setTheme(value)}
                      className="justify-start gap-2 h-12"
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value) => updateSetting("display.language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select
                    value={settings.display.timezone}
                    onValueChange={(value) => updateSetting("display.timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <Label>Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting("notifications.email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateSetting("notifications.push", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <Label>SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Text message alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => updateSetting("notifications.sms", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Types</h4>
                {[
                  { key: "bookingUpdates", label: "Booking Updates", desc: "Status changes and confirmations" },
                  { key: "flightAlerts", label: "Flight Alerts", desc: "Delays, cancellations, and schedule changes" },
                  { key: "systemMaintenance", label: "System Maintenance", desc: "Planned downtime and updates" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>{label}</Label>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={settings.notifications[key as keyof typeof settings.notifications] as boolean}
                      onCheckedChange={(checked) => updateSetting(`notifications.${key}`, checked)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Control your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "analytics", label: "Analytics", desc: "Help improve the platform with usage data" },
                { key: "marketing", label: "Marketing Communications", desc: "Receive promotional emails and updates" },
                { key: "dataSharing", label: "Data Sharing", desc: "Share anonymized data with partners" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>{label}</Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={settings.privacy[key as keyof typeof settings.privacy]}
                    onCheckedChange={(checked) => updateSetting(`privacy.${key}`, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Performance
              </CardTitle>
              <CardDescription>Optimize system performance and data usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh data</p>
                </div>
                <Switch
                  checked={settings.performance.autoRefresh}
                  onCheckedChange={(checked) => updateSetting("performance.autoRefresh", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Refresh Interval (seconds)</Label>
                <Select
                  value={settings.performance.refreshInterval.toString()}
                  onValueChange={(value) => updateSetting("performance.refreshInterval", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Caching</Label>
                  <p className="text-sm text-muted-foreground">Cache data for faster loading</p>
                </div>
                <Switch
                  checked={settings.performance.cacheEnabled}
                  onCheckedChange={(checked) => updateSetting("performance.cacheEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-6">
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                >
                  Unsaved Changes
                </Badge>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
              <Button onClick={saveSettings} disabled={!hasChanges}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
