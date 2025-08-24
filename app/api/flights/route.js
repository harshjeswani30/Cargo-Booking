import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flight from '@/lib/models/Flight';

// GET /api/flights - Get all flights
export async function GET() {
  try {
    await dbConnect();
    
    const flights = await Flight.find({})
      .sort({ departureDateTime: 1 })
      .limit(100);

    return NextResponse.json(flights);
  } catch (error) {
    console.error('Error fetching all flights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flights' },
      { status: 500 }
    );
  }
}

// POST /api/flights - Create a new flight
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      flightId, 
      origin, 
      destination, 
      departureDateTime, 
      arrivalDateTime, 
      aircraftType, 
      capacity, 
      availableSpace 
    } = body;

    // Validation
    if (!flightId || !origin || !destination || !departureDateTime || !arrivalDateTime || !aircraftType || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if flight already exists
    const existingFlight = await Flight.findOne({ flightId });
    if (existingFlight) {
      return NextResponse.json(
        { error: 'Flight with this ID already exists' },
        { status: 400 }
      );
    }

    const flight = new Flight({
      flightId,
      origin,
      destination,
      departureDateTime: new Date(departureDateTime),
      arrivalDateTime: new Date(arrivalDateTime),
      aircraftType,
      capacity: Number.parseInt(capacity),
      availableSpace: availableSpace || Number.parseInt(capacity),
      status: 'SCHEDULED'
    });

    await flight.save();

    console.log(`✅ New flight created: ${flight.flightId}`);
    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error('🔥 Error creating flight:', error);
    return NextResponse.json(
      { error: 'Failed to create flight', details: error.message },
      { status: 500 }
    );
  }
}
