const cron = require('node-cron');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

const startCronJobs = (io) => {
  // Run every 10 seconds to detect expired auctions immediately
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const now = new Date();
      const expiredAuctions = await Auction.find({
        endTime: { $lt: now },
        status: 'active'
      });

      for (const auction of expiredAuctions) {
        const highestBid = await Bid.findOne({ auction: auction._id })
          .sort('-amount')
          .populate({ path: 'user', select: 'name email' });
          
        auction.status = 'finished';
        if (highestBid) {
          auction.winner = highestBid.user._id;
        }
        await auction.save();
        
        console.log(`[CRON] Auction "${auction.title}" ended. Winner: ${highestBid ? highestBid.user.name : 'No bids'}`);

        // Emit socket event to notify clients that this auction has finished
        if (io) {
          io.to(auction._id.toString()).emit('auction_ended', {
            auctionId: auction._id,
            status: 'finished',
            winner: highestBid ? { name: highestBid.user.name, email: highestBid.user.email } : null,
            winningBid: highestBid ? highestBid.amount : 0
          });
        }
      }
    } catch (err) {
      console.error('[CRON] Error in auction expiration checker:', err);
    }
  });
};

module.exports = startCronJobs;
