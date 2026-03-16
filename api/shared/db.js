const { MongoClient } = require('mongodb');

let client = null;
let db = null;

async function getDb() {
  if (db) return db;

  const connStr = process.env.COSMOS_CONNECTION_STRING;
  if (!connStr) throw new Error('COSMOS_CONNECTION_STRING not configured');

  client = new MongoClient(connStr);
  await client.connect();
  db = client.db('dragon-companion');
  return db;
}

function getUser(req) {
  const header = req.headers['x-ms-client-principal'];
  if (!header) return null;

  const decoded = JSON.parse(Buffer.from(header, 'base64').toString('utf8'));
  return {
    id: decoded.userId,
    provider: decoded.identityProvider,
    name: decoded.userDetails,
    roles: decoded.userRoles || []
  };
}

module.exports = { getDb, getUser };
