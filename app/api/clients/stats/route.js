import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/lib/models/Client';

// GET /api/clients/stats - Get client statistics
export async function GET() {
  try {
    await dbConnect();
    
    // Get basic counts
    const totalClients = await Client.countDocuments();
    const activeClients = await Client.countDocuments({ status: 'ACTIVE' });
    const inactiveClients = await Client.countDocuments({ status: 'INACTIVE' });
    const suspendedClients = await Client.countDocuments({ status: 'SUSPENDED' });
    
    // Get business type distribution
    const businessTypeStats = await Client.aggregate([
      { $group: { _id: '$businessType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get account type distribution
    const accountTypeStats = await Client.aggregate([
      { $group: { _id: '$accountType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentClients = await Client.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get top industries
    const industryStats = await Client.aggregate([
      { $match: { industry: { $exists: true, $ne: '' } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Get clients by country
    const countryStats = await Client.aggregate([
      { $match: { 'address.country': { $exists: true, $ne: '' } } },
      { $group: { _id: '$address.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Calculate average credit limit
    const creditLimitStats = await Client.aggregate([
      { $match: { creditLimit: { $gt: 0 } } },
      { $group: { 
        _id: null, 
        avgCreditLimit: { $avg: '$creditLimit' },
        maxCreditLimit: { $max: '$creditLimit' },
        minCreditLimit: { $min: '$creditLimit' }
      }}
    ]);
    
    const stats = {
      overview: {
        totalClients,
        activeClients,
        inactiveClients,
        suspendedClients,
        recentClients
      },
      businessTypes: businessTypeStats,
      accountTypes: accountTypeStats,
      industries: industryStats,
      countries: countryStats,
      creditLimits: creditLimitStats[0] || {
        avgCreditLimit: 0,
        maxCreditLimit: 0,
        minCreditLimit: 0
      },
      statusDistribution: {
        ACTIVE: activeClients,
        INACTIVE: inactiveClients,
        SUSPENDED: suspendedClients
      }
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client statistics' },
      { status: 500 }
    );
  }
}
