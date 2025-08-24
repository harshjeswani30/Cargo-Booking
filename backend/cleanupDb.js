const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const bookingsCollection = db.collection('bookings');

    // Check for documents with null refId
    const nullRefIdDocs = await bookingsCollection.find({ refId: null }).toArray();
    console.log(`Found ${nullRefIdDocs.length} documents with null refId`);

    // Delete documents with null refId
    if (nullRefIdDocs.length > 0) {
      const deleteResult = await bookingsCollection.deleteMany({ refId: null });
      console.log(`Deleted ${deleteResult.deletedCount} documents with null refId`);
    }

    // Check for documents with empty refId
    const emptyRefIdDocs = await bookingsCollection.find({ refId: '' }).toArray();
    console.log(`Found ${emptyRefIdDocs.length} documents with empty refId`);

    // Delete documents with empty refId
    if (emptyRefIdDocs.length > 0) {
      const deleteResult = await bookingsCollection.deleteMany({ refId: '' });
      console.log(`Deleted ${deleteResult.deletedCount} documents with empty refId`);
    }

    // Drop existing indexes and recreate them
    try {
      // Get existing indexes
      const indexes = await bookingsCollection.indexes();
      console.log('Existing indexes:', indexes.map(idx => idx.name));

      // Drop the problematic ref_id_1 index if it exists
      const hasRefIdIndex = indexes.some(idx => idx.name === 'ref_id_1');
      if (hasRefIdIndex) {
        await bookingsCollection.dropIndex('ref_id_1');
        console.log('Dropped ref_id_1 index');
      }

      // Create the correct refId index
      await bookingsCollection.createIndex({ refId: 1 }, { unique: true });
      console.log('Created refId index');

    } catch (indexError) {
      console.log('Index operations:', indexError.message);
    }

    // Update any documents missing refId
    const docsWithoutRefId = await bookingsCollection.find({ 
      $or: [
        { refId: { $exists: false } },
        { refId: null },
        { refId: '' }
      ]
    }).toArray();

    console.log(`Found ${docsWithoutRefId.length} documents without proper refId`);

    for (const doc of docsWithoutRefId) {
      const newRefId = `CRG${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      await bookingsCollection.updateOne(
        { _id: doc._id },
        { $set: { refId: newRefId } }
      );
      console.log(`Updated document ${doc._id} with refId: ${newRefId}`);
    }

    console.log('Database cleanup completed successfully!');

  } catch (error) {
    console.error('Database cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

cleanupDatabase();
