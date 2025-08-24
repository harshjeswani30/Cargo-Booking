const mongoose = require("mongoose")
const { logger } = require("./logger")
const { metricsCollector } = require("./metrics")

class SystemMonitor {
  constructor() {
    this.alerts = []
    this.thresholds = {
      responseTime: 1000, // ms
      errorRate: 0.05, // 5%
      memoryUsage: 0.85, // 85%
      dbConnectionTime: 500, // ms
    }

    // Start monitoring intervals
    this.startMonitoring()
  }

  startMonitoring() {
    // Check system health every 30 seconds
    setInterval(() => {
      this.checkSystemHealth()
    }, 30000)

    // Check database health every minute
    setInterval(() => {
      this.checkDatabaseHealth()
    }, 60000)

    // Clean old alerts every hour
    setInterval(() => {
      this.cleanOldAlerts()
    }, 3600000)
  }

  async checkSystemHealth() {
    try {
      const metrics = metricsCollector.getMetrics()
      const memUsage = process.memoryUsage()
      const memUsagePercent = memUsage.heapUsed / memUsage.heapTotal

      // Check response time
      if (metrics.computed.avgResponseTime > this.thresholds.responseTime) {
        this.createAlert("HIGH_RESPONSE_TIME", `Average response time: ${metrics.computed.avgResponseTime}ms`)
      }

      // Check error rate
      if (metrics.computed.errorRate > this.thresholds.errorRate) {
        this.createAlert("HIGH_ERROR_RATE", `Error rate: ${(metrics.computed.errorRate * 100).toFixed(2)}%`)
      }

      // Check memory usage
      if (memUsagePercent > this.thresholds.memoryUsage) {
        this.createAlert("HIGH_MEMORY_USAGE", `Memory usage: ${(memUsagePercent * 100).toFixed(2)}%`)
      }

      logger.info("System health check completed", {
        avgResponseTime: metrics.computed.avgResponseTime,
        errorRate: metrics.computed.errorRate,
        memoryUsage: memUsagePercent,
        uptime: metrics.computed.uptime,
      })
    } catch (error) {
      logger.error("System health check failed:", error)
      this.createAlert("HEALTH_CHECK_FAILED", error.message)
    }
  }

  async checkDatabaseHealth() {
    try {
      const start = Date.now()
      await mongoose.connection.db.admin().ping()
      const connectionTime = Date.now() - start

      if (connectionTime > this.thresholds.dbConnectionTime) {
        this.createAlert("SLOW_DB_CONNECTION", `Database connection time: ${connectionTime}ms`)
      }

      logger.info("Database health check completed", { connectionTime })
    } catch (error) {
      logger.error("Database health check failed:", error)
      this.createAlert("DATABASE_CONNECTION_FAILED", error.message)
    }
  }

  createAlert(type, message) {
    const alert = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type),
    }

    this.alerts.unshift(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }

    logger.warn(`ALERT [${type}]: ${message}`, alert)
  }

  getAlertSeverity(type) {
    const severityMap = {
      HIGH_RESPONSE_TIME: "medium",
      HIGH_ERROR_RATE: "high",
      HIGH_MEMORY_USAGE: "high",
      SLOW_DB_CONNECTION: "medium",
      DATABASE_CONNECTION_FAILED: "critical",
      HEALTH_CHECK_FAILED: "high",
    }
    return severityMap[type] || "low"
  }

  cleanOldAlerts() {
    const oneHourAgo = new Date(Date.now() - 3600000)
    this.alerts = this.alerts.filter((alert) => alert.timestamp > oneHourAgo)
    logger.info(`Cleaned old alerts, ${this.alerts.length} alerts remaining`)
  }

  getAlerts(severity = null) {
    if (severity) {
      return this.alerts.filter((alert) => alert.severity === severity)
    }
    return this.alerts
  }

  getSystemStatus() {
    const metrics = metricsCollector.getMetrics()
    const memUsage = process.memoryUsage()
    const criticalAlerts = this.getAlerts("critical")
    const highAlerts = this.getAlerts("high")

    return {
      status: criticalAlerts.length > 0 ? "critical" : highAlerts.length > 0 ? "warning" : "healthy",
      metrics: metrics.computed,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      database: {
        status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        queries: metrics.database.queries,
        avgQueryTime: metrics.computed.avgQueryTime,
        errors: metrics.database.errors,
      },
      alerts: {
        total: this.alerts.length,
        critical: criticalAlerts.length,
        high: highAlerts.length,
        recent: this.alerts.slice(0, 5),
      },
    }
  }
}

const systemMonitor = new SystemMonitor()

module.exports = { systemMonitor }
