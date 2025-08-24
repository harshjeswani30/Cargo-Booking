const mongoose = require('mongoose');
const Flight = require('./models/Flight');
require('dotenv').config();

const baseFlights = [
  { flightId: 'AI101', flightNumber: 'AI-101', airlineName: 'Air India', depHour: 10, depMin: 0, arrHour: 12, arrMin: 30, origin: 'DEL', destination: 'BLR' },
  { flightId: 'SG202', flightNumber: 'SG-202', airlineName: 'SpiceJet', depHour: 14, depMin: 0, arrHour: 16, arrMin: 30, origin: 'DEL', destination: 'BLR' },
  { flightId: 'AI501', flightNumber: 'AI-501', airlineName: 'Air India', depHour: 9, depMin: 0, arrHour: 10, arrMin: 30, origin: 'MAA', destination: 'BLR' },
  { flightId: 'IG601', flightNumber: 'IG-601', airlineName: 'IndiGo', depHour: 15, depMin: 0, arrHour: 16, arrMin: 30, origin: 'MAA', destination: 'BLR' },
  { flightId: 'SG701', flightNumber: 'SG-701', airlineName: 'SpiceJet', depHour: 18, depMin: 0, arrHour: 19, arrMin: 30, origin: 'MAA', destination: 'BLR' },
  { flightId: 'AI502', flightNumber: 'AI-502', airlineName: 'Air India', depHour: 11, depMin: 30, arrHour: 13, arrMin: 0, origin: 'BLR', destination: 'MAA' },
  { flightId: 'IG602', flightNumber: 'IG-602', airlineName: 'IndiGo', depHour: 17, depMin: 30, arrHour: 19, arrMin: 0, origin: 'BLR', destination: 'MAA' },
  { flightId: 'AI201', flightNumber: 'AI-201', airlineName: 'Air India', depHour: 8, depMin: 0, arrHour: 10, arrMin: 30, origin: 'DEL', destination: 'HYD' },
  { flightId: 'IG301', flightNumber: 'IG-301', airlineName: 'IndiGo', depHour: 12, depMin: 0, arrHour: 13, arrMin: 30, origin: 'HYD', destination: 'BLR' },
  { flightId: 'IG302', flightNumber: 'IG-302', airlineName: 'IndiGo', depHour: 9, depMin: 0, arrHour: 10, arrMin: 30, origin: 'HYD', destination: 'BLR' },
  { flightId: 'AI801', flightNumber: 'AI-801', airlineName: 'Air India', depHour: 7, depMin: 0, arrHour: 8, arrMin: 30, origin: 'MAA', destination: 'HYD' },
  { flightId: 'SG802', flightNumber: 'SG-802', airlineName: 'SpiceJet', depHour: 13, depMin: 0, arrHour: 14, arrMin: 30, origin: 'MAA', destination: 'HYD' },
  { flightId: 'IG303', flightNumber: 'IG-303', airlineName: 'IndiGo', depHour: 10, depMin: 0, arrHour: 11, arrMin: 30, origin: 'HYD', destination: 'BLR' },
  { flightId: 'AI304', flightNumber: 'AI-304', airlineName: 'Air India', depHour: 16, depMin: 0, arrHour: 17, arrMin: 30, origin: 'HYD', destination: 'BLR' },
  { flightId: 'SG401', flightNumber: 'SG-401', airlineName: 'SpiceJet', depHour: 11, depMin: 0, arrHour: 13, arrMin: 0, origin: 'DEL', destination: 'MAA' },
  { flightId: 'AI901', flightNumber: 'AI-901', airlineName: 'Air India', depHour: 16, depMin: 0, arrHour: 18, arrMin: 0, origin: 'BLR', destination: 'BOM' },
  { flightId: 'IG902', flightNumber: 'IG-902', airlineName: 'IndiGo', depHour: 12, depMin: 0, arrHour: 14, arrMin: 0, origin: 'MAA', destination: 'BOM' }
];

function generateFlightsFor30Days() {
  const flights = [];
  const today = new Date();

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + dayOffset);

    baseFlights.forEach(base => {
      const dep = new Date(date);
      dep.setUTCHours(base.depHour, base.depMin, 0, 0);

      const arr = new Date(date);
      arr.setUTCHours(base.arrHour, base.arrMin, 0, 0);

      flights.push({
        flightId: `${base.flightId}-${dayOffset}`, // unique per day
        flightNumber: base.flightNumber,
        airlineName: base.airlineName,
        departureDateTime: dep,
        arrivalDateTime: arr,
        origin: base.origin,
        destination: base.destination
      });
    });
  }
  return flights;
}

async function seedFlights() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cargoapp');
    console.log('Connected to MongoDB');

    await Flight.deleteMany({});
    console.log('Cleared existing flights');

    const flights = generateFlightsFor30Days();
    await Flight.insertMany(flights);
    console.log('Flights for the next 30 days inserted successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding flights:', error);
    process.exit(1);
  }
}

seedFlights();
