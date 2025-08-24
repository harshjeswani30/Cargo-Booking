import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

const airports = ["LAX", "JFK", "SFO", "NRT", "LHR", "CDG", "HKG", "SIN", "DEN", "ORD"];
const airlines = ["Cargo Express", "Global Freight", "Premium Air Cargo", "Swift Airlines", "Reliable Cargo"];

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    const { default: BookingModel } = await import('../lib/models/Booking.js');
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    const { default: ClientModel } = await import('../lib/models/Client.js');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await FlightModel.deleteMany({});
    await BookingModel.deleteMany({});
    await AirportModel.deleteMany({});
    await ClientModel.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed airports first
    console.log('✈️ Seeding airports...');
    const airportData = airports.map(code => ({
      code,
      name: `${code} International Airport`,
      city: getCityName(code),
      country: getCountryName(code),
      timezone: getTimezone(code),
      isActive: true
    }));

    await AirportModel.insertMany(airportData);
    console.log(`✅ Created ${airportData.length} airports`);

    // Generate flights for the next 30 days
    console.log('🛫 Generating flights...');
    const flights = [];
    const startDate = new Date();

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + day);

      // Generate 20-30 flights per day
      const flightsPerDay = Math.floor(Math.random() * 11) + 20;

      for (let i = 0; i < flightsPerDay; i++) {
        const origin = airports[Math.floor(Math.random() * airports.length)];
        let destination = airports[Math.floor(Math.random() * airports.length)];

        // Ensure origin and destination are different
        while (destination === origin) {
          destination = airports[Math.floor(Math.random() * airports.length)];
        }

        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const flightNumber = `${airline.substring(0, 2).toUpperCase()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

        // Random departure time between 6 AM and 10 PM
        const departureHour = Math.floor(Math.random() * 16) + 6;
        const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

        const departureDateTime = new Date(currentDate);
        departureDateTime.setHours(departureHour, departureMinute, 0, 0);

        // Flight duration between 2-12 hours
        const durationHours = Math.floor(Math.random() * 11) + 2;
        const arrivalDateTime = new Date(departureDateTime);
        arrivalDateTime.setHours(arrivalDateTime.getHours() + durationHours);

        // Random capacity and available space
        const capacity = Math.floor(Math.random() * 200) + 100;
        const availableSpace = Math.floor(Math.random() * capacity * 0.3) + Math.floor(capacity * 0.7);

        flights.push({
          flightId: `${origin}-${destination}-${day}-${i}`,
          flightNumber,
          airlineName: airline,
          departureDateTime,
          arrivalDateTime,
          origin,
          destination,
          aircraftType: getRandomAircraft(),
          capacity,
          availableSpace,
          status: 'SCHEDULED'
        });
      }
    }

    await FlightModel.insertMany(flights);
    console.log(`✅ Created ${flights.length} flights`);

    // Create sample bookings
    console.log('📦 Creating sample bookings...');
    const sampleBookings = [];
    const statuses = ["BOOKED", "DEPARTED", "ARRIVED", "DELIVERED"];

    for (let i = 0; i < 50; i++) {
      const origin = airports[Math.floor(Math.random() * airports.length)];
      let destination = airports[Math.floor(Math.random() * airports.length)];

      while (destination === origin) {
        destination = airports[Math.floor(Math.random() * airports.length)];
      }

      const pieces = Math.floor(Math.random() * 10) + 1;
      const weightKg = Math.floor(Math.random() * 5000) + 100;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Find a flight for this route
      const availableFlight = flights.find((f) => f.origin === origin && f.destination === destination);
      const flightIds = availableFlight ? [availableFlight.flightId] : [];

      const booking = {
        origin,
        destination,
        pieces,
        weightKg,
        status,
        flightIds,
      };

      sampleBookings.push(booking);
    }

    await BookingModel.insertMany(sampleBookings);
    console.log(`✅ Created ${sampleBookings.length} sample bookings`);

    // No mock clients - real client system is now in place
    console.log('👥 Skipping mock clients - real client system is active');
    console.log('   - Existing booking is linked to "Hong Kong Express Cargo"');
    console.log('   - All new bookings require client selection from form');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Database now contains:`);
    console.log(`   - ${airportData.length} airports`);
    console.log(`   - ${flights.length} flights`);
    console.log(`   - ${sampleBookings.length} bookings`);
    console.log(`   - 0 mock clients (real client system active)`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Helper functions
function getCityName(code) {
  const cityMap = {
    'LAX': 'Los Angeles', 'JFK': 'New York', 'SFO': 'San Francisco', 'NRT': 'Tokyo',
    'LHR': 'London', 'CDG': 'Paris', 'HKG': 'Hong Kong', 'SIN': 'Singapore',
    'DEN': 'Denver', 'ORD': 'Chicago'
  };
  return cityMap[code] || code;
}

function getCountryName(code) {
  const countryMap = {
    'LAX': 'USA', 'JFK': 'USA', 'SFO': 'USA', 'NRT': 'Japan',
    'LHR': 'UK', 'CDG': 'France', 'HKG': 'China', 'SIN': 'Singapore',
    'DEN': 'USA', 'ORD': 'USA'
  };
  return countryMap[code] || 'Unknown';
}

function getTimezone(code) {
  const timezoneMap = {
    'LAX': 'America/Los_Angeles', 'JFK': 'America/New_York', 'SFO': 'America/Los_Angeles',
    'NRT': 'Asia/Tokyo', 'LHR': 'Europe/London', 'CDG': 'Europe/Paris',
    'HKG': 'Asia/Hong_Kong', 'SIN': 'Asia/Singapore', 'DEN': 'America/Denver', 'ORD': 'America/Chicago'
  };
  return timezoneMap[code] || 'UTC';
}

function getRandomAircraft() {
  const aircraft = ['Boeing 737', 'Boeing 787', 'Airbus A320', 'Airbus A350', 'Boeing 777'];
  return aircraft[Math.floor(Math.random() * aircraft.length)];
}

seedDatabase();
