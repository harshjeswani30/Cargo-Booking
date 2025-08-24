"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Clock, Package, Plane, Users, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  type: "booking" | "flight" | "client"
  title: string
  subtitle: string
  description: string
  status?: string
  url: string
}

interface SearchHistory {
  query: string
  timestamp: Date
  results: number
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Fetch real search data from backend
  const fetchSearchResults = async (searchQuery: string) => {
    try {
      setLoading(true)
      
      // Fetch bookings that match the search query
      const bookingsResponse = await fetch(`/api/bookings`)
      let bookings: any[] = []
      
      if (bookingsResponse.ok) {
        bookings = await bookingsResponse.json()
      }
      
      // Fetch flights that match the search query
      const flightsResponse = await fetch(`/api/flights`)
      let flights: any[] = []
      
      if (flightsResponse.ok) {
        flights = await flightsResponse.json()
      }
      
      // Filter and transform results
      const filteredBookings = bookings
        .filter((booking) =>
          booking.refId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.destination.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((booking) => ({
          id: booking._id,
          type: "booking" as const,
          title: booking.refId,
          subtitle: `${booking.origin} → ${booking.destination}`,
          description: `${booking.pieces} pieces, ${booking.weightKg} kg`,
          status: booking.status,
          url: `/bookings/${booking.refId}`,
        }))
      
      const filteredFlights = flights
        .filter((flight) =>
          flight.flightId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flight.destination.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((flight) => ({
          id: flight._id,
          type: "flight" as const,
          title: flight.flightId,
          subtitle: flight.airlineName,
          description: `${flight.origin} → ${flight.destination}, ${new Date(flight.departureDateTime).toLocaleDateString()}`,
          status: "ON_TIME",
          url: `/flights/${flight.flightId}`,
        }))
      
      // Combine results
      const allResults = [...filteredBookings, ...filteredFlights]
      setResults(allResults)
      
    } catch (error) {
      console.error('Error fetching search results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem("searchHistory")
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true)
      // Simulate API delay
      const timer = setTimeout(() => {
        fetchSearchResults(query)
        setSelectedIndex(-1)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      setResults([])
      setSelectedIndex(-1)
    }
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      const newHistoryItem: SearchHistory = {
        query: searchQuery,
        timestamp: new Date(),
        results: results.length,
      }

      const updatedHistory = [newHistoryItem, ...searchHistory.slice(0, 9)]
      setSearchHistory(updatedHistory)
      localStorage.setItem("searchHistory", JSON.stringify(updatedHistory))
    }
  }

  const handleResultClick = (result: SearchResult) => {
    handleSearch(query)
    setIsOpen(false)
    setQuery("")
    router.push(result.url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    } else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Package className="w-4 h-4" />
      case "flight":
        return <Plane className="w-4 h-4" />
      case "client":
        return <Users className="w-4 h-4" />
      default:
        return <Search className="w-4 h-4" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "DEPARTED":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "ON_TIME":
        return "bg-green-100 text-green-800 border-green-200"
      case "DELAYED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Search Everything</DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search bookings, flights, clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setQuery("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {loading && (
            <div className="p-6 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!loading && query.length > 2 && results.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="p-2">
              <div className="px-4 py-2 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </div>
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      selectedIndex === index ? "bg-muted" : "hover:bg-muted/50",
                    )}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">{getResultIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{result.title}</h4>
                          {result.status && (
                            <Badge className={cn("text-xs", getStatusColor(result.status))}>{result.status}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length <= 2 && searchHistory.length > 0 && (
            <div className="p-2">
              <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent searches
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setQuery(item.query)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{item.query}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.results} results</span>
                        <span>•</span>
                        <span>{item.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-4 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Advanced
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
