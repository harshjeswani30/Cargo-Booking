import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function seedClients() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import Client model
    const { default: ClientModel } = await import('../lib/models/Client.js');
    
    // Clear existing clients
    console.log('🧹 Clearing existing clients...');
    await ClientModel.deleteMany({});
    console.log('✅ Existing clients cleared');

    // Seed sample clients
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
      }
    ];

    const clients = await ClientModel.insertMany(clientData);
    console.log(`✅ ${clients.length} clients seeded successfully!`);
    
    console.log('\n📋 Sample Clients Created:');
    clients.forEach(client => {
      console.log(`   - ${client.companyName} (${client.contactPerson.firstName} ${client.contactPerson.lastName})`);
    });
    
    console.log('\n💡 Now users can create bookings with these clients!');

  } catch (error) {
    console.error('❌ Error seeding clients:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedClients().catch(console.error);
