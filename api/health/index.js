const { getDb } = require('../shared/db');

module.exports = async function (context, req) {
  try {
    const db = await getDb();
    // Try listing collections to verify connection
    const collections = await db.listCollections().toArray();
    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        status: 'ok',
        database: 'dragon-companion',
        collections: collections.map(c => c.name),
        cosmosConnected: true
      }
    };
  } catch (err) {
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        status: 'error',
        error: err.message,
        cosmosConnected: false
      }
    };
  }
};
