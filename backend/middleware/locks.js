const redis = require("redis")
const { logger } = require("./logger")

class DistributedLock {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    })

    this.client.on("error", (err) => {
      logger.error("Redis Client Error", err)
    })

    this.client.connect().catch((err) => {
      logger.error("Redis Connection Error", err)
    })
  }

  async acquireLock(resource, ttl = 10000) {
    const lockKey = `lock:${resource}`
    const lockValue = `${Date.now()}-${Math.random()}`

    try {
      const result = await this.client.set(lockKey, lockValue, {
        PX: ttl, // TTL in milliseconds
        NX: true, // Only set if key doesn't exist
      })

      if (result === "OK") {
        logger.info(`Lock acquired for resource: ${resource}`)
        return { acquired: true, lockValue }
      }

      return { acquired: false }
    } catch (error) {
      logger.error("Error acquiring lock:", error)
      return { acquired: false }
    }
  }

  async releaseLock(resource, lockValue) {
    const lockKey = `lock:${resource}`

    try {
      // Lua script to ensure we only delete our own lock
      const luaScript = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `

      const result = await this.client.eval(luaScript, {
        keys: [lockKey],
        arguments: [lockValue],
      })

      if (result === 1) {
        logger.info(`Lock released for resource: ${resource}`)
        return true
      }

      return false
    } catch (error) {
      logger.error("Error releasing lock:", error)
      return false
    }
  }
}

const distributedLock = new DistributedLock()

const withLock = (resource, ttl = 10000) => {
  return (req, res, next) => {
    req.acquireLock = () => distributedLock.acquireLock(resource, ttl)
    req.releaseLock = (lockValue) => distributedLock.releaseLock(resource, lockValue)
    next()
  }
}

module.exports = { distributedLock, withLock }
