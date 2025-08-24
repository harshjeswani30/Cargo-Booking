import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models using dynamic imports
let Airport, Flight, Booking, Client;

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedComprehensiveData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    const { default: BookingModel } = await import('../lib/models/Booking.js');
    const { default: ClientModel } = await import('../lib/models/Client.js');
    
    Airport = AirportModel;
    Flight = FlightModel;
    Booking = BookingModel;
    Client = ClientModel;

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Airport.deleteMany({});
    await Flight.deleteMany({});
    await Booking.deleteMany({});
    await Client.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed Airports with comprehensive data
    console.log('✈️ Seeding airports...');
    const airportData = [
      { code: "DEL", name: "Indira Gandhi International Airport", city: "Delhi", country: "India", timezone: "Asia/Kolkata", isActive: true, coordinates: { latitude: 28.5562, longitude: 77.1000 } },
      { code: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India", timezone: "Asia/Kolkata", isActive: true, coordinates: { latitude: 19.0896, longitude: 72.8656 } },
      { code: "BLR", name: "Kempegowda International Airport", city: "Bangalore", country: "India", timezone: "Asia/Kolkata", isActive: true, coordinates: { latitude: 13.1986, longitude: 77.7066 } },
      { code: "JFK", name: "John F. Kennedy International Airport", city: "New York", country: "USA", timezone: "America/New_York", isActive: true, coordinates: { latitude: 40.6413, longitude: -73.7781 } },
      { code: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles", isActive: true, coordinates: { latitude: 33.9416, longitude: -118.4085 } },
      { code: "ORD", name: "O'Hare International Airport", city: "Chicago", country: "USA", timezone: "America/Chicago", isActive: true, coordinates: { latitude: 41.9786, longitude: -87.9048 } },
      { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK", timezone: "Europe/London", isActive: true, coordinates: { latitude: 51.4700, longitude: -0.4543 } },
      { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "France", timezone: "Europe/Paris", isActive: true, coordinates: { latitude: 49.0097, longitude: 2.5479 } },
      { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", timezone: "Europe/Berlin", isActive: true, coordinates: { latitude: 50.0379, longitude: 8.5622 } },
      { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", isActive: true, coordinates: { latitude: 35.6762, longitude: 140.0173 } },
      { code: "PEK", name: "Beijing Capital International Airport", city: "Beijing", country: "China", timezone: "Asia/Shanghai", isActive: true, coordinates: { latitude: 40.0799, longitude: 116.6031 } },
      { code: "SYD", name: "Sydney Airport", city: "Sydney", country: "Australia", timezone: "Australia/Sydney", isActive: true, coordinates: { latitude: -33.9399, longitude: 151.1753 } },
      { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "UAE", timezone: "Asia/Dubai", isActive: true, coordinates: { latitude: 25.2532, longitude: 55.3657 } },
      { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", timezone: "Asia/Singapore", isActive: true, coordinates: { latitude: 1.3644, longitude: 103.9915 } },
      { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "China", timezone: "Asia/Hong_Kong", isActive: true, coordinates: { latitude: 22.3080, longitude: 113.9185 } },
      { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "South Korea", timezone: "Asia/Seoul", isActive: true, coordinates: { latitude: 37.4602, longitude: 126.4407 } },
      { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", isActive: true, coordinates: { latitude: 52.3105, longitude: 4.7683 } },
      { code: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", timezone: "Europe/Madrid", isActive: true, coordinates: { latitude: 40.4983, longitude: -3.5676 } },
      { code: "MIA", name: "Miami International Airport", city: "Miami", country: "USA", timezone: "America/New_York", isActive: true, coordinates: { latitude: 25.7932, longitude: -80.2906 } },
      { code: "SFO", name: "San Francisco International Airport", city: "San Francisco", country: "USA", timezone: "America/Los_Angeles", isActive: true, coordinates: { latitude: 37.6213, longitude: -122.3790 } }
    ];

    const airports = await Airport.insertMany(airportData);
    console.log(`✅ ${airports.length} airports seeded`);

    // Seed Clients with comprehensive data
    console.log('👥 Seeding clients...');
    const clientData = [
      {
        companyName: "Global Logistics Corp",
        contactPerson: {
          firstName: "John",
          lastName: "Smith"
        },
        email: "john.smith@globallogistics.com",
        phone: "+1-555-0123",
        address: {
          street: "123 Business Ave",
          city: "New York",
          state: "NY",
          country: "USA",
          postalCode: "10001"
        },
        businessType: "FREIGHT_FORWARDER",
        industry: "Logistics",
        accountType: "PREMIUM",
        creditLimit: 50000,
        paymentTerms: "NET_30",
        notes: "Premium client with excellent payment history",
        preferences: {
          preferredAirports: ["JFK", "LAX", "LHR"],
          cargoTypes: ["Electronics", "Textiles"],
          specialRequirements: ["Temperature controlled", "Fragile handling"]
        }
      },
      {
        companyName: "Tech Imports Ltd",
        contactPerson: {
          firstName: "Sarah",
          lastName: "Johnson"
        },
        email: "sarah.johnson@techimports.co.uk",
        phone: "+44-20-7946-0958",
        address: {
          street: "456 Innovation Street",
          city: "London",
          state: "",
          country: "UK",
          postalCode: "SW1A 1AA"
        },
        businessType: "IMPORTER",
        industry: "Technology",
        accountType: "STANDARD",
        creditLimit: 25000,
        paymentTerms: "NET_30",
        notes: "Regular importer of electronic components",
        preferences: {
          preferredAirports: ["LHR", "CDG", "FRA"],
          cargoTypes: ["Electronics", "Components"],
          specialRequirements: ["Anti-static packaging"]
        }
      },
      {
        companyName: "Asian Exports Co",
        contactPerson: {
          firstName: "Li",
          lastName: "Wei"
        },
        email: "li.wei@asianexports.cn",
        phone: "+86-10-1234-5678",
        address: {
          street: "789 Export Boulevard",
          city: "Beijing",
          state: "",
          country: "China",
          postalCode: "100000"
        },
        businessType: "EXPORTER",
        industry: "Manufacturing",
        accountType: "ENTERPRISE",
        creditLimit: 100000,
        paymentTerms: "NET_60",
        notes: "Major exporter of manufactured goods",
        preferences: {
          preferredAirports: ["PEK", "HKG", "SIN"],
          cargoTypes: ["Manufactured Goods", "Textiles"],
          specialRequirements: ["Standard packaging"]
        }
      },
      {
        companyName: "Indian Trading Solutions",
        contactPerson: {
          firstName: "Raj",
          lastName: "Patel"
        },
        email: "raj.patel@indiantrading.in",
        phone: "+91-11-2345-6789",
        address: {
          street: "321 Trade Center",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          postalCode: "400001"
        },
        businessType: "LOGISTICS_PROVIDER",
        industry: "General Trading",
        accountType: "STANDARD",
        creditLimit: 30000,
        paymentTerms: "NET_30",
        notes: "Reliable trading partner",
        preferences: {
          preferredAirports: ["DEL", "BOM", "DXB"],
          cargoTypes: ["General Cargo", "Textiles"],
          specialRequirements: ["Standard handling"]
        }
      },
      {
        companyName: "Dubai Freight Services",
        contactPerson: {
          firstName: "Ahmed",
          lastName: "Al-Rashid"
        },
        email: "ahmed.alrashid@dubaifreight.ae",
        phone: "+971-4-123-4567",
        address: {
          street: "654 Cargo Street",
          city: "Dubai",
          state: "",
          country: "UAE",
          postalCode: "00000"
        },
        businessType: "FREIGHT_FORWARDER",
        industry: "Freight Forwarding",
        accountType: "PREMIUM",
        creditLimit: 75000,
        paymentTerms: "NET_30",
        notes: "Premium freight forwarder in Middle East",
        preferences: {
          preferredAirports: ["DXB", "FRA", "LHR"],
          cargoTypes: ["General Cargo", "Electronics"],
          specialRequirements: ["Standard handling"]
        }
      },
      {
        companyName: "European Cargo Solutions",
        contactPerson: {
          firstName: "Hans",
          lastName: "Mueller"
        },
        email: "hans.mueller@europeancargo.de",
        phone: "+49-69-1234-5678",
        address: {
          street: "789 Logistics Park",
          city: "Frankfurt",
          state: "Hesse",
          country: "Germany",
          postalCode: "60313"
        },
        businessType: "LOGISTICS_PROVIDER",
        industry: "Logistics",
        accountType: "PREMIUM",
        creditLimit: 60000,
        paymentTerms: "NET_30",
        notes: "European logistics specialist",
        preferences: {
          preferredAirports: ["FRA", "CDG", "LHR", "AMS"],
          cargoTypes: ["Automotive", "Machinery"],
          specialRequirements: ["Heavy lift equipment"]
        }
      },
      {
        companyName: "Pacific Rim Trading",
        contactPerson: {
          firstName: "Yuki",
          lastName: "Tanaka"
        },
        email: "yuki.tanaka@pacificrim.jp",
        phone: "+81-3-1234-5678",
        address: {
          street: "456 Trade Plaza",
          city: "Tokyo",
          state: "",
          country: "Japan",
          postalCode: "100-0001"
        },
        businessType: "EXPORTER",
        industry: "Electronics",
        accountType: "ENTERPRISE",
        creditLimit: 80000,
        paymentTerms: "NET_60",
        notes: "Major Japanese electronics exporter",
        preferences: {
          preferredAirports: ["NRT", "HKG", "SIN", "LAX"],
          cargoTypes: ["Electronics", "Precision Instruments"],
          specialRequirements: ["Anti-static", "Climate controlled"]
        }
      },
      {
        companyName: "Australian Freight Forwarders",
        contactPerson: {
          firstName: "Michael",
          lastName: "Brown"
        },
        email: "michael.brown@ausfreight.au",
        phone: "+61-2-1234-5678",
        address: {
          street: "123 Harbour Drive",
          city: "Sydney",
          state: "NSW",
          country: "Australia",
          postalCode: "2000"
        },
        businessType: "FREIGHT_FORWARDER",
        industry: "Freight Forwarding",
        accountType: "STANDARD",
        creditLimit: 40000,
        paymentTerms: "NET_30",
        notes: "Reliable Australian freight forwarder",
        preferences: {
          preferredAirports: ["SYD", "MEL", "SIN", "HKG"],
          cargoTypes: ["Agricultural Products", "Mining Equipment"],
          specialRequirements: ["Temperature controlled"]
        }
      }
    ];

    const clients = await Client.insertMany(clientData);
    console.log(`✅ ${clients.length} clients seeded`);

    // Seed Flights with comprehensive data
    console.log('🛫 Seeding flights...');
    const currentDate = new Date();
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1);
    
    const flightData = [];
    let flightCounter = 1;
    const usedFlightIds = new Set();
    
    // Airlines for variety
    const airlines = [
      "American Airlines", "Delta Airlines", "United Airlines", "British Airways", "Lufthansa",
      "Air France", "Emirates", "Qatar Airways", "Singapore Airlines", "Cathay Pacific",
      "Japan Airlines", "All Nippon Airways", "Air China", "Air India", "Qantas Airways",
      "Turkish Airlines", "KLM", "Swiss International", "Austrian Airlines", "Scandinavian Airlines"
    ];
    
    // Aircraft types with realistic capacities
    const aircraftTypes = [
      { type: "Boeing 737", capacity: 150, range: 5600 },
      { type: "Boeing 787", capacity: 250, range: 13000 },
      { type: "Boeing 777", capacity: 350, range: 14000 },
      { type: "Airbus A320", capacity: 180, range: 6100 },
      { type: "Airbus A350", capacity: 300, range: 15000 },
      { type: "Airbus A380", capacity: 400, range: 15700 }
    ];
    
    // Generate flights for major routes
    const majorRoutes = [
      // Domestic US routes
      { origin: "JFK", destination: "LAX", frequency: 8 },
      { origin: "JFK", destination: "ORD", frequency: 6 },
      { origin: "LAX", destination: "ORD", frequency: 5 },
      { origin: "LAX", destination: "SFO", frequency: 4 },
      { origin: "JFK", destination: "MIA", frequency: 4 },
      
      // International routes
      { origin: "JFK", destination: "LHR", frequency: 6 },
      { origin: "JFK", destination: "CDG", frequency: 5 },
      { origin: "JFK", destination: "FRA", frequency: 4 },
      { origin: "LHR", destination: "CDG", frequency: 4 },
      { origin: "LHR", destination: "FRA", frequency: 3 },
      { origin: "CDG", destination: "FRA", frequency: 3 },
      
      // Asia-Pacific routes
      { origin: "NRT", destination: "HKG", frequency: 4 },
      { origin: "HKG", destination: "SIN", frequency: 5 },
      { origin: "SIN", destination: "BOM", frequency: 3 },
      { origin: "PEK", destination: "NRT", frequency: 4 },
      { origin: "ICN", destination: "HKG", frequency: 3 },
      
      // Middle East routes
      { origin: "DXB", destination: "LHR", frequency: 4 },
      { origin: "DXB", destination: "CDG", frequency: 3 },
      { origin: "DXB", destination: "FRA", frequency: 3 },
      { origin: "DXB", destination: "DEL", frequency: 3 },
      { origin: "DXB", destination: "BOM", frequency: 3 },
      
      // Indian routes
      { origin: "DEL", destination: "BOM", frequency: 4 },
      { origin: "DEL", destination: "BLR", frequency: 3 },
      { origin: "BOM", destination: "BLR", frequency: 3 },
      { origin: "DEL", destination: "DXB", frequency: 3 },
      { origin: "BOM", destination: "DXB", frequency: 3 },
      
      // European routes
      { origin: "AMS", destination: "LHR", frequency: 3 },
      { origin: "MAD", destination: "CDG", frequency: 2 },
      { origin: "AMS", destination: "FRA", frequency: 2 },
      
      // Long-haul routes
      { origin: "SYD", destination: "LHR", frequency: 2 },
      { origin: "SYD", destination: "JFK", frequency: 2 },
      { origin: "SYD", destination: "SIN", frequency: 3 },
      { origin: "PEK", destination: "LHR", frequency: 2 },
      { origin: "PEK", destination: "JFK", frequency: 2 }
    ];
    
    for (const route of majorRoutes) {
      for (let i = 0; i < route.frequency; i++) {
        const airline = airlines[Math.floor(Math.random() * airlines.length)];
        const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
        
        // Generate realistic flight number
        const airlineCode = airline.split(' ').map(word => word[0]).join('').toUpperCase();
        const flightNumber = `${airlineCode}${Math.floor(Math.random() * 9000) + 1000}`;
        
        // Generate realistic departure time (6 AM to 10 PM)
        const departureHour = Math.floor(Math.random() * 16) + 6;
        const departureMinute = Math.floor(Math.random() * 4) * 15;
        
        const departureDateTime = new Date(tomorrow);
        departureDateTime.setHours(departureHour, departureMinute, 0, 0);
        
        // Calculate realistic flight duration
        const flightDurationHours = calculateFlightDuration(route.origin, route.destination);
        const arrivalDateTime = new Date(departureDateTime.getTime() + flightDurationHours * 60 * 60 * 1000);
        
        // Generate realistic capacity and available space
        const capacity = aircraft.capacity;
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
          origin: route.origin,
          destination: route.destination,
          departureDateTime: departureDateTime,
          arrivalDateTime: arrivalDateTime,
          aircraftType: aircraft.type,
          capacity: capacity,
          availableSpace: availableSpace,
          status: "SCHEDULED"
        });
        
        flightCounter++;
      }
    }
    
    // Helper function to calculate realistic flight duration
    function calculateFlightDuration(origin, destination) {
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
        'US': ['JFK', 'LAX', 'ORD', 'MIA', 'SFO'],
        'Europe': ['LHR', 'CDG', 'FRA', 'AMS', 'MAD'],
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

    const flights = await Flight.insertMany(flightData);
    console.log(`✅ ${flights.length} flights seeded`);

    // Seed Bookings with real data
    console.log('📦 Seeding bookings...');
    const bookingData = [
      {
        clientId: clients[0]._id, // Global Logistics Corp
        origin: "JFK",
        destination: "LAX",
        pieces: 15,
        weightKg: 250.5,
        status: "BOOKED",
        flightIds: [flights[0].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "New York",
            notes: "Booking created for electronics shipment"
          }
        ]
      },
      {
        clientId: clients[1]._id, // Tech Imports Ltd
        origin: "LHR",
        destination: "CDG",
        pieces: 8,
        weightKg: 120.2,
        status: "DEPARTED",
        flightIds: [flights[5].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "London",
            notes: "Booking created for tech components"
          },
          {
            eventType: "DEPARTED",
            location: "London",
            notes: "Cargo departed from London"
          }
        ]
      },
      {
        clientId: clients[2]._id, // Asian Exports Co
        origin: "NRT",
        destination: "PEK",
        pieces: 25,
        weightKg: 450.0,
        status: "ARRIVED",
        flightIds: [flights[12].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Tokyo",
            notes: "Booking created for manufactured goods"
          },
          {
            eventType: "DEPARTED",
            location: "Tokyo",
            notes: "Cargo departed from Tokyo"
          },
          {
            eventType: "ARRIVED",
            location: "Beijing",
            notes: "Cargo arrived in Beijing"
          }
        ]
      },
      {
        clientId: clients[3]._id, // Indian Trading Solutions
        origin: "DEL",
        destination: "DXB",
        pieces: 30,
        weightKg: 678.8,
        status: "BOOKED",
        flightIds: [flights[18].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Delhi",
            notes: "Booking created for textiles shipment"
          }
        ]
      },
      {
        clientId: clients[4]._id, // Dubai Freight Services
        origin: "SYD",
        destination: "SIN",
        pieces: 12,
        weightKg: 332.1,
        status: "DEPARTED",
        flightIds: [flights[25].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Sydney",
            notes: "Booking created for agricultural products"
          },
          {
            eventType: "DEPARTED",
            location: "Sydney",
            notes: "Cargo departed from Sydney"
          }
        ]
      },
      {
        clientId: clients[5]._id, // European Cargo Solutions
        origin: "DXB",
        destination: "FRA",
        pieces: 18,
        weightKg: 895.5,
        status: "BOOKED",
        flightIds: [flights[16].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Dubai",
            notes: "Booking created for machinery parts"
          }
        ]
      },
      {
        clientId: clients[6]._id, // Pacific Rim Trading
        origin: "HKG",
        destination: "ICN",
        pieces: 22,
        weightKg: 283.3,
        status: "BOOKED",
        flightIds: [flights[13].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Hong Kong",
            notes: "Booking created for electronics"
          }
        ]
      },
      {
        clientId: clients[7]._id, // Australian Freight Forwarders
        origin: "SIN",
        destination: "BOM",
        pieces: 35,
        weightKg: 557.7,
        status: "DEPARTED",
        flightIds: [flights[14].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Singapore",
            notes: "Booking created for general cargo"
          },
          {
            eventType: "DEPARTED",
            location: "Singapore",
            notes: "Cargo departed from Singapore"
          }
        ]
      },
      {
        clientId: clients[0]._id, // Global Logistics Corp
        origin: "BOM",
        destination: "BLR",
        pieces: 10,
        weightKg: 189.9,
        status: "ARRIVED",
        flightIds: [flights[21].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Mumbai",
            notes: "Booking created for local distribution"
          },
          {
            eventType: "DEPARTED",
            location: "Mumbai",
            notes: "Cargo departed from Mumbai"
          },
          {
            eventType: "ARRIVED",
            location: "Bangalore",
            notes: "Cargo arrived in Bangalore"
          }
        ]
      },
      {
        clientId: clients[1]._id, // Tech Imports Ltd
        origin: "DEL",
        destination: "BOM",
        pieces: 28,
        weightKg: 426.6,
        status: "BOOKED",
        flightIds: [flights[22].flightId],
        timeline: [
          {
            eventType: "BOOKED",
            location: "Delhi",
            notes: "Booking created for tech equipment"
          }
        ]
      }
    ];

    const bookings = await Booking.insertMany(bookingData);
    console.log(`✅ ${bookings.length} bookings seeded`);

    console.log('🎉 All comprehensive data seeded successfully!');
    console.log('📊 Database now contains:');
    console.log(`   - ${airports.length} airports`);
    console.log(`   - ${clients.length} clients`);
    console.log(`   - ${flights.length} flights`);
    console.log(`   - ${bookings.length} bookings`);
    
    console.log('\n🚀 Comprehensive Flight Network Created!');
    console.log(`📈 Route Coverage: ${majorRoutes.length} major routes`);
    console.log(`✅ Flights Available: ${flights.length} flights covering all major routes`);
    console.log('\n🌍 Major Routes Now Have Flights:');
    
    // Show some example routes
    majorRoutes.slice(0, 10).forEach(route => {
      console.log(`   - ${route.origin} ↔ ${route.destination} (${route.frequency} flights)`);
    });
    
    console.log('\n💡 Use tomorrow\'s date when searching for flights!');
    console.log('💡 Users will see comprehensive flight options!');
    console.log('💡 Every major route has multiple flight options!');
    console.log('💡 Realistic flight times, airlines, and aircraft types!');
    console.log('💡 All bookings start with real data and proper client associations!');

  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedComprehensiveData().catch(console.error);
