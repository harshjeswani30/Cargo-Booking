"use client"

import { useState } from "react"
import { Filter, Calendar, MapPin, Package, Plane, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface FilterState {
  status: string[]
  dateRange: { from?: Date; to?: Date }
  origin: string
  destination: string
  weightRange: { min: string; max: string }
  piecesRange: { min: string; max: string }
  airline: string[]
  priority: string[]
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

const statusOptions = [
  { value: "BOOKED", label: "Booked", color: "bg-blue-100 text-blue-800" },
  { value: "DEPARTED", label: "Departed", color: "bg-orange-100 text-orange-800" },
  { value: "ARRIVED", label: "Arrived", color: "bg-purple-100 text-purple-800" },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-800" },
]

const airlineOptions: string[] = [] // Will be populated from database when airlines API is implemented

const priorityOptions = [
  { value: "standard", label: "Standard" },
  { value: "priority", label: "Priority" },
  { value: "express", label: "Express" },
  { value: "critical", label: "Critical" },
]

export function AdvancedFilters({ onFiltersChange, className }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: {},
    origin: "",
    destination: "",
    weightRange: { min: "", max: "" },
    piecesRange: { min: "", max: "" },
    airline: [],
    priority: [],
  })

  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)

    // Count active filters
    let count = 0
    if (updated.status.length > 0) count++
    if (updated.dateRange.from || updated.dateRange.to) count++
    if (updated.origin) count++
    if (updated.destination) count++
    if (updated.weightRange.min || updated.weightRange.max) count++
    if (updated.piecesRange.min || updated.piecesRange.max) count++
    if (updated.airline.length > 0) count++
    if (updated.priority.length > 0) count++

    setActiveFiltersCount(count)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      status: [],
      dateRange: {},
      origin: "",
      destination: "",
      weightRange: { min: "", max: "" },
      piecesRange: { min: "", max: "" },
      airline: [],
      priority: [],
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setActiveFiltersCount(0)
  }

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status]
    updateFilters({ status: newStatus })
  }

  const toggleAirline = (airline: string) => {
    const newAirline = filters.airline.includes(airline)
      ? filters.airline.filter((a) => a !== airline)
      : [...filters.airline, airline]
    updateFilters({ airline: newAirline })
  }

  const togglePriority = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority]
    updateFilters({ priority: newPriority })
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filters.status.includes(option.value) ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  filters.status.includes(option.value) && option.color,
                )}
                onClick={() => toggleStatus(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range
          </Label>
          <DatePickerWithRange date={filters.dateRange} onDateChange={(dateRange) => updateFilters({ dateRange })} />
        </div>

        <Separator />

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Origin
            </Label>
            <Input
              placeholder="e.g., LAX"
              value={filters.origin}
              onChange={(e) => updateFilters({ origin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Input
              placeholder="e.g., JFK"
              value={filters.destination}
              onChange={(e) => updateFilters({ destination: e.target.value })}
            />
          </div>
        </div>

        <Separator />

        {/* Weight Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4" />
            Weight Range (kg)
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Min weight"
              type="number"
              value={filters.weightRange.min}
              onChange={(e) =>
                updateFilters({
                  weightRange: { ...filters.weightRange, min: e.target.value },
                })
              }
            />
            <Input
              placeholder="Max weight"
              type="number"
              value={filters.weightRange.max}
              onChange={(e) =>
                updateFilters({
                  weightRange: { ...filters.weightRange, max: e.target.value },
                })
              }
            />
          </div>
        </div>

        {/* Pieces Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Number of Pieces</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Min pieces"
              type="number"
              value={filters.piecesRange.min}
              onChange={(e) =>
                updateFilters({
                  piecesRange: { ...filters.piecesRange, min: e.target.value },
                })
              }
            />
            <Input
              placeholder="Max pieces"
              type="number"
              value={filters.piecesRange.max}
              onChange={(e) =>
                updateFilters({
                  piecesRange: { ...filters.piecesRange, max: e.target.value },
                })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Airline Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Airlines
          </Label>
          <div className="space-y-2">
            {airlineOptions.map((airline) => (
              <div key={airline} className="flex items-center space-x-2">
                <Checkbox
                  id={airline}
                  checked={filters.airline.includes(airline)}
                  onCheckedChange={() => toggleAirline(airline)}
                />
                <Label htmlFor={airline} className="text-sm font-normal cursor-pointer">
                  {airline}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Priority Level</Label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <Badge
                key={option.value}
                variant={filters.priority.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => togglePriority(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
