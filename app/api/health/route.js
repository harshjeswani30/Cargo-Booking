import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

// GET /api/health - Health check endpoint
export async function GET() {
  try {
    // Check database connection
    await dbConnect();
    const dbStatus = 'connected';

    // Check database response time
    const start = Date.now();
    const connection = await dbConnect();
    if (connection.connection.db) {
      await connection.connection.db.admin().ping();
    }
    const dbResponseTime = Date.now() - start;

    const healthData = {
      status: 'OK',
      message: 'Air Cargo API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        responseTime: `${dbResponseTime}ms`,
      },
      system: {
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        },
        environment: process.env.NODE_ENV || 'development'
      }
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        message: 'Health check failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
