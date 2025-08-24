import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/lib/models/Client';

// GET /api/clients/[clientId] - Get specific client
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { clientId } = params;
    
    const client = await Client.findOne({ clientId }).select('-__v');
    
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(client);
    
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[clientId] - Update specific client
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { clientId } = params;
    const body = await request.json();
    
    // Find and update client
    const updatedClient = await Client.findOneAndUpdate(
      { clientId },
      { $set: body },
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Client updated: ${clientId}`);
    return NextResponse.json(updatedClient);
    
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[clientId] - Delete specific client
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { clientId } = params;
    
    const deletedClient = await Client.findOneAndDelete({ clientId });
    
    if (!deletedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    
    console.log(`✅ Client deleted: ${clientId}`);
    return NextResponse.json({ message: 'Client deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
