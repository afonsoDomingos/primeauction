const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-migrate legacy auctions to have participationFee: 1000 if not set
    try {
      const Auction = require('../models/Auction');
      await Auction.updateMany(
        { $or: [{ participationFee: { $exists: false } }, { participationFee: null }] },
        { $set: { participationFee: 1000 } }
      );
    } catch (migErr) {
      console.error('Participation fee auto-migration notice:', migErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
