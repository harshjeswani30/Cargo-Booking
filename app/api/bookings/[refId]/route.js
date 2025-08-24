import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

// GET /api/bookings/[refId] - Get booking by reference ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { refId } = params;
    const booking = await Booking.findOne({ refId });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[refId] - Update booking
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { refId } = params;
    const body = await request.json();
    
    const booking = await Booking.findOne({ refId });
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['status', 'flightIds', 'timeline'];
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        booking[field] = body[field];
      }
    });

    await booking.save();
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[refId] - Delete booking
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { refId } = params;
    const booking = await Booking.findOne({ refId });
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    await Booking.deleteOne({ refId });
    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
