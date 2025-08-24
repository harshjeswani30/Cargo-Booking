import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function clearBookings() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: BookingModel } = await import('../lib/models/Booking.js');

    // Clear only bookings data
    console.log('🧹 Clearing bookings data...');
    const result = await BookingModel.deleteMany({});
    console.log(`✅ Cleared ${result.deletedCount} bookings`);

    console.log('🎉 Bookings cleared successfully!');
    console.log('📊 Database now contains:');
    console.log('   - All clients (preserved)');
    console.log('   - All flights (preserved)');
    console.log('   - All airports (preserved)');
    console.log('   - 0 bookings (fresh start)');

  } catch (error) {
    console.error('❌ Error clearing bookings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

clearBookings();
