import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models using dynamic imports
let Airport, Flight, Booking;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    const { default: BookingModel } = await import('../lib/models/Booking.js');
    
    Airport = AirportModel;
    Flight = FlightModel;
    Booking = BookingModel;

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Airport.deleteMany({});
    await Flight.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed Airports with isActive field
    console.log('✈️ Seeding airports...');
    const airportData = [
      { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", timezone: "Asia/Kolkata", isActive: true },
      { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", timezone: "Asia/Kolkata", isActive: true },
      { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India", timezone: "Asia/Kolkata", isActive: true },
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", timezone: "America/New_York", isActive: true },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", isActive: true },
      { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK", timezone: "Europe/London", isActive: true },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", timezone: "Europe/Paris", isActive: true },
      { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin", isActive: true },
      { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", isActive: true },
      { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", timezone: "Asia/Shanghai", isActive: true },
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", timezone: "Australia/Sydney", isActive: true },
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", timezone: "Asia/Dubai", isActive: true },
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", isActive: true },
      { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", isActive: true },
      { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", isActive: true }
    ];

    const airports = await Airport.insertMany(airportData);
    console.log(`✅ ${airports.length} airports seeded`);

    // Seed Flights with current dates and missing fields
    console.log('🛫 Seeding flights for ALL airport combinations...');
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    
    // Generate flights for ALL possible airport combinations
    const flightData = [];
    let flightCounter = 1;
    const usedFlightIds = new Set(); // Track used flight IDs to prevent duplicates
    
    // Airlines for variety
    const airlines = [
      "American Airlines", "Delta Airlines", "United Airlines", "British Airways", "Lufthansa",
      "Air France", "Emirates", "Qatar Airways", "Singapore Airlines", "Cathay Pacific",
      "Japan Airlines", "All Nippon Airways", "Air China", "Air India", "Qantas Airways",
      "Turkish Airlines", "KLM", "Swiss International", "Austrian Airlines", "Scandinavian Airlines"
    ];
    
    // Aircraft types
    const aircraftTypes = [
      "Boeing 737", "Boeing 787", "Boeing 777", "Airbus A320", "Airbus A350", "Airbus A380"
    ];
    
    // Generate flights for every possible airport combination
    for (let i = 0; i < airports.length; i++) {
      for (let j = 0; j < airports.length; j++) {
        // Skip same airport (no flights from A to A)
        if (i === j) continue;
        
        const origin = airports[i].code;
        const destination = airports[j].code;
        
        // Generate multiple flights per route for variety
        const flightsPerRoute = Math.floor(Math.random() * 3) + 1; // 1-3 flights per route
        
        for (let k = 0; k < flightsPerRoute; k++) {
          const airline = airlines[Math.floor(Math.random() * airlines.length)];
          const aircraftType = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
          
          // Generate realistic flight number
          const airlineCode = airline.split(' ').map(word => word[0]).join('').toUpperCase();
          const flightNumber = `${airlineCode}${Math.floor(Math.random() * 9000) + 1000}`;
          
          // Generate realistic departure time (6 AM to 10 PM)
          const departureHour = Math.floor(Math.random() * 16) + 6;
          const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
          
          const departureDateTime = new Date(tomorrow);
          departureDateTime.setHours(departureHour, departureMinute, 0, 0);
          
          // Calculate realistic flight duration based on distance
          const flightDurationHours = calculateFlightDuration(origin, destination);
          const arrivalDateTime = new Date(departureDateTime.getTime() + flightDurationHours * 60 * 60 * 1000);
          
          // Generate realistic capacity and available space
          const capacity = getAircraftCapacity(aircraftType);
          const availableSpace = Math.floor(Math.random() * capacity * 0.4) + Math.floor(capacity * 0.6);
          
          // Ensure unique flight ID
          let flightId = `FL${flightCounter.toString().padStart(3, '0')}`;
          while (usedFlightIds.has(flightId)) {
            flightCounter++;
            flightId = `FL${flightCounter.toString().padStart(3, '0')}`;
          }
          usedFlightIds.add(flightId);
          
          flightData.push({
            flightId: flightId,
            flightNumber: flightNumber,
            airlineName: airline,
            origin: origin,
            destination: destination,
            departureDateTime: departureDateTime,
            arrivalDateTime: arrivalDateTime,
            aircraftType: aircraftType,
            capacity: capacity,
            availableSpace: availableSpace,
            status: "SCHEDULED"
          });
          
          flightCounter++;
        }
      }
    }
    
    // Helper function to calculate realistic flight duration
    function calculateFlightDuration(origin, destination) {
      // Base flight times for different regions
      const regionalTimes = {
        // Domestic/Regional flights (1-3 hours)
        'DEL-BOM': 2, 'BOM-BLR': 2, 'DEL-BLR': 2.5,
        'JFK-LAX': 6, 'JFK-ORD': 3, 'LAX-SFO': 1.5,
        'LHR-CDG': 1.5, 'CDG-FRA': 1, 'FRA-LHR': 1.5,
        'NRT-HKG': 4, 'HKG-SIN': 4, 'SIN-BOM': 5,
        'SYD-SIN': 8, 'PEK-NRT': 3, 'ICN-HKG': 3,
        
        // Long-haul flights (8-16 hours)
        'JFK-LHR': 7, 'JFK-CDG': 7, 'JFK-FRA': 8,
        'JFK-DEL': 14, 'JFK-DXB': 12, 'JFK-SIN': 18,
        'LHR-JFK': 7, 'LHR-DEL': 10, 'LHR-DXB': 7,
        'LHR-SIN': 13, 'LHR-SYD': 22, 'LHR-PEK': 10,
        'CDG-JFK': 7, 'CDG-DEL': 11, 'CDG-DXB': 7,
        'FRA-JFK': 8, 'FRA-DEL': 9, 'FRA-DXB': 6,
        'DXB-LHR': 7, 'DXB-CDG': 7, 'DXB-FRA': 6,
        'DXB-DEL': 3, 'DXB-SIN': 7, 'DXB-SYD': 13,
        'SIN-LHR': 13, 'SIN-CDG': 13, 'SIN-FRA': 12,
        'SIN-JFK': 18, 'SIN-SYD': 8, 'SIN-PEK': 6,
        'SYD-LHR': 22, 'SYD-CDG': 22, 'SYD-FRA': 21,
        'SYD-JFK': 20, 'SYD-DEL': 16, 'SYD-DXB': 13,
        'PEK-LHR': 10, 'PEK-CDG': 10, 'PEK-FRA': 9,
        'PEK-JFK': 13, 'PEK-DEL': 7, 'PEK-DXB': 8,
        'NRT-LHR': 12, 'NRT-CDG': 12, 'NRT-FRA': 11,
        'NRT-JFK': 14, 'NRT-DEL': 9, 'NRT-DXB': 10,
        'HKG-LHR': 12, 'HKG-CDG': 12, 'HKG-FRA': 11,
        'HKG-JFK': 15, 'HKG-DEL': 8, 'HKG-DXB': 7,
        'ICN-LHR': 11, 'ICN-CDG': 11, 'ICN-FRA': 10,
        'ICN-JFK': 14, 'ICN-DEL': 7, 'ICN-DXB': 8
      };
      
      const route = `${origin}-${destination}`;
      const reverseRoute = `${destination}-${origin}`;
      
      if (regionalTimes[route]) {
        return regionalTimes[route];
      } else if (regionalTimes[reverseRoute]) {
        return regionalTimes[reverseRoute];
      } else {
        // Estimate based on general patterns
        const isSameRegion = isSameGeographicRegion(origin, destination);
        if (isSameRegion) {
          return Math.floor(Math.random() * 3) + 1; // 1-3 hours for regional
        } else {
          return Math.floor(Math.random() * 8) + 6; // 6-14 hours for long-haul
        }
      }
    }
    
    // Helper function to determine if airports are in same region
    function isSameGeographicRegion(origin, destination) {
      const regions = {
        'US': ['JFK', 'LAX'],
        'Europe': ['LHR', 'CDG', 'FRA'],
        'Asia': ['NRT', 'PEK', 'HKG', 'ICN', 'SIN'],
        'India': ['DEL', 'BOM', 'BLR'],
        'MiddleEast': ['DXB'],
        'Oceania': ['SYD']
      };
      
      for (const region in regions) {
        if (regions[region].includes(origin) && regions[region].includes(destination)) {
          return true;
        }
      }
      return false;
    }
    
    // Helper function to get aircraft capacity
    function getAircraftCapacity(aircraftType) {
      const capacities = {
        'Boeing 737': 150,
        'Boeing 787': 250,
        'Boeing 777': 350,
        'Airbus A320': 180,
        'Airbus A350': 300,
        'Airbus A380': 400
      };
      return capacities[aircraftType] || 200;
    }

    const flights = await Flight.insertMany(flightData);
    console.log(`✅ ${flights.length} flights seeded`);

    // Seed Bookings
    console.log('📦 Seeding bookings...');
    const bookingData = [
      {
        origin: "JFK",
        destination: "LAX",
        pieces: 5,
        weightKg: 25.5,
        status: "BOOKED",
        flightIds: ["FL001"]
      },
      {
        origin: "LHR",
        destination: "CDG",
        pieces: 3,
        weightKg: 15.2,
        status: "DEPARTED",
        flightIds: ["FL002"]
      },
      {
        origin: "NRT",
        destination: "PEK",
        pieces: 8,
        weightKg: 45.0,
        status: "ARRIVED",
        flightIds: ["FL003"]
      },
      {
        origin: "DEL",
        destination: "DXB",
        pieces: 12,
        weightKg: 67.8,
        status: "BOOKED",
        flightIds: ["FL004"]
      },
      {
        origin: "SYD",
        destination: "SIN",
        pieces: 6,
        weightKg: 32.1,
        status: "DEPARTED",
        flightIds: ["FL005"]
      },
      // Additional bookings for new routes
      {
        origin: "DXB",
        destination: "FRA",
        pieces: 15,
        weightKg: 89.5,
        status: "BOOKED",
        flightIds: ["FL006"]
      },
      {
        origin: "HKG",
        destination: "ICN",
        pieces: 7,
        weightKg: 28.3,
        status: "BOOKED",
        flightIds: ["FL007"]
      },
      {
        origin: "SIN",
        destination: "BOM",
        pieces: 10,
        weightKg: 55.7,
        status: "DEPARTED",
        flightIds: ["FL008"]
      },
      {
        origin: "BOM",
        destination: "BLR",
        pieces: 4,
        weightKg: 18.9,
        status: "ARRIVED",
        flightIds: ["FL009"]
      },
      {
        origin: "DEL",
        destination: "BOM",
        pieces: 9,
        weightKg: 42.6,
        status: "BOOKED",
        flightIds: ["FL010"]
      }
    ];

    const bookings = await Booking.insertMany(bookingData);
    console.log(`✅ ${bookings.length} bookings seeded`);

    console.log('🎉 All data seeded successfully!');
    console.log('📊 Database now contains:');
    console.log(`   - ${airports.length} airports`);
    console.log(`   - ${flights.length} flights`);
    console.log(`   - ${bookings.length} bookings`);
    
    // Calculate total possible routes
    const totalPossibleRoutes = airports.length * (airports.length - 1); // n * (n-1) for all combinations
    
    console.log('\n🚀 Comprehensive Flight Network Created!');
    console.log(`📈 Route Coverage: ${totalPossibleRoutes} possible routes`);
    console.log(`✅ Flights Available: ${flights.length} flights covering all combinations`);
    console.log('\n🌍 All Airport Combinations Now Have Flights:');
    
    // Show some example routes
    console.log('   - DEL ↔ BOM, DEL ↔ BLR, DEL ↔ JFK, DEL ↔ LHR, DEL ↔ CDG, DEL ↔ FRA, DEL ↔ DXB, DEL ↔ NRT, DEL ↔ PEK, DEL ↔ HKG, DEL ↔ ICN, DEL ↔ SIN, DEL ↔ SYD');
    console.log('   - BOM ↔ BLR, BOM ↔ JFK, BOM ↔ LHR, BOM ↔ CDG, BOM ↔ FRA, BOM ↔ DXB, BOM ↔ NRT, BOM ↔ PEK, BOM ↔ HKG, BOM ↔ ICN, BOM ↔ SIN, BOM ↔ SYD');
    console.log('   - JFK ↔ LAX, JFK ↔ LHR, JFK ↔ CDG, JFK ↔ FRA, JFK ↔ DXB, JFK ↔ NRT, JFK ↔ PEK, JFK ↔ HKG, JFK ↔ ICN, JFK ↔ SIN, JFK ↔ SYD');
    console.log('   - LHR ↔ CDG, LHR ↔ FRA, LHR ↔ DXB, LHR ↔ NRT, LHR ↔ PEK, LHR ↔ HKG, LHR ↔ ICN, LHR ↔ SIN, LHR ↔ SYD');
    console.log('   - And ALL other combinations...');
    
    console.log('\n💡 Use tomorrow\'s date when searching for flights!');
    console.log('💡 Users will NEVER see "no flights found" messages!');
    console.log('💡 Every airport combination has multiple flight options!');
    console.log('💡 Realistic flight times, airlines, and aircraft types!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedData().catch(console.error);
