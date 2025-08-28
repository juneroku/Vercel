const { MongoClient } = require('mongodb');

let client;
let clientPromise;

/**
 * Reuse the Mongo connection across serverless invocations.
 */
if (!global._mongoClientPromise) {
  if (!process.env.MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }
  client = new MongoClient(process.env.MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

async function getDb() {
  const dbName = process.env.DB_NAME || 'weatherdb';
  const cli = await clientPromise;
  return cli.db(dbName);
}

module.exports = { getDb };
