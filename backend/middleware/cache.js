const NodeCache = require("node-cache")

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
})

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl
    const cachedResponse = cache.get(key)

    if (cachedResponse) {
      return res.json(cachedResponse)
    }

    // Override res.json to cache the response
    const originalJson = res.json
    res.json = function (data) {
      cache.set(key, data, duration)
      originalJson.call(this, data)
    }

    next()
  }
}

const clearCache = (pattern) => {
  const keys = cache.keys()
  keys.forEach((key) => {
    if (key.includes(pattern)) {
      cache.del(key)
    }
  })
}

module.exports = { cache, cacheMiddleware, clearCache }
