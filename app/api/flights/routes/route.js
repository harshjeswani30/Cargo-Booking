import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Flight from '@/lib/models/Flight';

// GET /api/flights/routes - Search routes (direct + 1-transit)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('departureDate');

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Parse departure date
    const targetDate = new Date(departureDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Find direct flights
    const directFlights = await Flight.find({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ departureDateTime: 1 });

    // Find transit routes (1-stop)
    const transitRoutes = [];
    
    // Find flights from origin to any intermediate airport
    const outboundFlights = await Flight.find({
      origin: origin.toUpperCase(),
      departureDateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Find flights from intermediate airports to destination
    const inboundFlights = await Flight.find({
      destination: destination.toUpperCase(),
      departureDateTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Create transit routes (simplified logic)
    for (const outbound of outboundFlights) {
      for (const inbound of inboundFlights) {
        // Check if there's a reasonable layover time (2-8 hours)
        const outboundArrival = new Date(outbound.arrivalDateTime);
        const inboundDeparture = new Date(inbound.departureDateTime);
        const layoverHours = (inboundDeparture - outboundArrival) / (1000 * 60 * 60);
        
        if (layoverHours >= 2 && layoverHours <= 8) {
          const totalDuration = layoverHours + 
            (new Date(outbound.arrivalDateTime) - new Date(outbound.departureDateTime)) / (1000 * 60 * 60) +
            (new Date(inbound.arrivalDateTime) - new Date(inbound.departureDateTime)) / (1000 * 60 * 60);
          
          transitRoutes.push({
            firstFlight: outbound,
            secondFlight: inbound,
            totalDuration: Math.round(totalDuration * 10) / 10,
            layoverHours: Math.round(layoverHours * 10) / 10
          });
        }
      }
    }

    // Limit transit routes to top 5
    transitRoutes.sort((a, b) => a.totalDuration - b.totalDuration);
    const limitedTransitRoutes = transitRoutes.slice(0, 5);

    return NextResponse.json({
      directFlights,
      transitRoutes: limitedTransitRoutes,
      searchParams: { origin, destination, departureDate }
    });

  } catch (error) {
    console.error('Error searching routes:', error);
    return NextResponse.json(
      { error: 'Failed to search routes', details: error.message },
      { status: 500 }
    );
  }
}
