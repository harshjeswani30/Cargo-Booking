const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")
const { logger } = require("../middleware/logger")
const { clearCache } = require("../middleware/cache")
const { withLock } = require("../middleware/locks")

router.post("/", withLock("booking-creation"), async (req, res) => {
  let lockInfo = null
  const queryStart = Date.now() // Added performance tracking

  try {
    lockInfo = await req.acquireLock()
    if (!lockInfo.acquired) {
      req.recordLockEvent(false) // Record lock failure
      return res.status(429).json({
        error: "System busy, please try again later",
      })
    }
    req.recordLockEvent(true) // Record lock success

    logger.info("Incoming booking request:", req.body)

    const { origin, destination, pieces, weightKg, flightIds } = req.body

    if (!origin || !destination || !pieces || !weightKg) {
      return res.status(400).json({
        error: "Missing required fields: origin, destination, pieces, weightKg",
      })
    }

    // Validate flightIds if provided
    if (flightIds && Array.isArray(flightIds) && flightIds.length > 0) {
      const Flight = require("../models/Flight")
      const validFlights = await Flight.find({ flightId: { $in: flightIds } })
      if (validFlights.length !== flightIds.length) {
        return res.status(400).json({ error: "One or more flight IDs are invalid" })
      }
    }

    const booking = new Booking({
      origin,
      destination,
      pieces: Number.parseInt(pieces),
      weightKg: Number.parseFloat(weightKg),
      status: "BOOKED",
      flightIds: flightIds || [],
    })

    await booking.save()
    req.recordDatabaseQuery(Date.now() - queryStart) // Record query time
    req.recordBookingEvent("created", "BOOKED") // Record booking event

    // Clear relevant caches
    clearCache("bookings")

    logger.info(`✅ New booking created: ${booking.refId}`)
    res.status(201).json(booking)
  } catch (error) {
    req.recordDatabaseError() // Record database error
    req.recordSystemError() // Record system error
    logger.error("🔥 Error creating booking:", error)
    res.status(500).json({
      error: "Failed to create booking",
      details: error.message,
    })
  } finally {
    // Always release the lock
    if (lockInfo && lockInfo.acquired) {
      await req.releaseLock(lockInfo.lockValue)
    }
  }
})

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 }).limit(100) // Performance optimization - limit results

    res.json(bookings)
  } catch (error) {
    logger.error("Error fetching all bookings:", error)
    res.status(500).json({ error: "Failed to fetch bookings" })
  }
})

// Get booking by reference ID
router.get("/:refId", async (req, res) => {
  try {
    const booking = await Booking.findOne({ refId: req.params.refId })

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    res.json(booking)
  } catch (error) {
    logger.error("Error fetching booking:", error)
    res.status(500).json({ error: "Failed to fetch booking" })
  }
})

router.patch("/:refId/depart", withLock("booking-update"), async (req, res) => {
  let lockInfo = null

  try {
    lockInfo = await req.acquireLock()
    if (!lockInfo.acquired) {
      return res.status(429).json({
        error: "System busy, please try again later",
      })
    }

    const { location, flightInfo } = req.body

    const booking = await Booking.findOne({ refId: req.params.refId })

    if (!booking) {
      logger.warn(`Booking not found: ${req.params.refId}`)
      return res.status(404).json({ error: "Booking not found" })
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Cannot update cancelled booking" })
    }

    booking.status = "DEPARTED"
    booking.timeline.push({
      eventType: "DEPARTED",
      location: location || booking.origin,
      flightInfo: flightInfo || "",
      notes: "Package departed",
    })

    await booking.save()

    // Clear relevant caches
    clearCache("bookings")
    clearCache(req.params.refId)

    logger.info(`Booking ${booking.refId} marked as DEPARTED`)
    res.json(booking)
  } catch (error) {
    logger.error("Error updating booking:", error)
    res.status(500).json({ error: "Failed to update booking" })
  } finally {
    if (lockInfo && lockInfo.acquired) {
      await req.releaseLock(lockInfo.lockValue)
    }
  }
})

router.patch("/:refId/arrive", withLock("booking-update"), async (req, res) => {
  let lockInfo = null

  try {
    lockInfo = await req.acquireLock()
    if (!lockInfo.acquired) {
      return res.status(429).json({
        error: "System busy, please try again later",
      })
    }

    const { location } = req.body

    const booking = await Booking.findOne({ refId: req.params.refId })

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Cannot update cancelled booking" })
    }

    booking.status = "ARRIVED"
    booking.timeline.push({
      eventType: "ARRIVED",
      location: location || booking.destination,
      notes: "Package arrived",
    })

    await booking.save()

    clearCache("bookings")
    clearCache(req.params.refId)

    logger.info(`Booking ${booking.refId} marked as ARRIVED`)
    res.json(booking)
  } catch (error) {
    logger.error("Error updating booking:", error)
    res.status(500).json({ error: "Failed to update booking" })
  } finally {
    if (lockInfo && lockInfo.acquired) {
      await req.releaseLock(lockInfo.lockValue)
    }
  }
})

router.patch("/:refId/deliver", withLock("booking-update"), async (req, res) => {
  let lockInfo = null

  try {
    lockInfo = await req.acquireLock()
    if (!lockInfo.acquired) {
      return res.status(429).json({
        error: "System busy, please try again later",
      })
    }

    const { location } = req.body

    const booking = await Booking.findOne({ refId: req.params.refId })

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Cannot update cancelled booking" })
    }

    if (booking.status !== "ARRIVED") {
      return res.status(400).json({ error: "Booking must be arrived before delivery" })
    }

    booking.status = "DELIVERED"
    booking.timeline.push({
      eventType: "DELIVERED",
      location: location || booking.destination,
      notes: "Package delivered successfully",
    })

    await booking.save()

    clearCache("bookings")
    clearCache(req.params.refId)

    logger.info(`Booking ${booking.refId} marked as DELIVERED`)
    res.json(booking)
  } catch (error) {
    logger.error("Error updating booking:", error)
    res.status(500).json({ error: "Failed to update booking" })
  } finally {
    if (lockInfo && lockInfo.acquired) {
      await req.releaseLock(lockInfo.lockValue)
    }
  }
})

router.patch("/:refId/cancel", withLock("booking-update"), async (req, res) => {
  let lockInfo = null

  try {
    lockInfo = await req.acquireLock()
    if (!lockInfo.acquired) {
      return res.status(429).json({
        error: "System busy, please try again later",
      })
    }

    const booking = await Booking.findOne({ refId: req.params.refId })

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    if (booking.status === "ARRIVED" || booking.status === "DELIVERED") {
      return res.status(400).json({
        error: "Cannot cancel booking that has already arrived or been delivered",
      })
    }

    booking.status = "CANCELLED"
    booking.timeline.push({
      eventType: "CANCELLED",
      location: booking.origin,
      notes: "Booking cancelled",
    })

    await booking.save()

    clearCache("bookings")
    clearCache(req.params.refId)

    logger.info(`Booking ${booking.refId} cancelled`)
    res.json(booking)
  } catch (error) {
    logger.error("Error cancelling booking:", error)
    res.status(500).json({ error: "Failed to cancel booking" })
  } finally {
    if (lockInfo && lockInfo.acquired) {
      await req.releaseLock(lockInfo.lockValue)
    }
  }
})

module.exports = router
