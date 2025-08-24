import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function clearAllData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    const { default: BookingModel } = await import('../lib/models/Booking.js');
    const { default: ClientModel } = await import('../lib/models/Client.js');
    
    console.log('🧹 Clearing ALL data from database...');
    
    // Clear all collections
    const airportResult = await AirportModel.deleteMany({});
    const flightResult = await FlightModel.deleteMany({});
    const bookingResult = await BookingModel.deleteMany({});
    const clientResult = await ClientModel.deleteMany({});
    
    console.log('✅ Data cleared successfully:');
    console.log(`   - Airports: ${airportResult.deletedCount} deleted`);
    console.log(`   - Flights: ${flightResult.deletedCount} deleted`);
    console.log(`   - Bookings: ${bookingResult.deletedCount} deleted`);
    console.log(`   - Clients: ${clientResult.deletedCount} deleted`);
    
    console.log('\n🎯 Database is now completely empty!');
    console.log('🚀 Your system will start fresh with zero data');
    console.log('💡 All pages will show 0 values until you add new data');
    console.log('💡 Use the booking form to create your first real booking');
    console.log('💡 The system will automatically fetch and display real data');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearAllData().catch(console.error);
