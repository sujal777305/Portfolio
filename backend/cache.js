const NodeCache = require('node-cache');

/**
 * Shared in-memory cache instance using node-cache
 * Standard TTL: 60 seconds (as required by Practical 9)
 */
const cache = new NodeCache({ stdTTL: 60 });

module.exports = cache;
