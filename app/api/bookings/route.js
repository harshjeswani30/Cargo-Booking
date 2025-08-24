import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Flight from '@/lib/models/Flight';

// GET /api/bookings - Get all bookings
export async function GET() {
  try {
    await dbConnect();
    
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { clientId, origin, destination, pieces, weightKg, flightIds } = body;

    // Validation
    if (!origin || !destination || !pieces || !weightKg) {
      return NextResponse.json(
        { error: 'Missing required fields: origin, destination, pieces, weightKg' },
        { status: 400 }
      );
    }

    // Validate flightIds if provided
    if (flightIds && Array.isArray(flightIds) && flightIds.length > 0) {
      const validFlights = await Flight.find({ flightId: { $in: flightIds } });
      if (validFlights.length !== flightIds.length) {
        return NextResponse.json(
          { error: 'One or more flight IDs are invalid' },
          { status: 400 }
        );
      }
    }

    const booking = new Booking({
      clientId: clientId || null, // Include clientId if provided
      origin,
      destination,
      pieces: Number.parseInt(pieces),
      weightKg: Number.parseFloat(weightKg),
      status: 'BOOKED',
      flightIds: flightIds || [],
    });

    await booking.save();

    console.log(`✅ New booking created: ${booking.refId}`);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('🔥 Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings - Delete a booking by refId
export async function DELETE(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const refId = searchParams.get('refId');
    
    if (!refId) {
      return NextResponse.json(
        { error: 'Missing refId parameter' },
        { status: 400 }
      );
    }

    // Find and delete the booking
    const deletedBooking = await Booking.findOneAndDelete({ refId });
    
    if (!deletedBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Booking deleted: ${refId}`);
    return NextResponse.json(
      { message: 'Booking deleted successfully', deletedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking', details: error.message },
      { status: 500 }
    );
  }
}
