const { logger } = require("./logger")

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        byEndpoint: {},
        byStatus: {},
        responseTimeSum: 0,
        responseTimeCount: 0,
      },
      bookings: {
        created: 0,
        updated: 0,
        cancelled: 0,
        byStatus: {
          BOOKED: 0,
          DEPARTED: 0,
          ARRIVED: 0,
          DELIVERED: 0,
          CANCELLED: 0,
        },
      },
      database: {
        queries: 0,
        queryTimeSum: 0,
        errors: 0,
      },
      system: {
        startTime: Date.now(),
        errors: 0,
        lockAcquisitions: 0,
        lockFailures: 0,
      },
    }

    // Reset metrics every hour
    setInterval(
      () => {
        this.resetHourlyMetrics()
      },
      60 * 60 * 1000,
    )
  }

  recordRequest(method, path, statusCode, responseTime) {
    this.metrics.requests.total++

    const endpoint = `${method} ${path}`
    this.metrics.requests.byEndpoint[endpoint] = (this.metrics.requests.byEndpoint[endpoint] || 0) + 1
    this.metrics.requests.byStatus[statusCode] = (this.metrics.requests.byStatus[statusCode] || 0) + 1

    this.metrics.requests.responseTimeSum += responseTime
    this.metrics.requests.responseTimeCount++
  }

  recordBookingEvent(eventType, status = null) {
    switch (eventType) {
      case "created":
        this.metrics.bookings.created++
        break
      case "updated":
        this.metrics.bookings.updated++
        break
      case "cancelled":
        this.metrics.bookings.cancelled++
        break
    }

    if (status) {
      this.metrics.bookings.byStatus[status] = (this.metrics.bookings.byStatus[status] || 0) + 1
    }
  }

  recordDatabaseQuery(queryTime) {
    this.metrics.database.queries++
    this.metrics.database.queryTimeSum += queryTime
  }

  recordDatabaseError() {
    this.metrics.database.errors++
  }

  recordSystemError() {
    this.metrics.system.errors++
  }

  recordLockEvent(success) {
    if (success) {
      this.metrics.system.lockAcquisitions++
    } else {
      this.metrics.system.lockFailures++
    }
  }

  getMetrics() {
    const uptime = Date.now() - this.metrics.system.startTime
    const avgResponseTime =
      this.metrics.requests.responseTimeCount > 0
        ? this.metrics.requests.responseTimeSum / this.metrics.requests.responseTimeCount
        : 0
    const avgQueryTime =
      this.metrics.database.queries > 0 ? this.metrics.database.queryTimeSum / this.metrics.database.queries : 0

    return {
      ...this.metrics,
      computed: {
        uptime,
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        avgQueryTime: Math.round(avgQueryTime * 100) / 100,
        requestsPerSecond: this.metrics.requests.total / (uptime / 1000),
        errorRate: this.metrics.system.errors / this.metrics.requests.total || 0,
        lockSuccessRate:
          this.metrics.system.lockAcquisitions /
            (this.metrics.system.lockAcquisitions + this.metrics.system.lockFailures) || 1,
      },
    }
  }

  resetHourlyMetrics() {
    // Reset counters but keep cumulative data
    this.metrics.requests.byEndpoint = {}
    this.metrics.requests.byStatus = {}
    logger.info("Hourly metrics reset completed")
  }
}

const metricsCollector = new MetricsCollector()

// Middleware to collect request metrics
const metricsMiddleware = (req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const responseTime = Date.now() - start
    metricsCollector.recordRequest(req.method, req.route?.path || req.path, res.statusCode, responseTime)
  })

  // Add metrics recording functions to request object
  req.recordBookingEvent = (eventType, status) => metricsCollector.recordBookingEvent(eventType, status)
  req.recordDatabaseQuery = (queryTime) => metricsCollector.recordDatabaseQuery(queryTime)
  req.recordDatabaseError = () => metricsCollector.recordDatabaseError()
  req.recordSystemError = () => metricsCollector.recordSystemError()
  req.recordLockEvent = (success) => metricsCollector.recordLockEvent(success)

  next()
}

module.exports = { metricsCollector, metricsMiddleware }
