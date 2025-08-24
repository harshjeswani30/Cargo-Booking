import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/lib/models/Client';

// GET /api/clients - Get all clients
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const businessType = searchParams.get('businessType') || '';
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { 'contactPerson.firstName': { $regex: search, $options: 'i' } },
        { 'contactPerson.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (businessType) {
      query.businessType = businessType;
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [clients, total] = await Promise.all([
      Client.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v'),
      Client.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      businessType,
      industry,
      accountType,
      creditLimit,
      paymentTerms,
      notes,
      preferences
    } = body;
    
    // Validation
    if (!companyName || !contactPerson?.firstName || !contactPerson?.lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName, contactPerson (firstName, lastName), email, phone' },
        { status: 400 }
      );
    }
    
    // Check if client with email already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      return NextResponse.json(
        { error: 'Client with this email already exists' },
        { status: 400 }
      );
    }
    
    // Create new client
    const client = new Client({
      companyName,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      address,
      businessType,
      industry,
      accountType,
      creditLimit: creditLimit || 0,
      paymentTerms,
      notes,
      preferences
    });
    
    await client.save();
    
    console.log(`✅ New client created: ${client.clientId}`);
    return NextResponse.json(client, { status: 201 });
    
  } catch (error) {
    console.error('🔥 Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client', details: error.message },
      { status: 500 }
    );
  }
}
