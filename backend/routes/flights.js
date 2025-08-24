const express = require("express")
const router = express.Router()
const Flight = require("../models/Flight")
const { logger } = require("../middleware/logger")
const { cacheMiddleware } = require("../middleware/cache")

// Get routes (direct and 1-transit)
router.get("/routes", cacheMiddleware(180), async (req, res) => {
  try {
    const { origin, destination, departureDate } = req.query

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: "Missing required parameters: origin, destination, departureDate",
      })
    }

    logger.info(`Route search: ${origin} -> ${destination} on ${departureDate}`)

    const searchDate = new Date(departureDate)
    const nextDay = new Date(searchDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Find direct flights with performance optimization
    const directFlights = await Flight.find({
      origin: origin,
      destination: destination,
      departureDateTime: {
        $gte: searchDate,
        $lt: nextDay,
      },
    })
      .sort({ departureDateTime: 1 })
      .limit(20) // Performance optimization
      .lean() // Performance optimization - return plain objects

    // Find 1-transit routes with optimized queries
    const transitRoutes = []

    const firstHopFlights = await Flight.find({
      origin: origin,
      destination: { $ne: destination },
      departureDateTime: {
        $gte: searchDate,
        $lt: nextDay,
      },
    })
      .limit(50) // Performance optimization
      .lean()

    for (const firstFlight of firstHopFlights) {
      const connectingDate = new Date(firstFlight.arrivalDateTime)
      const connectingNextDay = new Date(connectingDate)
      connectingNextDay.setDate(connectingNextDay.getDate() + 2)

      const secondHopFlights = await Flight.find({
        origin: firstFlight.destination,
        destination: destination,
        departureDateTime: {
          $gte: firstFlight.arrivalDateTime,
          $lt: connectingNextDay,
        },
      })
        .limit(10) // Performance optimization
        .lean()

      secondHopFlights.forEach((secondFlight) => {
        transitRoutes.push({
          firstFlight: firstFlight,
          secondFlight: secondFlight,
          totalDuration: new Date(secondFlight.arrivalDateTime) - new Date(firstFlight.departureDateTime),
        })
      })
    }

    transitRoutes.sort((a, b) => a.totalDuration - b.totalDuration)

    logger.info(`Found ${directFlights.length} direct flights and ${transitRoutes.length} transit routes`)

    res.json({
      directFlights,
      transitRoutes: transitRoutes.slice(0, 5),
    })
  } catch (error) {
    logger.error("Error fetching routes:", error)
    res.status(500).json({ error: "Failed to fetch routes" })
  }
})

// Create a new flight (for admin/testing)
router.post("/", async (req, res) => {
  try {
    const flight = new Flight(req.body)
    await flight.save()
    logger.info(`New flight created: ${flight.flightId}`)
    res.status(201).json(flight)
  } catch (error) {
    logger.error("Error creating flight:", error)
    res.status(500).json({ error: "Failed to create flight" })
  }
})

// Get all flights (for admin/testing)
router.get("/", cacheMiddleware(300), async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departureDateTime: 1 }).limit(100).lean() // Performance optimization
    res.json(flights)
  } catch (error) {
    logger.error("Error fetching flights:", error)
    res.status(500).json({ error: "Failed to fetch flights" })
  }
})

// Get all unique airports from the database
router.get("/airports", cacheMiddleware(600), async (req, res) => {
  try {
    // Get unique origins and destinations
    const origins = await Flight.distinct("origin")
    const destinations = await Flight.distinct("destination")
    
    // Combine and remove duplicates
    const allAirports = [...new Set([...origins, ...destinations])].sort()
    
    // Airport code to city mapping
    const airportCityMap = {
      'DEL': 'Delhi, India',
      'BOM': 'Mumbai, India', 
      'BLR': 'Bangalore, India',
      'MAA': 'Chennai, India',
      'HYD': 'Hyderabad, India',
      'CCU': 'Kolkata, India',
      'JFK': 'New York, NY, USA',
      'LAX': 'Los Angeles, CA, USA',
      'SFO': 'San Francisco, CA, USA',
      'ORD': 'Chicago, IL, USA',
      'DFW': 'Dallas, TX, USA',
      'ATL': 'Atlanta, GA, USA',
      'NRT': 'Tokyo, Japan',
      'LHR': 'London, UK',
      'CDG': 'Paris, France',
      'HKG': 'Hong Kong',
      'SIN': 'Singapore',
      'DEN': 'Denver, CO, USA'
    }
    
    // Create airport details with city information
    const airportDetails = allAirports.map(airportCode => ({
      code: airportCode,
      city: airportCityMap[airportCode] || `${airportCode}, Unknown`,
      country: airportCityMap[airportCode]?.includes(', USA') ? 'USA' : 
               airportCityMap[airportCode]?.includes(', India') ? 'India' :
               airportCityMap[airportCode]?.includes(', UK') ? 'UK' :
               airportCityMap[airportCode]?.includes(', Japan') ? 'Japan' :
               airportCityMap[airportCode]?.includes(', France') ? 'France' : 'Unknown'
    }))
    
    logger.info(`Found ${airportDetails.length} unique airports`)
    res.json(airportDetails)
  } catch (error) {
    logger.error("Error fetching airports:", error)
    res.status(500).json({ error: "Failed to fetch airports" })
  }
})

module.exports = router
