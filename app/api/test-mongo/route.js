import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variable is loaded
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return NextResponse.json({
        error: 'MONGODB_URI not found',
        envVars: Object.keys(process.env).filter(key => key.includes('MONGO')),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test basic connection without mongoose
    const { MongoClient } = await import('mongodb');
    
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    
    // Test basic operations
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    await client.close();

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      collections: collections.map(c => c.name),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MongoDB test failed:', error);
    
    return NextResponse.json({
      error: 'MongoDB connection failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
