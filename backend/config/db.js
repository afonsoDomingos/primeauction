const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to prevent querySrv ECONNREFUSED on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // Ignore in restricted environments
}

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
      await Auction.updateMany(
        { $or: [{ taxRate: { $exists: false } }, { taxRate: null }] },
        { $set: { taxRate: 15, applyTax: true, taxInclusive: false } }
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
