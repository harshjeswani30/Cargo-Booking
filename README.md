# Cargo Booking Management System

A comprehensive cargo booking and flight management system built with Next.js, MongoDB, and modern UI components.

## 🚀 Features

- **Real-time Flight Management**: Comprehensive flight scheduling with real aircraft data
- **Cargo Booking System**: Multi-step booking process with client management
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Client Management**: Complete client database with preferences and history
- **Route Coverage**: 20+ airports with comprehensive flight routes
- **Real Data**: All fields start with 0 when no data is available

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: Shadcn/ui, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Database**: MongoDB with Mongoose ODM
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB database
- pnpm package manager

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd Cargo-Booking-main
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/cargo-booking
# or your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cargo-booking
```

### 3. Seed the Database

Run the comprehensive seeding script to populate the database with real data:

```bash
pnpm run seed:comprehensive
```

This will create:
- **20 Airports** with real coordinates and timezones
- **8 Clients** with complete business information
- **100+ Flights** covering major international routes
- **10 Sample Bookings** with real timeline data

### 4. Start the Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:3000`

## 📊 Database Models

### Airport
- Airport codes, names, cities, countries
- Timezone information and coordinates
- Active status management

### Client
- Company information and contact details
- Business type and industry classification
- Credit limits and payment terms
- Preferred airports and cargo types

### Flight
- Flight IDs and numbers
- Origin/destination with realistic timing
- Aircraft types with capacity information
- Status tracking (Scheduled, Boarding, Departed, Arrived, Cancelled)

### Booking
- Reference IDs with automatic generation
- Client associations
- Cargo details (pieces, weight, dimensions)
- Flight assignments
- Timeline tracking with status updates

## 🎯 Key Features

### Dashboard
- **Real-time Analytics**: Shows 0 values when no data is available
- **Performance Metrics**: System performance and booking statistics
- **Quick Actions**: Direct access to common operations

### Flight Management
- **Comprehensive Routes**: All major international routes covered
- **Real Aircraft Data**: Boeing and Airbus aircraft with realistic capacities
- **Status Tracking**: Complete flight lifecycle management

### Booking System
- **Multi-step Process**: Client selection → Route → Cargo → Flight → Confirmation
- **Real-time Validation**: Flight availability checking
- **Client Association**: Full client history and preferences

### Data Handling
- **Zero-based Start**: All numeric fields start with 0 when empty
- **Graceful Degradation**: System works even with minimal data
- **Real-time Updates**: Live data refresh and status updates

## 🔧 Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Build for production
pnpm run start        # Start production server

# Database Management
pnpm run seed:comprehensive    # Seed all data (recommended)
pnpm run seed:data            # Seed basic flight and airport data
pnpm run seed:clients         # Seed client data only
pnpm run clear:bookings       # Clear all booking data

# Testing
pnpm run test                 # Run test suite
pnpm run test:watch          # Run tests in watch mode
```

## 🌍 Airport Coverage

The system includes 20 major international airports:

**North America**: JFK (New York), LAX (Los Angeles), ORD (Chicago), MIA (Miami), SFO (San Francisco)

**Europe**: LHR (London), CDG (Paris), FRA (Frankfurt), AMS (Amsterdam), MAD (Madrid)

**Asia-Pacific**: NRT (Tokyo), PEK (Beijing), HKG (Hong Kong), ICN (Seoul), SIN (Singapore)

**India**: DEL (Delhi), BOM (Mumbai), BLR (Bangalore)

**Middle East**: DXB (Dubai)

**Oceania**: SYD (Sydney)

## 📈 Flight Routes

The system provides comprehensive coverage of major international routes:

- **Domestic US**: JFK ↔ LAX, JFK ↔ ORD, LAX ↔ SFO
- **Transatlantic**: JFK ↔ LHR, JFK ↔ CDG, JFK ↔ FRA
- **European**: LHR ↔ CDG, CDG ↔ FRA, AMS ↔ LHR
- **Asia-Pacific**: NRT ↔ HKG, HKG ↔ SIN, PEK ↔ NRT
- **Middle East**: DXB ↔ LHR, DXB ↔ CDG, DXB ↔ FRA
- **Long-haul**: SYD ↔ LHR, SYD ↔ JFK, PEK ↔ LHR

## 💡 Usage Tips

### For New Users
1. **Start with Seeding**: Run `pnpm run seed:comprehensive` to populate the database
2. **Use Tomorrow's Date**: All flights are scheduled for tomorrow for easy testing
3. **Check Available Routes**: The system shows all available routes when searching

### For Developers
1. **Real Data Models**: All models use real-world data structures
2. **Zero-based Fields**: Numeric fields default to 0 when empty
3. **Comprehensive Coverage**: Every major route has multiple flight options

### For Business Users
1. **Client Management**: Complete client database with business preferences
2. **Route Coverage**: Comprehensive international route network
3. **Real-time Tracking**: Live status updates and timeline tracking

## 🔍 Troubleshooting

### Common Issues

**No Flights Found**
- Ensure you've run the seeding script
- Use tomorrow's date for flight searches
- Check that the backend server is running

**Database Connection Issues**
- Verify your MongoDB connection string
- Check if MongoDB is running
- Ensure network access to your database

**Empty Dashboard**
- Run the seeding script to populate data
- Check browser console for errors
- Verify API endpoints are working

### Performance Tips

- **Database Indexes**: All models include performance indexes
- **Real-time Updates**: Data refreshes automatically every 30 seconds
- **Efficient Queries**: Optimized database queries with proper indexing

## 📝 API Endpoints

- `GET /api/airports` - List all airports
- `GET /api/flights` - List all flights
- `GET /api/flights/routes` - Search flights by route and date
- `GET /api/clients` - List all clients
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking status
- `GET /api/monitoring` - System performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation
- Check browser console for error messages
- Ensure all prerequisites are met

---

**🎉 Ready to manage your cargo operations with real data and comprehensive coverage!**
