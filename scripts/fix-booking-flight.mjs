import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function fixBookingFlight() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: BookingModel } = await import('../lib/models/Booking.js');
    const { default: FlightModel } = await import('../lib/models/Flight.js');
    
    console.log('🔧 Fixing booking flight mismatch...');
    
    // Find the booking that needs fixing
    const booking = await BookingModel.findOne({ refId: 'CRG1756051200808323' });
    
    if (!booking) {
      console.error('❌ Booking not found');
      process.exit(1);
    }
    
    console.log(`📋 Found booking: ${booking.refId}`);
    console.log(`   Origin: ${booking.origin} → Destination: ${booking.destination}`);
    console.log(`   Current flightIds: ${booking.flightIds}`);
    
    // Find a valid flight for this route
    const validFlight = await FlightModel.findOne({
      origin: booking.origin,
      destination: booking.destination
    });
    
    if (!validFlight) {
      console.error('❌ No valid flight found for this route');
      process.exit(1);
    }
    
    console.log(`✈️ Found valid flight: ${validFlight.flightId}`);
    console.log(`   ${validFlight.origin} → ${validFlight.destination}`);
    console.log(`   Airline: ${validFlight.airlineName}`);
    console.log(`   Aircraft: ${validFlight.aircraftType}`);
    
    // Update the booking with the valid flight ID
    const updatedBooking = await BookingModel.findOneAndUpdate(
      { refId: 'CRG1756051200808323' },
      { 
        flightIds: [validFlight.flightId],
        updatedAt: new Date()
      },
      { new: true }
    );
    
    console.log('✅ Booking updated successfully!');
    console.log(`   New flightIds: ${updatedBooking.flightIds}`);
    
    // Verify the fix
    const verification = await BookingModel.findOne({ refId: 'CRG1756051200808323' });
    console.log('\n🔍 Verification:');
    console.log(`   Booking: ${verification.refId}`);
    console.log(`   Flight IDs: ${verification.flightIds}`);
    console.log(`   Status: ${verification.status}`);
    
    console.log('\n🎉 Your booking is now properly linked to a valid flight!');
    console.log('   The flight management page should now show "1 found" instead of "0 found"');
    
  } catch (error) {
    console.error('❌ Error fixing booking:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the fixing function
fixBookingFlight();
