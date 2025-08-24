const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
require("dotenv").config()

const { logger, requestLogger } = require("./middleware/logger")
const { metricsMiddleware } = require("./middleware/metrics")

const app = express()

// Security and middleware
app.use(helmet())
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(requestLogger)
app.use(metricsMiddleware)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})
app.use("/api/", limiter)

// MongoDB connection with enhanced error handling
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cargoapp", {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    logger.info("✅ Connected to MongoDB")
  })
  .catch((err) => {
    logger.error("❌ MongoDB connection error:", err)
    process.exit(1)
  })

// Enable query logging in development
if (process.env.NODE_ENV === "development") {
  mongoose.set("debug", (collectionName, method, query, doc) => {
    logger.debug(`MongoDB Query: ${collectionName}.${method}`, { query, doc })
  })
}

// API Routes
app.use("/api/bookings", require("./routes/bookings"))
app.use("/api/flights", require("./routes/flights"))
app.use("/api/monitoring", require("./routes/monitoring"))

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Air Cargo Booking & Tracking API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      bookings: "/api/bookings",
      flights: "/api/flights",
      monitoring: "/api/monitoring",
      health: "/api/health",
    },
  })
})

// Enhanced health check
app.get("/api/health", async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

    // Check database response time
    const start = Date.now()
    await mongoose.connection.db.admin().ping()
    const dbResponseTime = Date.now() - start

    const healthData = {
      status: "OK",
      message: "Air Cargo API is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      },
      environment: process.env.NODE_ENV || "development",
    }

    res.json(healthData)
  } catch (error) {
    logger.error("Health check failed:", error)
    res.status(500).json({
      status: "ERROR",
      message: "Health check failed",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Global error handler
app.use((error, req, res, next) => {
  logger.error("Unhandled error:", error)

  // Don't leak error details in production
  const errorResponse = {
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  }

  res.status(500).json(errorResponse)
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: ["/api/bookings", "/api/flights", "/api/monitoring", "/api/health"],
  })
})

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`)
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`)

  server.close(() => {
    logger.info("HTTP server closed")

    mongoose.connection.close(() => {
      logger.info("MongoDB connection closed")
      process.exit(0)
    })
  })

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down")
    process.exit(1)
  }, 10000)
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

module.exports = app
