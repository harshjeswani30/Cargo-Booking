import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedCompleteFlights() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    
    console.log('✈️ Creating comprehensive flight network...');
    
    // Get all airports
    const airports = await AirportModel.find({});
    console.log(`📍 Found ${airports.length} airports`);
    
    if (airports.length === 0) {
      console.error('❌ No airports found. Please seed airports first.');
      process.exit(1);
    }
    
    // Clear existing flights first
    console.log('🗑️ Clearing existing flights...');
    await FlightModel.deleteMany({});
    console.log('✅ Existing flights cleared');
    
    const flights = [];
    let flightCounter = 1;
    
    // Generate flights for every airport pair
    for (let i = 0; i < airports.length; i++) {
      for (let j = 0; j < airports.length; j++) {
        if (i !== j) { // Don't create flights from airport to itself
          const origin = airports[i];
          const destination = airports[j];
          
          // Generate flights for the next 30 days
          for (let day = 0; day < 30; day++) {
            const departureDate = new Date();
            departureDate.setDate(departureDate.getDate() + day);
            
            // Morning flight (8 AM)
            const morningDeparture = new Date(departureDate);
            morningDeparture.setHours(8, 0, 0, 0);
            
            const morningArrival = new Date(morningDeparture);
            morningArrival.setHours(10, 0, 0, 0);
            
            const morningFlight = {
              flightId: `FL${flightCounter.toString().padStart(4, '0')}`,
              flightNumber: `CJ${flightCounter.toString().padStart(4, '0')}`,
              origin: origin.code,
              destination: destination.code,
              departureDateTime: morningDeparture,
              arrivalDateTime: morningArrival,
              airlineName: getRandomAirline(),
              aircraftType: getRandomAircraft(),
              capacity: Math.floor(Math.random() * 500) + 100,
              availableSpace: Math.floor(Math.random() * 500) + 100,
              status: 'SCHEDULED'
            };
            
            flights.push(morningFlight);
            flightCounter++;
            
            // Evening flight (6 PM)
            const eveningDeparture = new Date(departureDate);
            eveningDeparture.setHours(18, 0, 0, 0);
            
            const eveningArrival = new Date(eveningDeparture);
            eveningArrival.setHours(20, 0, 0, 0);
            
            const eveningFlight = {
              flightId: `FL${flightCounter.toString().padStart(4, '0')}`,
              flightNumber: `CJ${flightCounter.toString().padStart(4, '0')}`,
              origin: origin.code,
              destination: destination.code,
              departureDateTime: eveningDeparture,
              arrivalDateTime: eveningArrival,
              airlineName: getRandomAirline(),
              aircraftType: getRandomAircraft(),
              capacity: Math.floor(Math.random() * 500) + 100,
              availableSpace: Math.floor(Math.random() * 500) + 100,
              status: 'SCHEDULED'
            };
            
            flights.push(eveningFlight);
            flightCounter++;
          }
        }
      }
    }
    
    console.log(`✈️ Generated ${flights.length} flights`);
    
    // Insert all flights in batches
    const batchSize = 1000;
    for (let i = 0; i < flights.length; i += batchSize) {
      const batch = flights.slice(i, i + batchSize);
      await FlightModel.insertMany(batch);
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flights.length / batchSize)}`);
    }
    
    console.log('✅ All flights inserted successfully!');
    
    // Verify the insertion
    const totalFlights = await FlightModel.countDocuments();
    console.log(`📊 Total flights in database: ${totalFlights}`);
    
    // Show sample flights
    const sampleFlights = await FlightModel.find({}).limit(5);
    console.log('📋 Sample flights:');
    sampleFlights.forEach(flight => {
      console.log(`  ${flight.flightId}: ${flight.origin} → ${flight.destination} on ${flight.departureDateTime.toISOString().split('T')[0]}`);
    });
    
    console.log('🎉 Flight seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding flights:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

function getRandomAirline() {
  const airlines = [
    'CargoJet Airways',
    'FreightLift Airlines',
    'CargoExpress',
    'AirFreight Pro',
    'CargoWings',
    'FreightMaster Air',
    'CargoLink Airlines',
    'AirCargo Express',
    'FreightJet',
    'CargoAir Pro'
  ];
  return airlines[Math.floor(Math.random() * airlines.length)];
}

function getRandomAircraft() {
  const aircraft = [
    'Boeing 747-400F',
    'Boeing 777F',
    'Airbus A330-200F',
    'Boeing 767-300F',
    'Airbus A300-600F',
    'Boeing 757-200F',
    'MD-11F',
    'Boeing 737-800F',
    'ATR 72-500F',
    'Bombardier CRJ-200F'
  ];
  return aircraft[Math.floor(Math.random() * aircraft.length)];
}

// Run the seeding function
seedCompleteFlights();
