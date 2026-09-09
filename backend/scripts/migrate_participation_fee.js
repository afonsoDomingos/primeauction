const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Auction = require('../models/Auction');

const migrate = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/primeauction';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for migration.');

    const result = await Auction.updateMany(
      { $or: [{ participationFee: { $exists: false } }, { participationFee: null }] },
      { $set: { participationFee: 1000, participants: [] } }
    );

    console.log(`Migration complete. Updated ${result.modifiedCount} auctions with participationFee = 1000 MT.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
