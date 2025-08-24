import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedAirportsOnly() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models after connection
    const { default: AirportModel } = await import('../lib/models/Airport.js');
    
    console.log('✈️ Adding real airports...');
    
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

    const airports = await AirportModel.insertMany(airportData);
    console.log(`✅ ${airports.length} real airports added successfully!`);
    
    console.log('\n✈️ Airports Added by Region:');
    console.log('🇺🇸 USA: JFK, LAX, ORD, MIA, SFO');
    console.log('🇬🇧 UK: LHR');
    console.log('🇫🇷 France: CDG');
    console.log('🇩🇪 Germany: FRA');
    console.log('🇯🇵 Japan: NRT');
    console.log('🇨🇳 China: PEK, HKG');
    console.log('🇦🇺 Australia: SYD');
    console.log('🇦🇪 UAE: DXB');
    console.log('🇸🇬 Singapore: SIN');
    console.log('🇰🇷 South Korea: ICN');
    console.log('🇳🇱 Netherlands: AMS');
    console.log('🇪🇸 Spain: MAD');
    console.log('🇮🇳 India: DEL, BOM, BLR');
    
    console.log('\n💡 Your system now has:');
    console.log('   ✅ Real business clients for booking creation');
    console.log('   ✅ Real airports for route selection');
    console.log('   ❌ No flights (fresh start)');
    console.log('   ❌ No bookings (fresh start)');
    console.log('\n🚀 You can now:');
    console.log('   1. Create bookings with real client selection');
    console.log('   2. Choose from 20 real airports worldwide');
    console.log('   3. Build your flight network from scratch');
    console.log('   4. Start with zero operational data');

  } catch (error) {
    console.error('❌ Error adding airports:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedAirportsOnly().catch(console.error);
