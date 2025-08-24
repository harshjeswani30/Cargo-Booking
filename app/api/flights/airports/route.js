import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Airport from '@/lib/models/Airport';

// GET /api/flights/airports - Get list of available airports from database
export async function GET() {
  try {
    await dbConnect();
    
    // Fetch airports from database
    const airports = await Airport.find({ isActive: true })
      .sort({ city: 1, code: 1 })
      .select('code name city country timezone coordinates')
      .limit(100);

    if (airports.length === 0) {
      return NextResponse.json(
        { error: 'No airports found in database. Please run the seeding script first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(airports);
  } catch (error) {
    console.error('Error fetching airports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airports' },
      { status: 500 }
    );
  }
}
