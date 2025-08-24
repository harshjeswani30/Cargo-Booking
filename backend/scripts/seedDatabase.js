const mongoose = require("mongoose")
const Flight = require("../models/Flight")
const Booking = require("../models/Booking")
require("dotenv").config()

const airports = ["LAX", "JFK", "SFO", "NRT", "LHR", "CDG", "HKG", "SIN", "DEN", "ORD"]
const airlines = ["Cargo Express", "Global Freight", "Premium Air Cargo", "Swift Airlines", "Reliable Cargo"]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/cargoapp")
    console.log("Connected to MongoDB")

    // Clear existing data
    await Flight.deleteMany({})
    await Booking.deleteMany({})
    console.log("Cleared existing data")

    // Generate flights for the next 30 days
    const flights = []
    const startDate = new Date()

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)

      // Generate 20-30 flights per day
      const flightsPerDay = Math.floor(Math.random() * 11) + 20

      for (let i = 0; i < flightsPerDay; i++) {
        const origin = airports[Math.floor(Math.random() * airports.length)]
        let destination = airports[Math.floor(Math.random() * airports.length)]

        // Ensure origin and destination are different
        while (destination === origin) {
          destination = airports[Math.floor(Math.random() * airports.length)]
        }

        const airline = airlines[Math.floor(Math.random() * airlines.length)]
        const flightNumber = `${airline.substring(0, 2).toUpperCase()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

        // Random departure time between 6 AM and 10 PM
        const departureHour = Math.floor(Math.random() * 16) + 6
        const departureMinute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, 45

        const departureDateTime = new Date(currentDate)
        departureDateTime.setHours(departureHour, departureMinute, 0, 0)

        // Flight duration between 2-12 hours
        const durationHours = Math.floor(Math.random() * 11) + 2
        const arrivalDateTime = new Date(departureDateTime)
        arrivalDateTime.setHours(arrivalDateTime.getHours() + durationHours)

        flights.push({
          flightId: `${origin}-${destination}-${day}-${i}`,
          flightNumber,
          airlineName: airline,
          departureDateTime,
          arrivalDateTime,
          origin,
          destination,
        })
      }
    }

    await Flight.insertMany(flights)
    console.log(`✅ Created ${flights.length} flights`)

    // Create sample bookings
    const sampleBookings = []
    const statuses = ["BOOKED", "DEPARTED", "ARRIVED", "DELIVERED"]

    for (let i = 0; i < 50; i++) {
      const origin = airports[Math.floor(Math.random() * airports.length)]
      let destination = airports[Math.floor(Math.random() * airports.length)]

      while (destination === origin) {
        destination = airports[Math.floor(Math.random() * airports.length)]
      }

      const pieces = Math.floor(Math.random() * 10) + 1
      const weightKg = Math.floor(Math.random() * 5000) + 100
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      // Find a flight for this route
      const availableFlight = flights.find((f) => f.origin === origin && f.destination === destination)
      const flightIds = availableFlight ? [availableFlight.flightId] : []

      const booking = {
        origin,
        destination,
        pieces,
        weightKg,
        status,
        flightIds,
      }

      sampleBookings.push(booking)
    }

    await Booking.insertMany(sampleBookings)
    console.log(`✅ Created ${sampleBookings.length} sample bookings`)

    console.log("🎉 Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
