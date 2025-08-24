const express = require("express")
const router = express.Router()
const { metricsCollector } = require("../middleware/metrics")
const { systemMonitor } = require("../middleware/monitoring")
const { logger } = require("../middleware/logger")

// Get comprehensive system metrics
router.get("/metrics", (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics()
    res.json(metrics)
  } catch (error) {
    logger.error("Error fetching metrics:", error)
    res.status(500).json({ error: "Failed to fetch metrics" })
  }
})

// Get system status and health
router.get("/status", (req, res) => {
  try {
    const status = systemMonitor.getSystemStatus()
    res.json(status)
  } catch (error) {
    logger.error("Error fetching system status:", error)
    res.status(500).json({ error: "Failed to fetch system status" })
  }
})

// Get alerts
router.get("/alerts", (req, res) => {
  try {
    const { severity } = req.query
    const alerts = systemMonitor.getAlerts(severity)
    res.json(alerts)
  } catch (error) {
    logger.error("Error fetching alerts:", error)
    res.status(500).json({ error: "Failed to fetch alerts" })
  }
})

// Performance dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics()
    const status = systemMonitor.getSystemStatus()

    // Get booking statistics from database
    const Booking = require("../models/Booking")
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const dashboard = {
      overview: {
        totalRequests: metrics.requests.total,
        avgResponseTime: metrics.computed.avgResponseTime,
        errorRate: metrics.computed.errorRate,
        uptime: metrics.computed.uptime,
        requestsPerSecond: metrics.computed.requestsPerSecond,
      },
      system: status,
      bookings: {
        created: metrics.bookings.created,
        updated: metrics.bookings.updated,
        cancelled: metrics.bookings.cancelled,
        byStatus: bookingStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count
          return acc
        }, {}),
      },
      performance: {
        database: {
          queries: metrics.database.queries,
          avgQueryTime: metrics.computed.avgQueryTime,
          errors: metrics.database.errors,
        },
        locks: {
          acquisitions: metrics.system.lockAcquisitions,
          failures: metrics.system.lockFailures,
          successRate: metrics.computed.lockSuccessRate,
        },
      },
    }

    res.json(dashboard)
  } catch (error) {
    logger.error("Error fetching dashboard data:", error)
    res.status(500).json({ error: "Failed to fetch dashboard data" })
  }
})

module.exports = router
