const cron = require('node-cron');
const newsAggregator = require('../services/newsAggregator');

/**
 * Scheduled job to refresh the news cache.
 * Runs every 30 minutes to keep articles fresh without
 * relying on user requests to trigger API calls.
 */
function startCacheRefreshJob() {
  const cronExpression = '*/30 * * * *'; // Every 30 minutes

  console.log('⏰ Cache refresh job scheduled (every 30 minutes)');

  // Run immediately on startup (but with a small delay so the server boots first)
  setTimeout(async () => {
    console.log('[Cron] Running initial cache warm-up...');
    try {
      await newsAggregator.refreshAllCaches();
    } catch (error) {
      console.error('[Cron] Initial cache warm-up failed:', error.message);
    }
  }, 5000);

  // Schedule recurring refresh
  cron.schedule(cronExpression, async () => {
    console.log(`[Cron] Cache refresh triggered at ${new Date().toISOString()}`);
    try {
      await newsAggregator.refreshAllCaches();
    } catch (error) {
      console.error('[Cron] Scheduled cache refresh failed:', error.message);
    }
  });
}

module.exports = { startCacheRefreshJob };
